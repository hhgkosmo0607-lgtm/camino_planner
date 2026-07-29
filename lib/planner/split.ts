/**
 * lib/planner/split.ts — 부상 회피형 구간 분할 엔진 (F-01)
 *
 * ★ 목표는 "최단 일수"가 아니라 "부상 없는 완주 확률"이다.
 *   무리한 일정을 능동적으로 교정한다.
 *
 * ★ 고도는 반드시 data/profiles.ts(SegmentProfile)에서 읽는다.
 *   towns.elevation 을 빼서 오르막을 구하지 않는다 (CLAUDE.md 규칙 3, 최대 39% 오차).
 *
 * 순수 함수. fetch/window/localStorage 참조 없음. 정적 데이터만 import.
 */

import type {
  SegmentProfile,
  PlanInput,
  Stage,
  Plan,
  StageWarning,
  TravelMode,
  Waypoint,
  WaypointKind,
  Hazard,
  Service,
} from '../schema'
import type { AccumulatedProfile } from './types'
import { injuryRiskScore, riskDataQuality, riskAdvice } from './risk'
import { assessCongestion } from './congestion'
import { totalBedsForTown } from '../geo'
import { towns as ALL_TOWNS } from '../../data/towns'
import { profiles as ALL_PROFILES } from '../../data/profiles'
import { exposedStretches, type ExposedStretch } from '../../data/exposed_stretches'

// ── 튜닝 파라미터 ─────────────────────────────────────────────
const DEFAULT_DAILY_KM = 24
const FITNESS_MULT: Record<PlanInput['fitness'], number> = { low: 0.85, normal: 1.0, high: 1.15 }
const EARLY_DAYS = 3
const EARLY_ADAPT = 0.8 // 1~3일차 목표 ×0.8
const CLIMB_ADJUST = 0.85 // 다음 구간 상승 600m 초과 시 ×0.85
const RECOVERY_ADJUST = 0.85 // 힘든 날 다음 날 ×0.85
const CLIMB_THRESHOLD = 600 // STEEP_CLIMB / 회복 트리거
const DESCENT_THRESHOLD = 500 // STEEP_DESCENT / 회복 트리거
const ROAD_SHARE_THRESHOLD = 0.5 // ROAD_WALKING — profiles.ts roadShareRatio 절반 이상이면 차도 병행 구간으로 표시
const WINTER_RISK_ELEVATION_M = 1300 // WINTER_RISK — 실제 프로파일 상 고개 7곳(피레네·폰세바돈·오 세브레이로 등)이 이 위, 그다음 구간은 1164m 이하로 뚝 떨어짐(2026-07-28 profiles.ts 실측 분포 확인)
const WINTER_RISK_MONTHS = new Set([11, 12, 1, 2, 3]) // 11~3월
const LONG_DISTANCE = 28
const FEW_BEDS = 30
const NO_SERVICE_GAP = 10 // 물·식당 없는 거리 km
const REST_TOWN_MIN_BEDS = 150
const MERGE_LAST_UNDER = 6 // 마지막 구간 < 6km 병합

// 콤포스텔라 최소 거리 (2025 개정)
const COMPOSTELA_MIN: Partial<Record<TravelMode, number>> = {
  FOOT: 100,
  HORSE: 100,
  BIKE: 200,
  HANDBIKE: 100, // 확인 필요 — 잠정 100
  WHEELCHAIR: 100, // 확인 필요 — 잠정 100
  // E_BIKE 는 대상 아님 → 항상 불가
}

// ── 데이터 인덱스 ─────────────────────────────────────────────
const TOWN_INDEX: Map<string, number> = new Map(ALL_TOWNS.map((t, i) => [t.id, i]))
const PROFILE_INDEX: Map<string, SegmentProfile> = new Map(
  ALL_PROFILES.map((p) => [`${p.fromTownId}->${p.toTownId}`, p]),
)

function townIdx(id: string): number {
  const i = TOWN_INDEX.get(id)
  if (i === undefined) throw new Error(`알 수 없는 마을 id: ${id}`)
  return i
}

// EXPOSED(그늘 없음) — data/exposed_stretches.ts(Gronze.com Al Loro 근거, GUIDEBOOK)를
// km 범위로 미리 변환해둔다. 마을쌍 프로파일이 아니라 공식 구간 단위 데이터라
// ROAD_WALKING/WINTER_RISK와 달리 km 겹침으로 판정한다.
interface ExposedRange {
  fromKm: number
  toKm: number
  stretch: ExposedStretch
}
const EXPOSED_RANGES: ExposedRange[] = exposedStretches.map((s) => ({
  fromKm: ALL_TOWNS[townIdx(s.fromTownId)].km,
  toKm: ALL_TOWNS[townIdx(s.toTownId)].km,
  stretch: s,
}))

/**
 * 마을 구간 [fromIdx, toIdx] 의 누적 고도. profiles(연속 마을쌍)를 이어 합산한다.
 * ★ towns.elevation 은 절대 쓰지 않는다.
 */
export function accumulateProfile(fromIdx: number, toIdx: number): AccumulatedProfile {
  let ascent = 0
  let descent = 0
  let maxElevation = 0
  let maxGradient = 0
  let source: SegmentProfile['source'] = 'OSM+EUDEM'
  for (let i = fromIdx; i < toIdx; i++) {
    const key = `${ALL_TOWNS[i].id}->${ALL_TOWNS[i + 1].id}`
    const p = PROFILE_INDEX.get(key)
    if (!p) {
      // 구간 프로파일이 없으면 위험을 과소평가하지 않도록 ESTIMATED 로 표시
      source = 'ESTIMATED'
      continue
    }
    ascent += p.ascent
    descent += p.descent
    maxElevation = Math.max(maxElevation, p.maxElevation)
    maxGradient = Math.max(maxGradient, p.maxGradient)
    if (p.source === 'ESTIMATED') source = 'ESTIMATED'
  }
  return { ascent, descent, maxElevation, maxGradient, source }
}

const round1 = (n: number) => Math.round(n * 10) / 10

function estimatedMinutes(distanceKm: number, ascent: number, descent: number): number {
  return Math.round((distanceKm / 4.2) * 60 + ascent / 8 + descent / 20)
}

// ── 서비스 공백 (NO_SERVICES 경고) ────────────────────────────
function maxServiceGapKm(fromIdx: number, toIdx: number): number {
  // 물(WATER) 또는 바(BAR)가 있는 마을 사이 최대 거리
  let lastServiceKm = ALL_TOWNS[fromIdx].km
  let gap = 0
  for (let i = fromIdx; i <= toIdx; i++) {
    const t = ALL_TOWNS[i]
    const hasService = t.services.includes('WATER') || t.services.includes('BAR')
    if (hasService) {
      gap = Math.max(gap, t.km - lastServiceKm)
      lastServiceKm = t.km
    }
  }
  gap = Math.max(gap, ALL_TOWNS[toIdx].km - lastServiceKm)
  return gap
}

// ── 일자별 상세: 거점(F-20) ───────────────────────────────────
// Service → WaypointKind로 직접 대응되는 것만 표시한다(SHOP/MEDICAL/MASS는
// 대응되는 WaypointKind가 없어 지어내지 않고 뺀다).
const SERVICE_TO_WAYPOINT: Partial<Record<Service, WaypointKind>> = {
  WATER: 'WATER',
  PHARMACY: 'PHARMACY',
  ATM: 'ATM',
  BAG_TRANSFER: 'BAG_DROP',
}
const WAYPOINT_LABEL: Partial<Record<WaypointKind, string>> = {
  WATER: '식수',
  PHARMACY: '약국',
  ATM: 'ATM',
  BAG_DROP: '짐 배송 접수',
}

/** 구간 [fromIdx, toIdx]의 거점 목록. 시작·도착 + 중간 마을의 서비스(WATER/PHARMACY/ATM/BAG_TRANSFER)만. */
function buildWaypoints(fromIdx: number, toIdx: number, totalMinutes: number): Waypoint[] {
  const from = ALL_TOWNS[fromIdx]
  const to = ALL_TOWNS[toIdx]
  const totalKm = to.km - from.km
  const etaAt = (km: number) => (totalKm > 0 ? Math.round((km / totalKm) * totalMinutes) : 0)

  const waypoints: Waypoint[] = [
    { kind: 'START', townId: from.id, km: 0, etaMinutes: 0, labelKo: `${from.nameKo} 출발`, noteKo: null, opensAt: null },
  ]

  for (let i = fromIdx + 1; i < toIdx; i++) {
    const t = ALL_TOWNS[i]
    const relKm = round1(t.km - from.km)
    for (const service of t.services) {
      const kind = SERVICE_TO_WAYPOINT[service]
      if (!kind) continue
      waypoints.push({
        kind,
        townId: t.id,
        km: relKm,
        etaMinutes: etaAt(relKm),
        labelKo: `${t.nameKo} · ${WAYPOINT_LABEL[kind]}`,
        noteKo: null,
        opensAt: null,
      })
    }
  }

  // STAMP: 마을별 정확한 도장 위치는 조사하지 않는다(숙소·성당·바 어디서나 거의 다
  // 찍어줘서 마을마다 특정 위치를 못박을 실익이 적다) — 일반 안내만 덧붙인다.
  // ARRIVE보다 앞에 둔다 — "걷는 날은 ARRIVE로 끝난다" 불변식을 유지하기 위해서다.
  waypoints.push({
    kind: 'STAMP',
    townId: to.id,
    km: round1(totalKm),
    etaMinutes: totalMinutes,
    labelKo: `${to.nameKo} · 세요(도장)`,
    noteKo: '묵는 알베르게·성당·시청·바 어디서든 대부분 찍어줍니다. 크레덴시알을 잊지 마세요.',
    opensAt: null,
  })

  waypoints.push({
    kind: 'ARRIVE',
    townId: to.id,
    km: round1(totalKm),
    etaMinutes: totalMinutes,
    labelKo: `${to.nameKo} 도착`,
    noteKo: null,
    opensAt: null,
  })
  return waypoints
}

/** 구간 [fromIdx, toIdx]의 위험 구간. 실제 보유 데이터(고도·서비스·차도 비율·Gronze Al Loro 그늘 서술)로만 판정 — 통신 두절은 프랑스 길 체계적 자료가 없어 표시하지 않는다. */
function buildHazards(fromIdx: number, toIdx: number): Hazard[] {
  const from = ALL_TOWNS[fromIdx]
  const hazards: Hazard[] = []

  // STEEP_DESCENT: 마을쌍 프로파일의 하강이 임계치를 넘는 구간
  for (let i = fromIdx; i < toIdx; i++) {
    const a = ALL_TOWNS[i]
    const b = ALL_TOWNS[i + 1]
    const p = PROFILE_INDEX.get(`${a.id}->${b.id}`)
    if (!p || p.descent <= DESCENT_THRESHOLD) continue
    hazards.push({
      type: 'STEEP_DESCENT',
      fromKm: round1(a.km - from.km),
      toKm: round1(b.km - from.km),
      noteKo: `${a.nameKo}→${b.nameKo} 급경사 내리막 −${Math.round(p.descent)}m. 무릎 부담 큼 — 스틱 사용·보폭 축소 권장.`,
    })
  }

  // ROAD_WALKING: 마을쌍 프로파일의 차도 병행 비율(roadShareRatio)이 임계치를 넘는 구간
  for (let i = fromIdx; i < toIdx; i++) {
    const a = ALL_TOWNS[i]
    const b = ALL_TOWNS[i + 1]
    const p = PROFILE_INDEX.get(`${a.id}->${b.id}`)
    if (!p || p.roadShareRatio === null || p.roadShareRatio < ROAD_SHARE_THRESHOLD) continue
    hazards.push({
      type: 'ROAD_WALKING',
      fromKm: round1(a.km - from.km),
      toKm: round1(b.km - from.km),
      noteKo: `${a.nameKo}→${b.nameKo} 구간의 약 ${Math.round(p.roadShareRatio * 100)}%가 차도 병행. 갓길·역광 주의, 가능하면 반사 조끼 착용.`,
    })
  }

  // WINTER_RISK: 마을쌍 프로파일의 최고점이 임계 고도를 넘는 구간. 이 시점엔 실제 여행 날짜를
  // 아직 모른다(dayNo가 휴식일 삽입으로 재조정되기 전) — 그래서 "이번 여행이 겨울철이다"라고
  // 단정하지 않고, 고지대라는 사실 자체와 11~3월 일반 위험만 안내하는 문구로 둔다.
  for (let i = fromIdx; i < toIdx; i++) {
    const a = ALL_TOWNS[i]
    const b = ALL_TOWNS[i + 1]
    const p = PROFILE_INDEX.get(`${a.id}->${b.id}`)
    if (!p || p.maxElevation < WINTER_RISK_ELEVATION_M) continue
    hazards.push({
      type: 'WINTER_RISK',
      fromKm: round1(a.km - from.km),
      toKm: round1(b.km - from.km),
      noteKo: `${a.nameKo}→${b.nameKo} 구간 최고점 약 ${Math.round(p.maxElevation)}m. 11~3월에는 결빙·적설 위험 — 방한장비 필수, 당일 현지(순례자 사무소·알베르게) 안내를 따른다.`,
    })
  }

  // EXPOSED: 그늘 없음이 확인된 공식 구간(data/exposed_stretches.ts, Gronze.com Al Loro
  // 근거)과 오늘 걷는 구간이 겹치는 부분. 공식 33구간 단위 데이터라 마을쌍 프로파일이
  // 아니라 km 범위 겹침으로 판정한다(ROAD_WALKING/WINTER_RISK와 다른 이유).
  const toKmTotal = ALL_TOWNS[toIdx].km
  for (const range of EXPOSED_RANGES) {
    const overlapFromKm = Math.max(from.km, range.fromKm)
    const overlapToKm = Math.min(toKmTotal, range.toKm)
    if (overlapFromKm >= overlapToKm) continue
    const stretchFrom = ALL_TOWNS[townIdx(range.stretch.fromTownId)]
    const stretchTo = ALL_TOWNS[townIdx(range.stretch.toTownId)]
    hazards.push({
      type: 'EXPOSED',
      fromKm: round1(overlapFromKm - from.km),
      toKm: round1(overlapToKm - from.km),
      noteKo: `${stretchFrom.nameKo}→${stretchTo.nameKo} 구간은 그늘이 거의 없다고 알려져 있습니다. 여름엔 아침 일찍 출발하고 물을 충분히 챙기세요.`,
    })
  }

  // NO_WATER: 물/바가 있는 마을 사이 간격이 임계치를 넘는 구간
  let lastServiceKm = from.km
  for (let i = fromIdx; i <= toIdx; i++) {
    const t = ALL_TOWNS[i]
    const hasService = t.services.includes('WATER') || t.services.includes('BAR')
    if (!hasService) continue
    const gap = t.km - lastServiceKm
    if (gap > NO_SERVICE_GAP) {
      hazards.push({
        type: 'NO_WATER',
        fromKm: round1(lastServiceKm - from.km),
        toKm: round1(t.km - from.km),
        noteKo: `약 ${round1(gap)}km 구간에 물·식당이 없습니다. 출발 전 미리 채우세요.`,
      })
    }
    lastServiceKm = t.km
  }
  const finalGap = ALL_TOWNS[toIdx].km - lastServiceKm
  if (finalGap > NO_SERVICE_GAP) {
    hazards.push({
      type: 'NO_WATER',
      fromKm: round1(lastServiceKm - from.km),
      toKm: round1(ALL_TOWNS[toIdx].km - from.km),
      noteKo: `약 ${round1(finalGap)}km 구간에 물·식당이 없습니다. 출발 전 미리 채우세요.`,
    })
  }

  return hazards.sort((x, y) => x.fromKm - y.fromKm)
}

// ── 목표 지점에 가장 가까운 '숙소 있는' 마을 찾기 ──────────────
function nearestLodgingIdx(curIdx: number, targetKm: number, endIdx: number): number {
  let best = -1
  let bestDiff = Infinity
  for (let i = curIdx + 1; i <= endIdx; i++) {
    if (i !== endIdx && ALL_TOWNS[i].beds <= 0) continue // 산티아고(끝)는 예외
    const diff = Math.abs(ALL_TOWNS[i].km - targetKm)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return best < 0 ? endIdx : best // 앞에 숙소 없으면 산티아고까지
}

interface RawStage {
  fromIdx: number
  toIdx: number
  transport: PlanInput['plannedTransport'][number] | null
}

/**
 * 계획된 이동수단 구간을 (fromId→toId) 로 조회.
 * cur 에서 시작하는 이동수단이 있으면 반환.
 */
function transportFrom(input: PlanInput, curId: string) {
  return input.plannedTransport.find((t) => t.fromTownId === curId) ?? null
}

/** 탐욕 분할(매 구간마다 그 순간 목표 거리에 가장 가까운 마을을 바로 선택하는 방식 — 전체를 다시 계산하지 않아 빠르다) + 부상 회피 후처리로 RawStage 목록을 만든다. */
function buildRawStages(input: PlanInput): RawStage[] {
  const startIdx = townIdx(input.startTownId)
  const endIdx = ALL_TOWNS.length - 1
  const startKm = ALL_TOWNS[startIdx].km
  const totalDist = ALL_TOWNS[endIdx].km - startKm

  // 하루 기본 목표 거리
  let base: number
  if (input.targetKmPerDay && input.targetKmPerDay > 0) {
    base = input.targetKmPerDay
  } else if (input.totalDays && input.totalDays > 0) {
    const walkingDays = Math.max(1, input.totalDays - input.restDays)
    base = totalDist / walkingDays
  } else {
    base = DEFAULT_DAILY_KM
  }
  base *= FITNESS_MULT[input.fitness]
  // 이동 방식의 하루 상한을 넘지 않는다 (하한은 두지 않는다 — CLAUDE.md)
  const cap = input.mobility.maxKmPerDay > 0 ? input.mobility.maxKmPerDay : 40
  base = Math.min(base, cap)

  // 계획된 이동수단의 출발 마을은 '반드시 들르는' 정차점이다.
  // 탐욕 분할이 이 마을을 지나치면 이동수단이 발동하지 않으므로(F-26 버그),
  // 도착지가 정차점을 넘어가면 정차점으로 당겨 세운다.
  const transportOrigins = input.plannedTransport
    .map((t) => TOWN_INDEX.get(t.fromTownId))
    .filter((i): i is number => i !== undefined)
    .sort((a, b) => a - b)

  const raw: RawStage[] = []
  let cur = startIdx
  let dayNo = 0
  let prevHard = false
  let guard = 0

  while (cur < endIdx && guard++ < 500) {
    // 계획된 이동수단이 이 지점에서 시작하면 그대로 점프
    const tr = transportFrom(input, ALL_TOWNS[cur].id)
    if (tr) {
      const toI = townIdx(tr.toTownId)
      if (toI > cur) {
        raw.push({ fromIdx: cur, toIdx: toI, transport: tr })
        cur = toI
        continue
      }
    }

    dayNo++
    let factor = 1.0
    if (dayNo <= EARLY_DAYS) factor *= EARLY_ADAPT // (a) 초반 적응
    if (prevHard) factor *= RECOVERY_ADJUST // (c) 회복 배치

    // (b) 오르막 보정: 잠정 도착지의 상승을 보고, 600m 초과면 한 번 더 줄인다
    const provIdx = nearestLodgingIdx(cur, ALL_TOWNS[cur].km + base * factor, endIdx)
    const provProfile = accumulateProfile(cur, provIdx)
    if (provProfile.ascent > CLIMB_THRESHOLD) factor *= CLIMB_ADJUST

    const destIdx = nearestLodgingIdx(cur, ALL_TOWNS[cur].km + base * factor, endIdx)
    let finalIdx = destIdx > cur ? destIdx : Math.min(cur + 1, endIdx) // 항상 전진 보장

    // 정차점(이동수단 출발지)을 넘어가면 그 앞에서 세운다
    const stop = transportOrigins.find((i) => i > cur && i < finalIdx)
    if (stop !== undefined) finalIdx = stop

    const prof = accumulateProfile(cur, finalIdx)
    prevHard = prof.ascent > CLIMB_THRESHOLD || prof.descent > DESCENT_THRESHOLD

    raw.push({ fromIdx: cur, toIdx: finalIdx, transport: null })
    cur = finalIdx
  }

  // (e) 마지막 구간 < 6km → 직전 도보 구간에 병합
  if (raw.length > 1) {
    const last = raw[raw.length - 1]
    const dist = ALL_TOWNS[last.toIdx].km - ALL_TOWNS[last.fromIdx].km
    if (!last.transport && dist < MERGE_LAST_UNDER) {
      // 직전 도보 구간을 찾아 병합
      for (let i = raw.length - 2; i >= 0; i--) {
        if (!raw[i].transport) {
          raw[i].toIdx = last.toIdx
          raw.splice(i + 1)
          break
        }
      }
    }
  }

  return raw
}

// ── 경고 산출 ─────────────────────────────────────────────────
function warningsFor(
  dayNo: number,
  fromIdx: number,
  toIdx: number,
  distanceKm: number,
  prof: AccumulatedProfile,
  base: number,
): StageWarning[] {
  const w: StageWarning[] = []
  if (prof.ascent > CLIMB_THRESHOLD) w.push('STEEP_CLIMB')
  if (prof.descent > DESCENT_THRESHOLD) w.push('STEEP_DESCENT')
  if (distanceKm > LONG_DISTANCE) w.push('LONG_DISTANCE')
  if (ALL_TOWNS[toIdx].beds > 0 && ALL_TOWNS[toIdx].beds < FEW_BEDS) w.push('FEW_BEDS')
  if (maxServiceGapKm(fromIdx, toIdx) > NO_SERVICE_GAP) w.push('NO_SERVICES')
  if (dayNo <= EARLY_DAYS && (distanceKm > base || prof.ascent > 500)) w.push('EARLY_OVERLOAD')
  return w
}

/**
 * 메인 진입점. PlanInput → Plan.
 * Phase 1: 단일 선형 경로(변형 없음), 도보 중심. variantId 는 항상 null.
 */
export function buildPlan(input: PlanInput): Plan {
  const raw = buildRawStages(input)
  const endIdx = ALL_TOWNS.length - 1
  const startIdx = townIdx(input.startTownId)
  const startKm = ALL_TOWNS[startIdx].km

  // 기본 목표(경고 EARLY_OVERLOAD 기준용) 재계산
  const totalDist = ALL_TOWNS[endIdx].km - startKm
  let base: number
  if (input.targetKmPerDay && input.targetKmPerDay > 0) base = input.targetKmPerDay
  else if (input.totalDays && input.totalDays > 0)
    base = totalDist / Math.max(1, input.totalDays - input.restDays)
  else base = DEFAULT_DAILY_KM
  base *= FITNESS_MULT[input.fitness]

  const stages: Stage[] = []
  const allSources: SegmentProfile['source'][] = []
  let dayNo = 0

  for (const r of raw) {
    dayNo++
    const from = ALL_TOWNS[r.fromIdx]
    const to = ALL_TOWNS[r.toIdx]
    const distanceKm = round1(to.km - from.km)

    if (r.transport) {
      // 계획된 이동수단 구간 — 걷지 않는다
      stages.push({
        dayNo,
        date: null,
        fromTownId: from.id,
        toTownId: to.id,
        variantId: null,
        distanceKm,
        ascent: 0,
        descent: 0,
        maxElevation: 0,
        estimatedMinutes: 0,
        suggestedStartTime: '',
        waypoints: [],
        hazards: [],
        lodgingId: null,
        transport: r.transport,
        warnings: [],
        isRestDay: false,
        congestion: null,
      })
      continue
    }

    const prof = accumulateProfile(r.fromIdx, r.toIdx)
    allSources.push(prof.source)
    const dayMinutes = estimatedMinutes(distanceKm, prof.ascent, prof.descent)
    stages.push({
      dayNo,
      date: null,
      fromTownId: from.id,
      toTownId: to.id,
      variantId: null,
      distanceKm,
      ascent: prof.ascent,
      descent: prof.descent,
      maxElevation: prof.maxElevation,
      estimatedMinutes: dayMinutes,
      suggestedStartTime: prof.ascent > CLIMB_THRESHOLD ? '06:30' : '07:00',
      waypoints: buildWaypoints(r.fromIdx, r.toIdx, dayMinutes),
      hazards: buildHazards(r.fromIdx, r.toIdx),
      lodgingId: null,
      transport: null,
      warnings: warningsFor(dayNo, r.fromIdx, r.toIdx, distanceKm, prof, base),
      isRestDay: false,
      congestion: null,
    })
  }

  // (d) 휴식일 배치 — beds >= 150 인 큰 도시 도착일 뒤에 삽입
  insertRestDays(stages, input.restDays)
  // dayNo가 최종 확정된 뒤에만 날짜·혼잡도를 계산할 수 있다(F-02)
  finalizeDatesAndCongestion(stages, input.startDate)

  // 거리 집계
  const walkedKm = round1(
    stages.filter((s) => !s.transport && !s.isRestDay).reduce((a, s) => a + s.distanceKm, 0),
  )
  const transportedKm = round1(
    stages.filter((s) => s.transport).reduce((a, s) => a + s.distanceKm, 0),
  )
  const totalKm = round1(walkedKm + transportedKm)

  // 콤포스텔라: 산티아고 직전까지 '연속으로 걸은' 거리 기준 (이동수단이 끼면 끊긴다)
  const continuousWalked = continuousWalkedToSantiago(stages)
  const minDist = COMPOSTELA_MIN[input.mobility.mode]
  const compostelaEligible =
    input.mobility.mode !== 'E_BIKE' && minDist !== undefined && continuousWalked >= minDist

  // 도장 규칙: ★ 위치가 아니라 총 도보 거리 기준.
  // 최소 거리만 걷는 경우(최소치의 1.5배 이내)만 하루 2개.
  const doubleStampPerDay =
    compostelaEligible && minDist !== undefined && continuousWalked <= minDist * 1.5

  const quality = riskDataQuality(allSources)
  const score = injuryRiskScore(stages)

  return {
    stages,
    totalKm,
    walkedKm,
    totalDays: stages.length,
    compostelaEligible,
    doubleStampPerDay,
    injuryRiskScore: score,
    riskDataQuality: quality,
    advice: riskAdvice(score, quality),
  }
}

/** 산티아고에서 뒤로 가며 이동수단을 만날 때까지의 연속 도보 거리. */
function continuousWalkedToSantiago(stages: Stage[]): number {
  let sum = 0
  for (let i = stages.length - 1; i >= 0; i--) {
    const s = stages[i]
    if (s.isRestDay) continue
    if (s.transport) break
    sum += s.distanceKm
  }
  return round1(sum)
}

/** 큰 도시(beds>=150) 도착일 뒤에 휴식일을 삽입한다. dayNo 재부여. */
function insertRestDays(stages: Stage[], restDays: number): void {
  if (restDays <= 0) return
  // 후보: 큰 도시에 도착한 도보 구간 (마지막 날 제외)
  const candidates: number[] = []
  for (let i = 0; i < stages.length - 1; i++) {
    const s = stages[i]
    if (s.transport || s.isRestDay) continue
    const toIdx = TOWN_INDEX.get(s.toTownId)
    if (toIdx !== undefined && ALL_TOWNS[toIdx].beds >= REST_TOWN_MIN_BEDS) candidates.push(i)
  }
  // 여정 전체에 고르게 분산
  const picks: number[] = []
  const n = Math.min(restDays, candidates.length)
  for (let k = 0; k < n; k++) {
    const target = Math.floor(((k + 1) / (n + 1)) * candidates.length)
    const idx = candidates[Math.min(target, candidates.length - 1)]
    if (!picks.includes(idx)) picks.push(idx)
  }
  // 뒤에서부터 삽입해야 인덱스가 안 밀린다
  picks.sort((a, b) => b - a)
  for (const at of picks) {
    const town = ALL_TOWNS[TOWN_INDEX.get(stages[at].toTownId)!]
    stages.splice(at + 1, 0, {
      dayNo: 0,
      date: null,
      fromTownId: town.id,
      toTownId: town.id,
      variantId: null,
      distanceKm: 0,
      ascent: 0,
      descent: 0,
      maxElevation: 0,
      estimatedMinutes: 0,
      suggestedStartTime: '',
      waypoints: [],
      hazards: [],
      lodgingId: null,
      transport: null,
      warnings: [],
      isRestDay: true,
      congestion: null,
    })
  }
  stages.forEach((s, i) => (s.dayNo = i + 1))
}

/** "YYYY-MM-DD" + dayNo(1부터) → 그 날짜의 UTC 자정 Date. startDate 없으면 null. */
function dateForDayNo(startDate: string | undefined, dayNo: number): Date | null {
  if (!startDate) return null
  const d = new Date(startDate + 'T00:00:00Z')
  if (Number.isNaN(d.getTime())) return null
  d.setUTCDate(d.getUTCDate() + (dayNo - 1))
  return d
}

/**
 * dayNo 확정(휴식일 삽입으로 재부여됨) 이후에만 호출할 수 있다 — date가
 * dayNo에 의존하기 때문. 도보 구간만 congestion을 채운다.
 */
function finalizeDatesAndCongestion(stages: Stage[], startDate: string | undefined): void {
  for (const s of stages) {
    const d = dateForDayNo(startDate, s.dayNo)
    s.date = d ? d.toISOString().slice(0, 10) : null
    if (s.isRestDay || s.transport) continue
    const toIdx = TOWN_INDEX.get(s.toTownId)
    const townKm = toIdx !== undefined ? ALL_TOWNS[toIdx].km : 0
    s.congestion = assessCongestion({
      townKm,
      totalBeds: totalBedsForTown(s.toTownId),
      date: d,
    })
  }
}

/**
 * split.test.ts — F-01 구간 분할 엔진 테스트
 *
 * 06_개발가이드.md P1 의 필수 테스트 목록을 구현한다.
 *
 * ※ 문서와의 의도된 편차 2건 (데이터가 실측 확보되면서 전제가 바뀐 부분):
 *   1) riskDataQuality: 문서는 "현재 profiles 가 전부 ESTIMATED" 를 전제로
 *      'ESTIMATED' 를 기대했다. 이제 data/profiles.ts 가 source:'OSM+EUDEM'(실측
 *      OSM 경로 + EU-DEM 25m 고도) 이므로 'OSM+EUDEM' 가 맞다. 엔진은 데이터를 정직하게 따른다.
 *   2) 피레네 회복: 문서는 "생장→론세스바예스를 하루로 본 다음 날" 을 가정했으나,
 *      우리 엔진은 오리송(Refuge Orisson, 실제 권장 1박지)에서 끊어 더 안전하게
 *      나눈다. 회복은 "초반 적응 + 힘든 날 다음 완화" 로 검증한다.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { buildPlan } from './split'
import { towns } from '../../data/towns'
import type { PlanInput, MobilityProfile } from '../schema'

const HERE = dirname(fileURLToPath(import.meta.url))

const foot: MobilityProfile = {
  mode: 'FOOT',
  maxKmPerDay: 40,
  needsSupportVehicle: false,
  needsCompanion: false,
  avoidSurfaces: [],
  bagTransferRequired: false,
}

function input(over: Partial<PlanInput> = {}): PlanInput {
  return {
    startTownId: 'saint-jean-pied-de-port',
    mobility: foot,
    targetKmPerDay: 24,
    fitness: 'normal',
    restDays: 0,
    useBagTransfer: 'none',
    plannedTransport: [],
    ...over,
  }
}

const kmOf = (id: string) => towns.find((t) => t.id === id)!.km
const walkingStages = (p: ReturnType<typeof buildPlan>) =>
  p.stages.filter((s) => !s.isRestDay && !s.transport)

describe('구간 분할 — 기본 형태', () => {
  it('생장 24km/normal → 33~36 구간', () => {
    const p = buildPlan(input())
    expect(walkingStages(p).length).toBeGreaterThanOrEqual(33)
    expect(walkingStages(p).length).toBeLessThanOrEqual(36)
  })

  it('모든 구간의 fromTownId 가 이전 구간의 toTownId 와 이어진다', () => {
    const p = buildPlan(input({ restDays: 2 }))
    for (let i = 1; i < p.stages.length; i++) {
      expect(p.stages[i].fromTownId).toBe(p.stages[i - 1].toTownId)
    }
  })

  it('모든 도착지의 beds > 0 (산티아고 제외)', () => {
    const p = buildPlan(input())
    for (const s of p.stages) {
      if (s.toTownId === 'santiago-de-compostela') continue
      expect(towns.find((t) => t.id === s.toTownId)!.beds).toBeGreaterThan(0)
    }
  })

  it('마지막 toTownId 는 항상 santiago-de-compostela', () => {
    for (const start of ['saint-jean-pied-de-port', 'sarria', 'leon']) {
      const p = buildPlan(input({ startTownId: start }))
      expect(p.stages[p.stages.length - 1].toTownId).toBe('santiago-de-compostela')
    }
  })

  it('거리 합계가 총 거리와 오차 0.1km 이내', () => {
    const p = buildPlan(input())
    const sum = walkingStages(p).reduce((a, s) => a + s.distanceKm, 0)
    expect(Math.abs(sum - 773.1)).toBeLessThanOrEqual(0.1)
  })
})

describe('무한루프 방지 · 숙소 보장', () => {
  it('목표 3km 에서 무한루프 없이 종료하고 체인이 이어진다', () => {
    const p = buildPlan(input({ targetKmPerDay: 3 }))
    expect(p.stages.length).toBeGreaterThan(0)
    expect(p.stages[p.stages.length - 1].toTownId).toBe('santiago-de-compostela')
    for (let i = 1; i < p.stages.length; i++) {
      expect(p.stages[i].fromTownId).toBe(p.stages[i - 1].toTownId)
    }
  })

  it('목표 14km 에서 무한루프 없음', () => {
    const p = buildPlan(input({ targetKmPerDay: 14 }))
    expect(p.stages[p.stages.length - 1].toTownId).toBe('santiago-de-compostela')
  })

  it('목표 32km(최대)에서도 모든 도착지에 숙소가 있다', () => {
    const p = buildPlan(input({ targetKmPerDay: 32 }))
    for (const s of walkingStages(p)) {
      if (s.toTownId === 'santiago-de-compostela') continue
      expect(towns.find((t) => t.id === s.toTownId)!.beds).toBeGreaterThan(0)
    }
  })
})

describe('부상 회피 후처리', () => {
  it('초반 적응: 1~3일차 평균 거리 < 4~6일차 평균 거리', () => {
    const p = buildPlan(input())
    const w = walkingStages(p)
    const early = w.slice(0, 3)
    const later = w.slice(3, 6)
    const avg = (xs: typeof w) => xs.reduce((a, s) => a + s.distanceKm, 0) / xs.length
    expect(avg(early)).toBeLessThan(avg(later))
  })

  it('피레네를 하루에 몰지 않는다: 첫 구간이 전체 평균보다 확실히 짧다', () => {
    // 회복 후처리(초반 적응 + 오르막 보정)가 동작하면 피레네를 낀 첫날이 짧아진다.
    const p = buildPlan(input())
    const w = walkingStages(p)
    const avg = w.reduce((a, s) => a + s.distanceKm, 0) / w.length
    expect(w[0].distanceKm).toBeLessThan(avg * 0.7)
  })

  it('restDays=2 → isRestDay 가 정확히 2개이고 전부 beds>=150 마을', () => {
    const p = buildPlan(input({ restDays: 2 }))
    const rests = p.stages.filter((s) => s.isRestDay)
    expect(rests.length).toBe(2)
    for (const r of rests) {
      expect(towns.find((t) => t.id === r.toTownId)!.beds).toBeGreaterThanOrEqual(150)
      expect(r.fromTownId).toBe(r.toTownId)
      expect(r.distanceKm).toBe(0)
    }
  })
})

describe('경고 산출', () => {
  it('엘 아세보 → 몰리나세카 급하강을 포함한 구간에 STEEP_DESCENT 가 있다', () => {
    const p = buildPlan(input())
    const aceboKm = kmOf('el-acebo')
    const molinaKm = kmOf('molinaseca')
    // 두 마을을 모두 품는 구간을 찾는다 (fromTown.km <= 엘아세보, toTown.km >= 몰리나세카)
    const stage = p.stages.find(
      (s) => kmOf(s.fromTownId) <= aceboKm && kmOf(s.toTownId) >= molinaKm,
    )
    expect(stage).toBeDefined()
    expect(stage!.warnings).toContain('STEEP_DESCENT')
  })

  it('피레네를 낀 구간에 STEEP_CLIMB 가 있다', () => {
    const p = buildPlan(input())
    const roncesKm = kmOf('roncesvalles')
    const hasClimb = p.stages.some(
      (s) => kmOf(s.toTownId) <= roncesKm + 0.1 && s.warnings.includes('STEEP_CLIMB'),
    )
    expect(hasClimb).toBe(true)
  })
})

describe('위험 점수', () => {
  it('32km/high 전구간 → injuryRiskScore >= 60', () => {
    const p = buildPlan(input({ targetKmPerDay: 32, fitness: 'high' }))
    expect(p.injuryRiskScore).toBeGreaterThanOrEqual(60)
  })

  it('편안한 일정이 공격적 일정보다 점수가 낮다', () => {
    const easy = buildPlan(input({ targetKmPerDay: 20, fitness: 'low', restDays: 3 }))
    const hard = buildPlan(input({ targetKmPerDay: 32, fitness: 'high' }))
    expect(easy.injuryRiskScore).toBeLessThan(hard.injuryRiskScore)
  })

  it('실측 profiles(OSM+EUDEM)이므로 riskDataQuality === "OSM+EUDEM"', () => {
    // ※ 문서는 ESTIMATED 를 전제했으나 실측 데이터 확보로 전제가 바뀌었다.
    //    고도는 EU-DEM 25m 라 라벨은 OSM+EUDEM (IGN 5m 미사용, DEVLOG 2026-07-25(2) 참조).
    const p = buildPlan(input())
    expect(p.riskDataQuality).toBe('OSM+EUDEM')
  })
})

describe('콤포스텔라 · 도장 규칙', () => {
  it('생장 출발(773km) → doubleStampPerDay false (하루 1개면 충분)', () => {
    const p = buildPlan(input())
    expect(p.compostelaEligible).toBe(true)
    expect(p.doubleStampPerDay).toBe(false)
  })

  it('사리아 출발(114.2km) → 걸은 거리 114.2, compostela true, doubleStampPerDay true', () => {
    const p = buildPlan(input({ startTownId: 'sarria' }))
    expect(Math.abs(p.walkedKm - 114.2)).toBeLessThanOrEqual(0.1)
    expect(p.compostelaEligible).toBe(true)
    expect(p.doubleStampPerDay).toBe(true)
  })

  it('도보 100km / 자전거 200km / 전기자전거 대상 아님', () => {
    // 사리아 114km: 도보 true, 자전거 false(200 미달), 전기자전거 false
    const bike: MobilityProfile = { ...foot, mode: 'BIKE', maxKmPerDay: 80 }
    const ebike: MobilityProfile = { ...foot, mode: 'E_BIKE', maxKmPerDay: 80 }
    expect(buildPlan(input({ startTownId: 'sarria' })).compostelaEligible).toBe(true)
    expect(
      buildPlan(input({ startTownId: 'sarria', mobility: bike })).compostelaEligible,
    ).toBe(false)
    expect(
      buildPlan(input({ startTownId: 'sarria', mobility: ebike })).compostelaEligible,
    ).toBe(false)
    // 자전거라도 200km 이상(레온 출발 308km)이면 true
    expect(buildPlan(input({ startTownId: 'leon', mobility: bike })).compostelaEligible).toBe(true)
  })
})

describe('계획된 이동수단 (메세타 버스)', () => {
  const meseta = input({
    plannedTransport: [
      { fromTownId: 'burgos', toTownId: 'leon', mode: 'BUS', reasonKo: '메세타 건너뛰기', skippedKm: 180, costEur: 25 },
    ],
  })

  it('walkedKm 에서 부르고스→레온이 빠지고 totalKm 에는 남는다', () => {
    const p = buildPlan(meseta)
    const plain = buildPlan(input())
    expect(p.totalKm).toBeGreaterThan(p.walkedKm)
    expect(Math.abs(p.totalKm - plain.totalKm)).toBeLessThanOrEqual(0.2)
    // 버스 구간이 stage 로 존재하고 걷지 않는다
    const bus = p.stages.find((s) => s.transport)
    expect(bus).toBeDefined()
    expect(bus!.fromTownId).toBe('burgos')
    expect(bus!.toTownId).toBe('leon')
  })

  it('레온 이후가 300km 넘으므로 콤포스텔라 요건은 끊기지 않는다', () => {
    const p = buildPlan(meseta)
    expect(p.compostelaEligible).toBe(true)
  })

  it('목표 거리와 무관하게 이동수단 출발지에 반드시 정차한다 (탐욕이 지나치지 않음)', () => {
    // 회귀 방지: 부르고스를 지나치는 목표 거리에서도 버스가 발동해야 한다.
    for (const targetKmPerDay of [18, 22, 24, 27, 30]) {
      const p = buildPlan(input({ ...meseta, targetKmPerDay }))
      const bus = p.stages.find((s) => s.transport)
      expect(bus, `target ${targetKmPerDay}`).toBeDefined()
      expect(bus!.fromTownId).toBe('burgos')
      expect(p.walkedKm).toBeLessThan(773.1)
    }
  })
})

describe('일자별 상세 — 거점(waypoints)', () => {
  it('걷는 날은 START(km 0)로 시작해 ARRIVE(km=distanceKm)로 끝난다', () => {
    const p = buildPlan(input())
    for (const s of walkingStages(p)) {
      expect(s.waypoints[0].kind).toBe('START')
      expect(s.waypoints[0].km).toBe(0)
      const last = s.waypoints[s.waypoints.length - 1]
      expect(last.kind).toBe('ARRIVE')
      expect(last.km).toBe(s.distanceKm)
    }
  })

  it('거점의 km은 항상 0~distanceKm 범위 안이고 오름차순이다', () => {
    const p = buildPlan(input())
    for (const s of walkingStages(p)) {
      for (const w of s.waypoints) {
        expect(w.km).toBeGreaterThanOrEqual(0)
        expect(w.km).toBeLessThanOrEqual(s.distanceKm)
      }
      for (let i = 1; i < s.waypoints.length; i++) {
        expect(s.waypoints[i].km).toBeGreaterThanOrEqual(s.waypoints[i - 1].km)
      }
    }
  })

  it('이동수단(버스) 구간은 거점이 없다', () => {
    const p = buildPlan(
      input({
        plannedTransport: [
          { fromTownId: 'burgos', toTownId: 'leon', mode: 'BUS', reasonKo: '메세타 건너뛰기', skippedKm: 180, costEur: 25 },
        ],
      }),
    )
    const bus = p.stages.find((s) => s.transport)
    expect(bus!.waypoints).toEqual([])
  })
})

describe('일자별 상세 — 위험 구간(hazards)', () => {
  it('엘 아세보 → 몰리나세카 급하강 구간에 STEEP_DESCENT hazard가 있다', () => {
    const p = buildPlan(input())
    const aceboKm = kmOf('el-acebo')
    const molinaKm = kmOf('molinaseca')
    const stage = p.stages.find(
      (s) => kmOf(s.fromTownId) <= aceboKm && kmOf(s.toTownId) >= molinaKm,
    )
    expect(stage).toBeDefined()
    expect(stage!.hazards.some((h) => h.type === 'STEEP_DESCENT')).toBe(true)
  })

  it('hazard의 fromKm/toKm은 항상 0~distanceKm 범위 안이고 fromKm < toKm', () => {
    const p = buildPlan(input())
    for (const s of walkingStages(p)) {
      for (const h of s.hazards) {
        expect(h.fromKm).toBeGreaterThanOrEqual(0)
        expect(h.toKm).toBeLessThanOrEqual(s.distanceKm)
        expect(h.fromKm).toBeLessThan(h.toKm)
      }
    }
  })

  it('이동수단(버스) 구간은 위험 구간이 없다', () => {
    const p = buildPlan(
      input({
        plannedTransport: [
          { fromTownId: 'burgos', toTownId: 'leon', mode: 'BUS', reasonKo: '메세타 건너뛰기', skippedKm: 180, costEur: 25 },
        ],
      }),
    )
    const bus = p.stages.find((s) => s.transport)
    expect(bus!.hazards).toEqual([])
  })

  it('부르고스 → 오르니요스 델 카미노 구간에 EXPOSED hazard가 있다 (Gronze Al Loro 근거)', () => {
    const p = buildPlan(input())
    const burgosKm = kmOf('burgos')
    const hornillosKm = kmOf('hornillos-del-camino')
    const stage = p.stages.find(
      (s) => kmOf(s.fromTownId) <= burgosKm && kmOf(s.toTownId) >= hornillosKm,
    )
    expect(stage).toBeDefined()
    expect(stage!.hazards.some((h) => h.type === 'EXPOSED')).toBe(true)
  })

  it('비야마요르 데 몬하르딘 → 로스 아르코스 하위 구간에 EXPOSED hazard가 있다', () => {
    const p = buildPlan(input())
    const villamayorKm = kmOf('villamayor-de-monjardin')
    const losArcosKm = kmOf('los-arcos')
    const stage = p.stages.find(
      (s) => kmOf(s.fromTownId) <= villamayorKm && kmOf(s.toTownId) >= losArcosKm,
    )
    expect(stage).toBeDefined()
    expect(stage!.hazards.some((h) => h.type === 'EXPOSED')).toBe(true)
  })
})

describe('F-02 혼잡 추정 — Stage.congestion/date 배치', () => {
  it('출발일 없으면 모든 date가 null', () => {
    const p = buildPlan(input())
    expect(p.stages.every((s) => s.date === null)).toBe(true)
  })

  it('출발일이 있으면 dayNo에 맞게 date가 채워진다(1일차 = 출발일)', () => {
    const p = buildPlan(input({ startDate: '2026-09-01' }))
    expect(p.stages[0].date).toBe('2026-09-01')
  })

  it('휴식일이 있어도 dayNo 재부여 이후 값으로 date가 맞다(경계 회귀 방지)', () => {
    const p = buildPlan(input({ startDate: '2026-09-01', restDays: 2 }))
    for (let i = 0; i < p.stages.length; i++) {
      expect(p.stages[i].dayNo).toBe(i + 1)
      const expected = new Date('2026-09-01T00:00:00Z')
      expected.setUTCDate(expected.getUTCDate() + i)
      expect(p.stages[i].date).toBe(expected.toISOString().slice(0, 10))
    }
  })

  it('도보 구간은 congestion이 항상 채워진다(null 아님)', () => {
    const p = buildPlan(input())
    for (const s of walkingStages(p)) {
      expect(s.congestion).not.toBeNull()
      expect(['LOW', 'HURRY', 'HIGH']).toContain(s.congestion!.level)
    }
  })

  it('휴식일·이동수단 구간은 congestion이 null', () => {
    const p = buildPlan(
      input({
        restDays: 1,
        plannedTransport: [
          { fromTownId: 'burgos', toTownId: 'leon', mode: 'BUS', reasonKo: '메세타 건너뛰기', skippedKm: 180, costEur: 25 },
        ],
      }),
    )
    for (const s of p.stages) {
      if (s.isRestDay || s.transport) expect(s.congestion).toBeNull()
    }
  })

  it('사리아 출발(짧은 일정)도 congestion 계산이 죽지 않는다', () => {
    const p = buildPlan(input({ startTownId: 'sarria', startDate: '2026-07-25' }))
    expect(walkingStages(p).every((s) => s.congestion !== null)).toBe(true)
  })
})

describe('F-19 갈림길 선택 반영 (variantChoices)', () => {
  // targetKmPerDay 28이면 1일차가 생장→론세스바예스 전체(fork-saint-jean이 통째로 들어감)가 된다.
  const forkInput = (over: Partial<PlanInput> = {}) => input({ targetKmPerDay: 28, ...over })

  it('기본(선택 안 함)은 variantId가 null이고 본선(나폴레옹) 거리를 쓴다', () => {
    const p = buildPlan(forkInput())
    const day1 = p.stages[0]
    expect(day1.fromTownId).toBe('saint-jean-pied-de-port')
    expect(day1.toTownId).toBe('roncesvalles')
    expect(day1.variantId).toBeNull()
  })

  it('발카를로스를 선택하면 1일차 거리가 줄고 variantId가 채워진다', () => {
    const base = buildPlan(forkInput())
    const chosen = buildPlan(forkInput({ variantChoices: { 'fork-saint-jean': 'valcarlos' } }))
    expect(chosen.stages[0].variantId).toBe('valcarlos')
    expect(chosen.stages[0].distanceKm).not.toBe(base.stages[0].distanceKm)
    expect(chosen.stages[0].distanceKm).toBeLessThan(base.stages[0].distanceKm)
    // 발카를로스는 ascent/descent 실측이 없어(null) 본선 값을 그대로 보존한다 — 지어내지 않는다(규칙 1)
    expect(chosen.stages[0].ascent).toBe(base.stages[0].ascent)
    expect(chosen.stages[0].descent).toBe(base.stages[0].descent)
  })

  it('존재하지 않는 variantId를 넣어도 기본값으로 안전하게 폴백한다', () => {
    const p = buildPlan(forkInput({ variantChoices: { 'fork-saint-jean': 'no-such-id' } }))
    expect(p.stages[0].variantId).toBeNull()
  })

  it('fork가 하루 구간 경계에 걸치면(기본 24km/day) 선택이 반영되지 않는다', () => {
    // 기본 targetKmPerDay(24)에서는 1일차가 생장→오리송에서 끊긴다 — fork-saint-jean이
    // 통째로 안 들어가므로 valcarlos를 골라도 아무 효과가 없어야 한다(정확히 재계산 못 하는
    // 경우엔 손대지 않는다는 원칙, lib/planner/forks.ts 주석 참고).
    const base = buildPlan(input())
    const chosen = buildPlan(input({ variantChoices: { 'fork-saint-jean': 'valcarlos' } }))
    expect(base.stages[0].toTownId).toBe('orisson')
    expect(chosen.stages[0].distanceKm).toBe(base.stages[0].distanceKm)
    expect(chosen.stages[0].variantId).toBeNull()
  })
})

describe('규칙 3 경계 — 고도는 profiles 만 경유', () => {
  it('split.ts / risk.ts 어디에도 towns.elevation 을 직접 빼는 코드가 없다', () => {
    const stripComments = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    for (const f of ['split.ts', 'risk.ts']) {
      const src = stripComments(readFileSync(join(HERE, f), 'utf-8'))
      // 코드(주석 제외)에 town 의 .elevation 프로퍼티 접근이 없어야 한다.
      // maxElevation(점 없음)은 profiles 값이라 무관하다.
      expect(/\.elevation\b/.test(src)).toBe(false)
    }
  })
})

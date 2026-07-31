/**
 * lib/planner/planB.ts — F-21 Plan B (축소판, 미리보기 전용).
 *
 * ★ "이 날이 어긋나면"을 눌렀을 때 보여줄 대안 미리보기만 계산한다. 03문서 원안의
 *   "적용하고 이후 일정 다시 계산"(재계산, 뒤 구간까지 다시 나누고 콤포스텔라
 *   요건을 재검증)은 아직 구현하지 않았다 — 화면에도 미리보기임을 명시해서
 *   실제로 반영된 것처럼 보이지 않게 한다.
 * ★ 지어내지 않는다(규칙 1): 이동수단은 실제 조사된 노선(data/transit.ts)이
 *   있는 구간에서만 옵션으로 보여준다. 없으면 그 옵션 자체를 뺀다.
 *
 * 순수 함수. fetch/window 참조 없음. 정적 towns/albergues/transit 만 읽는다.
 */

import { towns as ALL_TOWNS } from '../../data/towns'
import { totalBedsForTown, findTransitOptions, getAlbergues, estimatedMinutes } from '../geo'
import { accumulateProfile, townIdx } from './split'

const LONG_DISTANCE = 28 // split.ts LONG_DISTANCE 경고 기준과 동일(경고 판정 재사용)

export type PlanBOptionKind = 'FURTHER' | 'SHORTER' | 'TRANSPORT' | 'PRIVATE_BOOKING'

export interface PlanBOption {
  kind: PlanBOptionKind
  townId: string | null // 대안 도착지. TRANSPORT/PRIVATE_BOOKING 은 원래 도착지와 같다
  labelKo: string
  deltaKm: number | null // 원래 거리 대비 증감(+ 늘어남/− 줄어듦). 정보성 항목은 null
  totalDayKm: number | null
  estimatedMinutesTotal: number | null
  beds: number | null
  warningKo: string | null
  noteKo: string
}

const round1 = (n: number) => Math.round(n * 10) / 10

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}분`
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

/**
 * fromTownId → toTownId 구간이 어긋났을 때의 대안 미리보기.
 * 실제 Stage 재계산 없이, 그날 하루만 놓고 본 참고용 수치다.
 */
export function planBOptions(fromTownId: string, toTownId: string): PlanBOption[] {
  const out: PlanBOption[] = []
  const fromIdx = townIdx(fromTownId)
  const toIdx = townIdx(toTownId)
  const fromKm = ALL_TOWNS[fromIdx].km
  const origKm = round1(ALL_TOWNS[toIdx].km - fromKm)

  // 더 간다 — 다음 마을까지
  if (toIdx + 1 < ALL_TOWNS.length) {
    const nt = ALL_TOWNS[toIdx + 1]
    const totalDayKm = round1(nt.km - fromKm)
    const prof = accumulateProfile(fromIdx, toIdx + 1)
    out.push({
      kind: 'FURTHER',
      townId: nt.id,
      labelKo: `더 간다 · ${nt.nameKo}`,
      deltaKm: round1(totalDayKm - origKm),
      totalDayKm,
      estimatedMinutesTotal: estimatedMinutes(totalDayKm, prof.ascent, prof.descent),
      beds: totalBedsForTown(nt.id),
      warningKo: totalDayKm > LONG_DISTANCE ? `오늘 총 ${totalDayKm}km — 무리할 수 있습니다` : null,
      noteKo: nt.nameEs,
    })
  }

  // 되돌아간다 — 이전 마을까지. 출발지 마을 자체로는 못 돌아간다(하루 이동 0km는 대안이 아님)
  if (toIdx - 1 > fromIdx) {
    const pt = ALL_TOWNS[toIdx - 1]
    const totalDayKm = round1(pt.km - fromKm)
    const prof = accumulateProfile(fromIdx, toIdx - 1)
    out.push({
      kind: 'SHORTER',
      townId: pt.id,
      labelKo: `되돌아간다 · ${pt.nameKo}`,
      deltaKm: round1(totalDayKm - origKm),
      totalDayKm,
      estimatedMinutesTotal: estimatedMinutes(totalDayKm, prof.ascent, prof.descent),
      beds: totalBedsForTown(pt.id),
      warningKo: null,
      noteKo: pt.nameEs,
    })
  }

  // 이동수단 — 실제 조사된 노선(F-26)이 있는 구간만
  const transit = findTransitOptions(fromTownId, toTownId)
  if (transit.length > 0) {
    const opt = transit.find((t) => t.mode === 'BUS') ?? transit[0]
    const modeKo = opt.mode === 'BUS' ? '버스' : opt.mode === 'TRAIN' ? '기차' : opt.mode === 'TAXI' ? '택시' : '지원 차량'
    out.push({
      kind: 'TRANSPORT',
      townId: toTownId,
      labelKo: `이동수단 · ${opt.operator}`,
      deltaKm: null,
      totalDayKm: null,
      estimatedMinutesTotal: null,
      beds: null,
      warningKo: '걷지 않은 구간으로 기록됩니다 — 콤포스텔라 요건(100km)에 영향을 줄 수 있습니다',
      noteKo: `${modeKo} 약 ${fmtDuration(opt.durationMin)} · €${opt.costEurLow}~${opt.costEurHigh}`,
    })
  }

  // 사립 예약 — 목적지에 사립 알베르게가 있을 때만
  const privateCount = getAlbergues(toTownId).filter((a) => a.type === 'PRIVATE').length
  if (privateCount > 0) {
    out.push({
      kind: 'PRIVATE_BOOKING',
      townId: toTownId,
      labelKo: `사립 예약 · ${ALL_TOWNS[toIdx].nameKo} 내 ${privateCount}곳`,
      deltaKm: null,
      totalDayKm: null,
      estimatedMinutesTotal: null,
      beds: null,
      warningKo: null,
      noteKo: '전화·WhatsApp으로 미리 예약하면 자리를 보장받을 수 있습니다',
    })
  }

  return out
}

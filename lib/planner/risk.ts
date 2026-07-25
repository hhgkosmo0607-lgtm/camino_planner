/**
 * lib/planner/risk.ts — 부상 위험 점수 (injuryRiskScore)
 *
 * ★★ 이 파일의 모든 가중치·임계값은 의학적 근거가 없는 임시값이다. ★★
 *   정형외과·스포츠의학 자문 검수(CLAUDE.md 규칙 11) 전까지 사용자에게
 *   "의학적 판단"으로 제시하지 않는다. riskDataQuality 가 'ESTIMATED' 인 동안은
 *   UI에서 점수를 숫자로 노출하지 않는다 (CLAUDE.md 규칙 3).
 *
 * ★ 내리막이 무릎 부상의 주원인이므로 descent 가중치를 ascent 보다 높게 잡는다
 *   (ascent ×1.0, descent ×1.4). 역시 임시 계수다.
 *
 * 순수 함수. fetch/window/localStorage 참조 없음.
 */

import type { Stage, SegmentProfile } from '../schema'

// ── 임시 가중치 (의학 근거 없음) ──────────────────────────────
const W_ASCENT = 1.0
const W_DESCENT = 1.4 // 내리막 = 무릎 부상 주원인
const HARD_ASCENT = 400 // 이 이상이면 '고강도'로 본다
const HARD_DESCENT = 400
const HARD_DISTANCE = 25

/** 하루가 '고강도'인지. 연속 고강도 판정에 쓴다. */
export function isHardStage(s: Pick<Stage, 'distanceKm' | 'ascent' | 'descent' | 'isRestDay' | 'transport'>): boolean {
  if (s.isRestDay || s.transport) return false
  return s.ascent >= HARD_ASCENT || s.descent >= HARD_DESCENT || s.distanceKm >= HARD_DISTANCE
}

// ── 정규화 기준점 (임시, 근거 없음) ─────────────────────────
// clamp01((x - lo) / (hi - lo)) 로 각 요소를 0~1 로 만든 뒤 가중 합산.
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const norm = (x: number, lo: number, hi: number) => clamp01((x - lo) / (hi - lo))

/**
 * 0~100 부상 위험 점수. 낮을수록 안전.
 * 걷는 구간(도보)만 대상으로 한다 — 이동수단·휴식일은 부하가 아니다.
 *
 * 편안한 일정(하루 20km 안팎, 힘든 날 뒤 회복)이 40 안팎,
 * 공격적 일정(하루 30km+, 연속 고강도)이 80~100 이 되도록 임시 보정했다.
 * 모든 기준점은 의학 근거가 없다.
 */
export function injuryRiskScore(stages: Stage[]): number {
  const walking = stages.filter((s) => !s.isRestDay && !s.transport)
  if (walking.length === 0) return 0

  const dists = walking.map((s) => s.distanceKm)
  const avgDist = dists.reduce((a, b) => a + b, 0) / walking.length
  const maxDist = Math.max(...dists)
  // 하루 평균 가중 고도 부하 (내리막 ×1.4)
  const avgClimb =
    walking.reduce((a, s) => a + s.ascent * W_ASCENT + s.descent * W_DESCENT, 0) / walking.length

  // 초반 부하: 1~3일차 평균이 전체 평균을 얼마나 넘는가 (초반 적응이 되면 음수→0)
  const early = walking.filter((s) => s.dayNo <= 3)
  const earlyAvg = early.length ? early.reduce((a, s) => a + s.distanceKm, 0) / early.length : 0
  const earlyOverload = Math.max(0, earlyAvg - avgDist)

  // 연속 고강도: 가장 긴 연속 '고강도' 날 수
  let run = 0
  let maxRun = 0
  for (const s of walking) {
    run = isHardStage(s) ? run + 1 : 0
    maxRun = Math.max(maxRun, run)
  }

  // 각 요소 0~1 정규화 (기준점: lo=편안, hi=위험)
  const cDist = norm(avgDist, 16, 30) // 하루 평균 16km→0, 30km→1
  const cMax = norm(maxDist, 24, 34) // 최장일 24km→0, 34km→1
  const cClimb = norm(avgClimb, 500, 1100) // 하루 가중고도 500→0, 1100→1
  const cEarly = norm(earlyOverload, 0, 8) // 초반 과부하 0~8km
  const cRun = norm(maxRun, 2, 8) // 연속 고강도 2일→0, 8일→1

  // 가중 합산 (합=1.0)
  const raw =
    cDist * 0.34 + cMax * 0.14 + cClimb * 0.24 + cEarly * 0.13 + cRun * 0.15
  return Math.round(clamp01(raw) * 100)
}

/**
 * riskDataQuality — 구간 profiles 의 source 중 하나라도 ESTIMATED 면 'ESTIMATED'.
 * ESTIMATED 면 UI 는 injuryRiskScore 를 숫자로 노출하지 않는다.
 */
export function riskDataQuality(sources: SegmentProfile['source'][]): SegmentProfile['source'] {
  // 하나라도 추정치면 전체를 추정으로 본다(점수 숨김). 아니면 실제 출처를 그대로 보고한다.
  if (sources.length === 0 || sources.some((s) => s === 'ESTIMATED')) return 'ESTIMATED'
  // 전부 IGN 5m일 때만 OSM+MDT로 보고. 하나라도 EU-DEM이면 정직하게 OSM+EUDEM.
  return sources.every((s) => s === 'OSM+MDT') ? 'OSM+MDT' : 'OSM+EUDEM'
}

/** 점수 밴드별 한 줄 판단 (사용자에게 보여줄 문구). */
export function riskAdvice(score: number, quality: SegmentProfile['source']): string {
  if (quality === 'ESTIMATED') {
    return '아직 실측 고도로 검증되지 않은 추정 일정입니다. 무리한 구간이 있는지 직접 한 번 더 살펴보세요.'
  }
  if (score < 30) return '부상 위험이 낮은 편안한 일정입니다. 이대로 걸어도 좋습니다.'
  if (score < 50) return '무난한 일정이지만 오르내림이 있는 날은 무릎을 아껴 걸으세요.'
  if (score < 65) return '다소 빡빡합니다. 하루 이틀 여유를 더 두면 완주 확률이 올라갑니다.'
  return '무리한 일정입니다. 일수를 늘리거나 힘든 구간 다음 날을 짧게 잡길 권합니다.'
}

/**
 * lib/planner/forks.ts — F-19 갈림길(RouteFork) 판정 순수 함수.
 *
 * ★ towns.ts는 항상 각 fork의 isMain variant를 따라간다 — build_geometry.py가
 *   OSM 공식 relation을 그대로 이어붙였기 때문이다(scripts/pipeline/build_geometry.py
 *   SEGMENTS 참고). 그래서 "기본값"은 늘 isMain variant다.
 * ★ 어떤 계획(Plan)의 하루 구간(Stage) 안에 fork가 "완전히" 들어갈 때만 거리·고도를
 *   덮어쓴다. 하루 목표거리가 아주 짧아 fork 중간에서 날짜가 끊기면(경계 걸침)
 *   본선 구간별 프로파일과 변형 전체 거리를 정확히 대응시킬 수 없다 — 틀린 숫자를
 *   보여주느니 그 경우엔 선택지를 아예 노출하지 않는다(규칙 1).
 *
 * 순수 함수. fetch/window/localStorage 참조 없음.
 */

import { forks as ALL_FORKS } from '../../data/forks'
import { towns as ALL_TOWNS } from '../../data/towns'
import type { RouteFork, RouteVariant } from '../schema'

const TOWN_KM = new Map(ALL_TOWNS.map((t) => [t.id, t.km]))

interface ForkRange {
  fork: RouteFork
  fromKm: number
  toKm: number
}

const FORK_RANGES: ForkRange[] = ALL_FORKS.flatMap((fork) => {
  const a = TOWN_KM.get(fork.splitTownId)
  const b = TOWN_KM.get(fork.mergeTownId)
  if (a === undefined || b === undefined) return []
  return [{ fork, fromKm: Math.min(a, b), toKm: Math.max(a, b) }]
})

/** stage [stageFromKm, stageToKm] 안에 완전히 포함되는 fork만 반환. 경계에 걸치면 제외한다(위 설명). */
export function forksFullyInStage(stageFromKm: number, stageToKm: number): RouteFork[] {
  const EPS = 1e-6
  return FORK_RANGES.filter(
    (r) => r.fromKm >= stageFromKm - EPS && r.toKm <= stageToKm + EPS,
  ).map((r) => r.fork)
}

/** fork의 기본(공식 표지) variant. towns.ts가 실제로 따라가는 경로와 같다. */
export function defaultVariant(fork: RouteFork): RouteVariant {
  return fork.variants.find((v) => v.isMain) ?? fork.variants[0]
}

/** variantId가 그 fork의 실제 variant가 아니면(오타·다른 fork의 id 등) 기본값으로 폴백한다. */
export function selectedVariant(fork: RouteFork, variantId: string | undefined): RouteVariant {
  if (!variantId) return defaultVariant(fork)
  return fork.variants.find((v) => v.id === variantId) ?? defaultVariant(fork)
}

/**
 * MM-DD 폐쇄 기간(예: 나폴레옹 루트 '11-01'~'03-31', 연말 경계를 넘는다) 안에
 * dateStr(YYYY-MM-DD)이 드는지 판정한다. dateStr이나 폐쇄 정보가 없으면 false —
 * "폐쇄인지 모른다"를 "폐쇄 아님"으로 단정하지 않되, 확인할 수 없으면 경고를 강제로
 * 만들어내지 않는다(규칙 1).
 */
export function isVariantClosedOn(variant: RouteVariant, dateStr: string | null): boolean {
  if (!variant.closedFrom || !variant.closedTo || !dateStr) return false
  const mmdd = dateStr.slice(5)
  const { closedFrom: from, closedTo: to } = variant
  return from <= to ? mmdd >= from && mmdd <= to : mmdd >= from || mmdd <= to
}

/**
 * lib/planner/types.ts — 플래너 내부 타입 + 스키마 재노출
 *
 * ★ PlanInput / Stage / Plan / StageWarning 등 도메인 타입은 여기서 새로 만들지 않는다.
 *   lib/schema.ts 가 정본이다. 여기서는 편의를 위해 재노출만 하고,
 *   플래너 내부 계산에만 쓰는 보조 타입을 추가로 둔다.
 *
 * 순수 함수 원칙: 이 디렉터리(lib/planner/)는 fetch/window/localStorage 를
 * 참조하지 않는다. Phase 3에서 React Native 로 그대로 옮긴다.
 */

export type {
  Town,
  SegmentProfile,
  PlanInput,
  Stage,
  Plan,
  StageWarning,
  MobilityProfile,
  TravelMode,
  PlannedTransport,
} from '../schema'

import type { SegmentProfile } from '../schema'

/** 마을 구간 [fromIdx, toIdx] 를 누적한 결과. distanceKm 은 towns.km 차이(정본)로 따로 계산한다. */
export interface AccumulatedProfile {
  ascent: number
  descent: number
  maxElevation: number
  maxGradient: number
  /** 구간을 이루는 profiles 중 하나라도 ESTIMATED 면 ESTIMATED */
  source: SegmentProfile['source']
}

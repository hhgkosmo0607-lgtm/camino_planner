/**
 * schema.ts — 데이터 모델 단일 진실 공급원 (Single Source of Truth)
 *
 * 03_제품과기능.md 와 06_개발가이드.md 에 흩어져 있던 타입을 통합했다.
 * 이 파일과 문서가 어긋나면 이 파일이 맞다. 문서를 고쳐라.
 *
 * Claude Code 프롬프트에 타입을 다시 적지 말고 이 파일을 import 하거나
 * "schema.ts 의 X 타입을 그대로 써라" 라고 지시할 것.
 *
 * 통합 과정에서 발견된 충돌과 해결은 파일 하단 CHANGELOG 참조.
 */

// ────────────────────────────────────────────────────────────
// 1. Town · 경로 · 갈림길
// ────────────────────────────────────────────────────────────

export type Service =
  | 'WATER'         // 식수
  | 'BAR'           // 바·식당
  | 'SHOP'          // 상점
  | 'PHARMACY'      // 약국
  | 'ATM'
  | 'BAG_TRANSFER'  // 짐 배송 접수 (마을 단위. 숙소 단위는 Albergue.acceptsBagTransfer)
  | 'MEDICAL'       // 의료시설
  | 'MASS'          // 순례자 미사

export interface Town {
  id: string                  // 슬러그. 'sarria', 'puente-la-reina'
  nameEs: string               // 원어명 — 필수, 절대 생략 불가
  nameKo: string
  routeId: string
  km: number                  // 출발지 기준 누적거리 (주 경로 기준)
  elevation: number            // 마을 자체 해발 m. 구간 오르막 계산에 쓰지 말 것 → SegmentProfile
  lat: number
  lng: number
  services: Service[]
  beds: number                 // 마을 총 침대 수. 0이면 숙소 없음
  population: number | null
  notesKo: string | null
}

/**
 * 마을 고도 차이로 오르막을 계산하면 최대 39% 틀린다 (생장→론세스바예스 실측 근거).
 * ascent/descent는 반드시 OSM 경로 + IGN MDT05 고도모델에서 직접 계산한다.
 */
export interface SegmentProfile {
  fromTownId: string
  toTownId: string
  distanceKm: number
  ascent: number               // 누적 상승 m
  descent: number              // 누적 하강 m. 무릎 부상의 주원인
  maxElevation: number         // 구간 최고점 (고개)
  maxGradient: number          // 최대 경사도 %
  source: 'OSM+MDT' | 'ESTIMATED'
  // source가 'ESTIMATED'인 동안은 injuryRiskScore를 사용자에게 숫자로 노출하지 않는다.
}

export type VariantTrait =
  | 'SCENERY' | 'MONASTERY' | 'QUIET' | 'SHORTER'
  | 'EASIER' | 'WINTER_SAFE' | 'HISTORIC' | 'ROAD_HEAVY'

export interface RouteVariant {
  id: string
  forkId: string               // 소속 RouteFork
  nameKo: string
  nameEs: string
  isMain: boolean               // 공식·주 경로 여부
  townIds: string[]             // 경유 마을 순서
  distanceKm: number
  ascent: number
  descent: number
  closedFrom: string | null     // MM-DD. 계절 폐쇄 (예: 나폴레옹 '11-01')
  closedTo: string | null       // (예: 나폴레옹 '03-31')
  roadShareRatio: number        // 차도 병행 비율 0~1
  hasShelter: boolean            // 중간에 대피할 마을이 있는가
  traits: VariantTrait[]
  highlightsKo: string[]
  cautionKo: string | null
}

export interface RouteFork {
  id: string
  splitTownId: string           // 갈라지는 지점
  mergeTownId: string           // 다시 만나는 지점
  variants: RouteVariant[]
}

/** 걸어야 열리는 안개 지도의 상징적 장소 19곳. */
export interface Landmark {
  id: string
  townId: string | null
  nameKo: string
  nameEs: string
  lat: number
  lng: number
  radiusM: number               // 개방 판정 반경. 기본 300
  storyKo: string                 // 실측 도보에서 직접 쓴다
  photoUri: string | null       // 실측 사진만. 스톡 금지
  order: number                 // 1~19
}

// ────────────────────────────────────────────────────────────
// 2. Albergue (숙소)
// ────────────────────────────────────────────────────────────

export type AlbergueType =
  | 'MUNICIPAL' | 'XUNTA' | 'PARISH' | 'MONASTERY' | 'PRIVATE' | 'DONATIVO'

export type ReservationMethod =
  | 'NONE'        // 선착순 — 예약 불가 (하드코딩 금지, 정책은 바뀐다)
  | 'PHONE' | 'WHATSAPP' | 'ONLINE'
  | 'UNKNOWN'     // 미확인. 절대 추정으로 채우지 않는다

export interface Albergue {
  id: string
  townId: string
  name: string                    // 원어명
  type: AlbergueType
  beds: number | null
  priceEur: number | null         // 0 = 기부제, null = 미확인
  reservation: ReservationMethod
  contact: string | null
  openFrom: string | null         // MM-DD. 겨울 폐쇄 다수 — 필수 관리
  openTo: string | null
  hasKitchen: boolean | null
  hasLaundry: boolean | null
  hasDryer: boolean | null        // 빈대 대응의 핵심
  hasWifi: boolean | null
  hasHeating: boolean | null
  acceptsBagTransfer: boolean | null   // 공립은 대부분 false. 마을 단위(Service)와 별개
  wheelchairAccessible: boolean | null // 계단 유무 등. 확인 전까지 null 유지
  verifiedAt: string | null       // YYYY-MM. UI에 노출
  source: 'FIELD' | 'PARTNER' | 'USER_REPORT' | 'PLACEHOLDER'
}

// ────────────────────────────────────────────────────────────
// 3. 이동 방식 · 접근성 · 이동수단
// ────────────────────────────────────────────────────────────

export type TravelMode =
  | 'FOOT'         // 도보 — 콤포스텔라 최소 100km
  | 'BIKE'         // 자전거 — 200km
  | 'E_BIKE'       // 전기자전거 — 콤포스텔라 대상 아님
  | 'HANDBIKE'     // 전동 핸드바이크 — 동행 필수
  | 'WHEELCHAIR'   // 휠체어·조엘레트 — 지원 차량 사실상 필수
  | 'HORSE'        // 말 — 100km

export type Surface = 'GRAVEL' | 'MUD' | 'STAIRS' | 'STEEP' | 'COBBLE'

export interface MobilityProfile {
  mode: TravelMode
  maxKmPerDay: number            // 하한 없음. 도보 3km, 휠체어 3km도 유효
  needsSupportVehicle: boolean
  needsCompanion: boolean
  avoidSurfaces: Surface[]
  bagTransferRequired: boolean
}

/**
 * 이동수단은 실패가 아니라 계획이다.
 * 부르고스→레온 메세타 버스는 흔한 선택이며 Plan B와 다르다:
 * 이건 "일정 수립 단계"에서 넣는 것, Plan B는 "여정 중 발생"에 대한 대응.
 */
export type TransportMode = 'BUS' | 'TRAIN' | 'TAXI' | 'SUPPORT_VEHICLE'

export interface PlannedTransport {
  fromTownId: string
  toTownId: string
  mode: TransportMode
  reasonKo: string                // "메세타 건너뛰기" 등
  skippedKm: number
  costEur: number | null
}

export interface SupportVehicle {
  enabled: boolean
  meetPoints: { stageDay: number; townId: string; noteKo: string }[]
}

// ────────────────────────────────────────────────────────────
// 4. 접근 교통 (인천 → 생장)
// ────────────────────────────────────────────────────────────

export type AccessTransportKind = 'FLIGHT' | 'TRAIN' | 'BUS' | 'SHUTTLE' | 'TAXI' | 'METRO'

export interface AccessLeg {
  order: number
  kind: AccessTransportKind
  fromName: string
  toName: string
  operator: string | null
  durationMin: number | null
  costEur: number | null
  frequencyNote: string | null    // "하루 6편" 등
  bookingUrl: string | null
  cautionKo: string | null
}

export interface AccessRoute {
  id: string
  nameKo: string                  // "파리 경유"
  toTownId: string
  legs: AccessLeg[]
  totalHours: number
  estimatedCostKrw: number
  traits: ('FAST' | 'CHEAP' | 'SIMPLE' | 'POPULAR')[]
}

// ────────────────────────────────────────────────────────────
// 5. 일정 계획 — PlanInput / Stage / Plan
// ────────────────────────────────────────────────────────────

export type BagTransferOption = 'none' | 'climbs' | 'all'

export interface PlanInput {
  startTownId: string
  mobility: MobilityProfile
  targetKmPerDay?: number         // 도보 3~32 / 자전거 40~100 / 핸드바이크 10~25. 하한을 두지 마라
  totalDays?: number              // targetKmPerDay 대신 일수로 지정 가능
  fitness: 'low' | 'normal' | 'high'
  restDays: number                // 기본 1(전 구간) / 0(100km)
  startDate?: string              // 갈림길 계절 폐쇄 판정에 쓴다
  variantChoices?: Record<string, string>   // forkId → variantId
  useBagTransfer: BagTransferOption
  plannedTransport: PlannedTransport[]       // 계획 단계에서 넣는 이동수단. 기본 []
}

export type StageWarning =
  | 'STEEP_CLIMB'       // 누적 상승 600m 초과
  | 'STEEP_DESCENT'     // 누적 하강 500m 초과. 무릎 부상 주원인
  | 'LONG_DISTANCE'     // 28km 초과
  | 'FEW_BEDS'          // 도착지 침대 30개 미만
  | 'NO_SERVICES'       // 구간 내 물·식당 없는 거리 10km 초과
  | 'EARLY_OVERLOAD'    // 초반 3일에 과부하
  | 'CONSECUTIVE_HARD'  // 연속 3일 고강도

export type HazardType =
  | 'STEEP_DESCENT' | 'NO_SHELTER' | 'EXPOSED' | 'NO_WATER'
  | 'ROAD_WALKING' | 'SLIPPERY' | 'NO_SIGNAL' | 'WINTER_RISK'

export interface Hazard {
  type: HazardType
  fromKm: number                  // 구간 내 상대 위치
  toKm: number
  noteKo: string
}

export type WaypointKind =
  | 'START' | 'ARRIVE' | 'BREAKFAST' | 'LUNCH' | 'REST'
  | 'WATER' | 'PHARMACY' | 'ATM' | 'BAG_DROP'
  | 'STAMP' | 'LANDMARK' | 'TRANSPORT'

export interface Waypoint {
  kind: WaypointKind
  townId: string | null
  km: number                      // 구간 시작 기준
  etaMinutes: number               // 출발 후 경과
  labelKo: string
  noteKo: string | null
  opensAt: string | null          // 첫 바 개점 시각 등
}

export interface Stage {
  dayNo: number
  date: string | null
  fromTownId: string
  toTownId: string
  variantId: string | null        // 선택한 갈림길 (RouteVariant.id)
  distanceKm: number               // 소수점 1자리
  ascent: number                    // profiles.ts (SegmentProfile) 에서 읽는다
  descent: number
  maxElevation: number
  estimatedMinutes: number
  suggestedStartTime: string        // "06:30"
  waypoints: Waypoint[]             // 하루 안의 모든 거점
  hazards: Hazard[]
  lodgingId: string | null          // 선택한 Albergue.id
  transport: PlannedTransport | null  // 이 구간이 계획된 이동수단인 경우만
  warnings: StageWarning[]
  isRestDay: boolean
}

export interface Plan {
  stages: Stage[]
  totalKm: number                  // 전체 이동 거리 (이동수단 구간 포함)
  walkedKm: number                 // 실제로 걸은 거리 (이동수단 구간 제외)
  totalDays: number
  compostelaEligible: boolean       // 도보 100km / 자전거 200km 기준. 전기자전거는 항상 false
  doubleStampPerDay: boolean        // 총 도보거리 기준. 위치(사리아 등) 기준이 아니다
  injuryRiskScore: number           // 0~100. 낮을수록 안전
  riskDataQuality: 'OSM+MDT' | 'ESTIMATED'  // ESTIMATED면 UI에 점수를 숨긴다
  advice: string                    // 한 줄 판단
}

// ────────────────────────────────────────────────────────────
// 6. 완주 · 보상
// ────────────────────────────────────────────────────────────

export interface FogState {
  revealed: string[]                // 개방한 Landmark.id
  revealedAt: Record<string, string>
  trackCells: string[]              // 걸어서 밝힌 지도 셀 해시
}

export interface MyStone {
  photoUri: string | null           // 출발 전 촬영
  noteKo: string                     // 무엇을 내려놓고 싶은지, 한 줄
  registeredAt: string
  placedAt: string | null            // 철의 십자가 도착 시각
}

export interface Completion {
  planId: string
  completedAt: string
  stats: {
    days: number
    distanceKm: number
    estimatedSteps: number           // 추정치. "약"을 붙여 표시
    totalAscent: number
    totalDescent: number
    townsPassed: number
    stampsCollected: number
    longestDayKm: number
    highestPointM: number
  }
  letterToFuture: string | null
  letterSendAt: string | null
  dualPilgrimInterest: boolean        // 확장 전략 선행 지표
}

// ────────────────────────────────────────────────────────────
// CHANGELOG — 통합 과정에서 해결한 충돌
// ────────────────────────────────────────────────────────────
/**
 * 1. PlanInput.useBagTransfer
 *    03문서: boolean  /  F-05·F-15 서술: 'none'|'climbs'|'all'
 *    → BagTransferOption 문자열 유니온으로 통일. boolean 폐기.
 *
 * 2. PlanInput.targetKmPerDay 주석
 *    03문서: "14~32"  /  06문서(P1): "3~32, 하한 두지 마라"
 *    → 3~32로 통일 (F-25 접근성 요구사항이 최신이고 근거가 있다).
 *
 * 3. MobilityProfile / TravelMode / PlannedTransport
 *    03문서 F-25/F-26에 이름만 언급되고 실제 interface 정의가 없었다.
 *    → 이 파일에서 최초로 정식 정의. 6종 TravelMode, avoidSurfaces 포함.
 *
 * 4. Stage 필드 불일치
 *    03문서: waypoints, hazards, lodgingId, transportLegs 등 9개+ 필드
 *    06문서(P1): dayNo/fromTownId/toTownId/distanceKm/ascent/descent/
 *                estimatedMinutes/warnings/isRestDay 6개만
 *    → 03문서 쪽(전체 사양)을 정본으로 채택. P1 프롬프트가 이 중 일부만
 *      구현한다면 "이번 단계에서는 아래 필드만 채우고 나머지는 기본값"
 *      이라고 프롬프트에 명시할 것. 타입 자체를 다르게 선언하지 않는다.
 *
 * 5. TransportLeg vs PlannedTransport
 *    두 이름으로 거의 같은 개념이 중복 정의돼 있었다.
 *    → PlannedTransport 하나로 통합. Stage.transport는 그 구간이
 *      계획된 이동수단인 경우에만 값을 갖는 단일 필드(배열 아님).
 *
 * 6. RouteVariant.forkId
 *    03문서 원본에는 없었으나 RouteFork.variants 배열의 역참조가 없어
 *    조회가 불편했다. → forkId 필드 추가.
 *
 * 7. Albergue.wheelchairAccessible
 *    F-25에서 "숙소 접근성 데이터 필요"라고 서술만 있고 필드가 없었다.
 *    → 추가. Phase 4 이전까지는 전량 null.
 *
 * 다음에 03·06 문서를 고칠 때는 이 파일을 반드시 같이 열어서
 * 여기 없는 필드를 새로 만들지 말고, 여기부터 고친다.
 */

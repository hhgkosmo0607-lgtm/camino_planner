// data/transit.ts — 메세타(부르고스~레온) 구간 실제 버스·기차 노선, F-26
//
// ⚠️ 출처: 공개 예매 집계 사이트(Omio·Busbud·Alsa 공식, 2026-07 조사). 개인 실측
//   아님 — source: 'GUIDEBOOK'. 요금은 예매 시점·성수기에 따라 달라지므로
//   checkedAt(YYYY-MM)을 반드시 같이 본다.
// ⚠️ "메세타를 버스로 건너뛴다"는 CLAUDE.md·03 문서에 반복 언급되는 흔한 선택이지만,
//   원래 03 문서 F-26 목업의 "버스 약 3시간"은 실제 조사 전 추정치였다 — 실제로는
//   1시간 40분 안팎이다(성수기 정체 시 더 걸릴 수 있음). 지어내지 않고 재조사해 고쳤다.
// ⚠️ 이 파일은 부르고스~레온 구간(가장 흔히 언급되는 메세타 건너뛰기)과 그 일부인
//   사아군~레온만 담았다. 다른 임의의 두 마을 조합은 여전히 실제 노선을 조사하지
//   않았으므로 lib/geo.ts의 findTransitOptions()가 못 찾으면 일정 화면은 일반적인
//   "이동수단으로 건너뜀" 문구로 폴백한다(비용 null) — 지어내지 않는다.
//
// 출처 목록:
//   - https://www.omio.com/buses/burgos/leon (ALSA 버스, 부르고스→레온)
//   - https://www.busbud.com/en/bus-leon-burgos (요금대 확인)
//   - https://www.omio.com/trains/burgos/leon (Renfe Alvia, 부르고스→레온)
//   - https://www.omio.es/autobuses/sahagun/leon-qh9gu (ALSA 버스, 사아군→레온)

import type { TransitOption } from '../lib/schema'

const CHECKED_AT = '2026-07'

export const transitOptions: TransitOption[] = [
  {
    id: 'burgos-leon-bus',
    fromTownId: 'burgos',
    toTownId: 'leon',
    mode: 'BUS',
    operator: 'ALSA',
    durationMin: 100,
    costEurLow: 15,
    costEurHigh: 35,
    frequencyNote: '하루 4편 이상',
    bookingUrl: 'https://www.alsa.com/en/coach/burgos-leon',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    id: 'burgos-leon-train',
    fromTownId: 'burgos',
    toTownId: 'leon',
    mode: 'TRAIN',
    operator: 'Renfe Alvia',
    durationMin: 80,
    costEurLow: 20,
    costEurHigh: 40,
    frequencyNote: '하루 여러 편(시간대별 상이)',
    bookingUrl: 'https://www.renfe.com',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    id: 'sahagun-leon-bus',
    fromTownId: 'sahagun',
    toTownId: 'leon',
    mode: 'BUS',
    operator: 'ALSA',
    durationMin: 55,
    costEurLow: 6,
    costEurHigh: 9,
    frequencyNote: '하루 4편',
    bookingUrl: 'https://www.alsa.com',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
]

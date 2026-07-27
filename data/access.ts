// data/access.ts — 접근 교통 (인천 → 생장피드포르), F-24
//
// ⚠️ 출처: 공개 예매 사이트(Trip.com·Omio·stingynomads.com 등, 2026-07 조사).
//   개인 실측 아님 — source: 'GUIDEBOOK'. 항공 요금·시간표는 계절·유가에 따라
//   자주 바뀌므로 checkedAt(YYYY-MM)을 반드시 같이 본다. 04 문서 "정기 재확인"
//   기준 연 2회(3월·9월) 갱신 대상이다.
// ⚠️ 인천→비아리츠·인천→팜플로나 직항은 없다(2026-07 확인). 유럽 허브 경유가
//   필요한데, 구체적 경유 항공사·소요시간은 예약 시점마다 달라 지어내지 않고
//   durationMin/costEur를 null로 남긴다.
//
// 출처 목록:
//   - https://stingynomads.com/st-jean-pied-de-port-how-go-get/
//   - https://www.omio.com (Paris–Bayonne, Bayonne–SJPP, Pamplona–SJPP 요금)
//   - https://airviewkorea.com (인천–파리 직항 항공사·소요시간)
//
// ⚠️ estimatedCostKrw의 신뢰도는 leg별 costEur와 다르다. 유럽 내 기차·버스
//   요금(costEur)은 위 출처에서 직접 검색해 확인한 값이지만, estimatedCostKrw에
//   들어간 "인천↔유럽 항공권" 몫은 01 문서(조사와 근거)의 기존 "왕복 120~180만원"
//   추정치를 편도로 대충 나눈 값이다 — 이번에 항공권 가격을 직접 재검색해
//   확인한 게 아니다. 화면에 노출할 때는 "참고용 대략치"임을 반드시 표시한다.
import type { AccessRoute } from '../lib/schema'

const CHECKED_AT = '2026-07'

export const accessRoutes: AccessRoute[] = [
  {
    id: 'via-paris',
    nameKo: '파리 경유',
    toTownId: 'saint-jean-pied-de-port',
    legs: [
      {
        order: 1,
        kind: 'FLIGHT',
        fromName: '인천(ICN)',
        toName: '파리 샤를드골(CDG)',
        operator: '대한항공·아시아나항공·티웨이항공·에어프랑스·루프트한자 등(직항)',
        durationMin: 850,
        costEur: null,
        frequencyNote: '매일 직항 다수',
        bookingUrl: null,
        cautionKo:
          '직항 기준 약 14시간 10분 — 러시아 영공 우회 노선이라 예전보다 길다. 귀국편은 편서풍 영향으로 약 2시간 짧다.',
      },
      {
        order: 2,
        kind: 'TRAIN',
        fromName: '파리 몽파르나스',
        toName: '바욘(Bayonne)',
        operator: 'SNCF TGV inOui',
        durationMin: 240,
        costEur: 40,
        frequencyNote: '하루 5~8편',
        bookingUrl: 'https://www.sncf-connect.com',
        cautionKo:
          'CDG 공항 자체에도 TGV역(Aéroport CDG2 TGV)이 있어 파리 시내로 안 나가도 되지만, 그쪽은 환승 포함 약 6시간 반으로 더 걸린다. 몽파르나스행이 더 빠르지만 공항→시내 이동(RER B 등)이 추가로 필요하다.',
      },
      {
        order: 3,
        kind: 'TRAIN',
        fromName: '바욘(Bayonne)',
        toName: '생장피드포르',
        operator: 'SNCF (TER)',
        durationMin: 60,
        costEur: 12,
        frequencyNote: '하루 6편(06:40·08:50·12:36·14:25·17:14·18:37)',
        bookingUrl: 'https://www.sncf-connect.com',
        cautionKo: null,
      },
    ],
    totalHours: 20,
    estimatedCostKrw: 900000, // 항공권 몫은 대략치(파일 상단 주석 참고)
    traits: ['POPULAR', 'SIMPLE'],
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    id: 'via-biarritz',
    nameKo: '비아리츠 경유',
    toTownId: 'saint-jean-pied-de-port',
    legs: [
      {
        order: 1,
        kind: 'FLIGHT',
        fromName: '인천(ICN)',
        toName: '비아리츠(BIQ)',
        operator: null,
        durationMin: null,
        costEur: null,
        frequencyNote: '인천 직항 없음 — 유럽 주요 허브 경유 필요',
        bookingUrl: null,
        cautionKo:
          '경유 항공사·소요시간은 예약 시점마다 달라 특정 항공사를 명시하지 않는다. 항공권 검색 서비스로 그때그때 확인할 것.',
      },
      {
        order: 2,
        kind: 'BUS',
        fromName: '비아리츠 공항',
        toName: '바욘(Bayonne)',
        operator: 'Txiktxak (3번 노선)',
        durationMin: 25,
        costEur: 2,
        frequencyNote: null,
        bookingUrl: null,
        cautionKo: null,
      },
      {
        order: 3,
        kind: 'TRAIN',
        fromName: '바욘(Bayonne)',
        toName: '생장피드포르',
        operator: 'SNCF (TER)',
        durationMin: 60,
        costEur: 12,
        frequencyNote: '하루 6편',
        bookingUrl: 'https://www.sncf-connect.com',
        cautionKo: null,
      },
    ],
    totalHours: 19,
    estimatedCostKrw: 950000, // 항공권 몫은 대략치(파일 상단 주석 참고)
    traits: ['FAST'],
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    id: 'via-pamplona-peak',
    nameKo: '팜플로나 경유 (성수기 3/27~10/21)',
    toTownId: 'saint-jean-pied-de-port',
    legs: [
      {
        order: 1,
        kind: 'FLIGHT',
        fromName: '인천(ICN)',
        toName: '팜플로나(PNA)',
        operator: null,
        durationMin: null,
        costEur: null,
        frequencyNote: '인천 직항 없음 — 유럽 허브 경유 + 스페인 국내선(마드리드·바르셀로나 등) 추가 필요',
        bookingUrl: null,
        cautionKo: '경유·국내선 조합에 따라 총 소요시간 편차가 크다.',
      },
      {
        order: 2,
        kind: 'BUS',
        fromName: '팜플로나',
        toName: '생장피드포르',
        operator: 'ALSA / Conda',
        durationMin: 105,
        costEur: 22,
        frequencyNote: '성수기 하루 1편(10:00 또는 12:00 출발)',
        bookingUrl: null,
        cautionKo: '사전 예약 권장. 성수기 외에는 운행하지 않는다 — 비수기는 별도 경로(via-pamplona-offseason) 참고.',
      },
    ],
    totalHours: 18,
    estimatedCostKrw: 900000, // 항공권 몫은 대략치(파일 상단 주석 참고)
    traits: [],
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    id: 'via-pamplona-offseason',
    nameKo: '팜플로나 경유 (비수기 10/22~3/26)',
    toTownId: 'saint-jean-pied-de-port',
    legs: [
      {
        order: 1,
        kind: 'FLIGHT',
        fromName: '인천(ICN)',
        toName: '팜플로나(PNA)',
        operator: null,
        durationMin: null,
        costEur: null,
        frequencyNote: '인천 직항 없음 — 유럽 허브 경유 + 스페인 국내선 추가 필요',
        bookingUrl: null,
        cautionKo: null,
      },
      {
        order: 2,
        kind: 'BUS',
        fromName: '팜플로나',
        toName: '론세스바예스',
        operator: 'Autocares Artieda',
        durationMin: 70,
        costEur: 5.65,
        frequencyNote: '월~토 1편(평일 13:30, 토 16:00). 일·공휴일 운행 없음',
        bookingUrl: null,
        cautionKo: '현금 결제만 가능(버스 안에서 지불).',
      },
      {
        order: 3,
        kind: 'TAXI',
        fromName: '론세스바예스',
        toName: '생장피드포르',
        operator: null,
        durationMin: 35,
        costEur: null,
        frequencyNote: '버스 정류장 인근 대기 택시',
        bookingUrl: null,
        cautionKo: '직행 버스가 없는 비수기의 대안. 대안으로 Teletaxi San Fermín 공유택시(평일, 최대 8인 130유로)로 팜플로나→생장 직행도 가능.',
      },
    ],
    totalHours: 20,
    estimatedCostKrw: 900000, // 항공권 몫은 대략치(파일 상단 주석 참고)
    traits: [],
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
]

// data/exposed_stretches.ts — 그늘 없음(EXPOSED) 구간, F-20 위험구간 8종 중 마지막
//
// ⚠️ 출처: Gronze.com 공식 프랑스 길 33구간 페이지의 "Al Loro"(실용팁) 서브페이지.
//   2026-07-29 조사. source: 'GUIDEBOOK' — 실측(GPX/도보) 아님, 공개 가이드북 서술을
//   정직하게 인용한 것이다(CLAUDE.md 규칙 1: 없는 걸 지어내지 않는다).
//
// ⚠️ 방법론:
//   - 조사 대상: 메인 루트(towns.ts 순서와 일치) 공식 33구간 전부. 변형 구간(1B 발카를로스,
//     21B 비야당고스 차도, 28B 사모스)은 이번 조사에서 제외했다 — forks.ts가 별도로
//     다루는 영역이고, 정밀 수치가 실측(GPX) 전까지 null인 것과 같은 이유로 지금은
//     메인 루트만 다룬다.
//   - 각 구간의 Al Loro 페이지에서 "그늘이 없다/노출된다"는 명시적 서술(sin sombra,
//     apenas sombra, escasez de sombra, expuesto/a al sol, a pleno sol 등)이 있는지만 확인했다.
//   - "그늘이 있다"는 반대 서술(예: 프로미스타→카리온 데 로스 콘데스, 베르시아노스→만시야
//     구간의 "áreas de descanso con sombra")이 나온 경우는 EXPOSED를 붙이지 않고 제외했다.
//   - 그늘과 무관한 일반 기후 서술("여름엔 덥다" 정도, 예: 로그로뇨→나헤라)은 애매하다고
//     보고 넣지 않았다 — 추측성 판정을 피하기 위해서다.
//   - 33구간 중 7구간에서만 명시적 근거를 찾아 채웠다. 나머지 26구간은 배열에 아예
//     넣지 않는다(확인 안 된 구간을 추정으로 채우지 않는다).
//   - 에스테야→로스 아르코스 구간은 "Villamayor de Monjardín와 Los Arcos 사이 12.2km"로
//     범위를 구체적으로 좁혀 언급하고 있어, 전체 구간이 아니라 그 하위 구간
//     (villamayor-de-monjardin → los-arcos)으로 좁혀서 기록했다.
//
// ⚠️ 이번 조사에서 함께 검토했으나 구현하지 않은 것 (F-20 관련, 이유는 DEVLOG 참고):
//   - 통신 두절(NO_SIGNAL): 프랑스 길에 대한 체계적 자료가 없다(포럼에 나오는 건
//     대부분 다른 루트인 Camino Olvidado·Picos de Europa 얘기).
//   - 바 개점 시각(Waypoint.opensAt): 소도시 바 영업시간은 계절마다 바뀌고 안정적
//     출처가 없어 정적 데이터로 박아두면 오히려 잘못된 정보가 된다.
//
// 조사한 Al Loro 페이지 전체 목록(구간 순서, 확인만 하고 근거를 못 찾은 26곳 포함):
//   https://www.gronze.com/etapa/{slug}/al-loro — slug는 아래 각 항목 sourceUrl 참고.

export interface ExposedStretch {
  fromTownId: string
  toTownId: string
  sourceQuote: string
  sourceUrl: string
  source: 'GUIDEBOOK'
  checkedAt: string // YYYY-MM-DD
}

const CHECKED_AT = '2026-07-29'

export const exposedStretches: ExposedStretch[] = [
  {
    fromTownId: 'villamayor-de-monjardin',
    toTownId: 'los-arcos',
    sourceQuote:
      'Ojo, sobre todo en verano, al tramo de 12,2 km entre Villamayor de Monjardín y Los Arcos, pues apenas hay sombra.',
    sourceUrl: 'https://www.gronze.com/etapa/estella-lizarra/arcos/al-loro',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    fromTownId: 'najera',
    toTownId: 'santo-domingo-de-la-calzada',
    sourceQuote: 'Ojo: caminamos casi toda la etapa sin posibilidades de protegernos del sol.',
    sourceUrl: 'https://www.gronze.com/etapa/najera/santo-domingo-calzada/al-loro',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    fromTownId: 'burgos',
    toTownId: 'hornillos-del-camino',
    sourceQuote:
      'Pocos lugares con sombra hay por estos lares; en verano el sol cae sin piedad sobre los peregrinos.',
    sourceUrl: 'https://www.gronze.com/etapa/burgos/hornillos-camino/al-loro',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    fromTownId: 'hornillos-del-camino',
    toTownId: 'castrojeriz',
    sourceQuote:
      'Hoy caminamos muy expuestos al sol, especialmente en la primera mitad de la etapa; en verano debemos llevar agua suficiente y evitar las horas de máximo calor.',
    sourceUrl: 'https://www.gronze.com/etapa/hornillos-camino/castrojeriz/al-loro',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    fromTownId: 'castrojeriz',
    toTownId: 'fromista',
    sourceQuote: 'Como en las etapas precedentes, la exposición al sol es casi total.',
    sourceUrl: 'https://www.gronze.com/etapa/castrojeriz/fromista/al-loro',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    fromTownId: 'carrion-de-los-condes',
    toTownId: 'terradillos-de-los-templarios',
    sourceQuote:
      'Debemos llevar agua y provisiones suficientes en cualquier caso, más aún teniendo en cuenta la escasez de sombra.',
    sourceUrl: 'https://www.gronze.com/etapa/carrion-condes/terradillos-templarios/al-loro',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
  {
    fromTownId: 'ponferrada',
    toTownId: 'villafranca-del-bierzo',
    sourceQuote:
      'Ojo en verano, pues las temperaturas suelen ser elevadas y la mayor parte del recorrido es a pleno sol.',
    sourceUrl: 'https://www.gronze.com/etapa/ponferrada/villafranca-bierzo/al-loro',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
  },
]

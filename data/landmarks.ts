// data/landmarks.ts — F-15 안개 지도 상징적 장소 19곳 (프랑스 길)
//
// ⚠️ 출처: 전부 source: 'GUIDEBOOK'(공개 순례자 가이드 사이트·백과사전, 2026-07 조사).
//   실측(FIELD) 1인칭 체험담이 아니다 — 03문서 원안은 "실측 도보에서 직접 보고
//   쓴다"였지만, 지금은 누구도 안 걸었다. 그래서 storyKo는 "내가 겪은 이야기"가
//   아니라 "역사·유래 요약"이다. 실측 도보나 필드 테스터가 생기면 FIELD로
//   교체·보강한다(CLAUDE.md 규칙 1, 05문서 6.0절).
// ⚠️ 좌표(lat/lng)는 두지 않는다(schema.ts Landmark 주석 참고, 규칙 3과 같은 이유).
//   km은 towns.ts와 같은 경로상 위치 기준. 마을과 정확히 겹치지 않는 5곳
//   (레포에데르 고개·용서의 언덕·이라체 와인 샘·메세타 시작·철의 십자가)은
//   가이드북에 나온 대략 거리(예: "팜플로나에서 약 10~13km")로 추정한 값이라
//   정밀하지 않다 — 그렇게 표시했다.
//
// 출처 목록(대표):
//   - https://viajecaminodesantiago.com (이라체 와인 샘, 포르토마린)
//   - https://wisepilgrim.com (용서의 언덕, 레포에데르 고개, 부르고스)
//   - https://caminoways.com (철의 십자가, 폰페라다 성, 산토도밍고)
//   - https://roncesvalles.es, https://www.authentic-journeys.com (론세스바예스)
//   - https://en.wikipedia.org/wiki/Roncevaux_Pass, /wiki/Monte_do_Gozo
//   - https://www.britannica.com/topic/Fiesta-de-San-Fermin (팜플로나 산 페르민)
//   - https://www.gaudiallgaudi.com, https://www.palaciodegaudi.es (아스토르가)
//   - https://mappingspain.com, https://www.fundacionjacobea.org (레온 대성당)
//   - https://waypoints.ace.fordham.edu, https://thepilgrimsguide.com (비야프랑카 용서의 문)
//   - https://www.pilgrimaps.com, https://eucharisticmiracles.faith (오 세브레이로 성배)
//   - https://www.tourisme64.com (생장피드포르 성문)
//   - https://www.caminoadventures.com, https://followthecamino.com (메세타)
import type { Landmark } from '../lib/schema'

const CHECKED_AT = '2026-07'

export const landmarks: Landmark[] = [
  {
    id: 'gate-saint-jean',
    townId: 'saint-jean-pied-de-port',
    km: 0.0,
    nameKo: '생장피드포르 성문',
    nameEs: 'Porte Saint-Jacques',
    storyKo:
      '1120년경 지어진 중세 성문으로, 순례자들이 시타델 거리를 통해 구시가에 들어서던 관문이었다. 프랑스 길의 일부로 유네스코 세계유산에 올라 있다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 1,
  },
  {
    id: 'collado-lepoeder',
    townId: null,
    km: 21.0, // 추정치 — 론세스바예스(25.7km) 직전 마지막 5km 급하강 구간의 시작점 기준
    nameKo: '레포에데르 고개',
    nameEs: 'Collado de Lepoeder',
    storyKo:
      '해발 약 1,430~1,450m, 나폴레옹 루트의 최고점이자 프랑스·스페인 국경 능선이다. 여기서 론세스바예스까지 마지막 5km 동안 약 600m를 급하강한다 — 카미노에서 부상 위험이 가장 큰 구간으로 꼽힌다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 2,
  },
  {
    id: 'roncesvalles-monastery',
    townId: 'roncesvalles',
    km: 25.7,
    nameKo: '론세스바예스 수도원',
    nameEs: 'Real Colegiata de Roncesvalles',
    storyKo:
      '1132년 나바라 왕과 팜플로나 주교가 지은 수도원이자 순례자 병원. 778년 샤를마뉴의 후위대가 이 인근에서 전멸한 사건이 11세기 서사시 «롤랑의 노래»로 남아 전해진다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 3,
  },
  {
    id: 'pamplona-san-fermin',
    townId: 'pamplona',
    km: 67.5,
    nameKo: '팜플로나',
    nameEs: 'Pamplona',
    storyKo:
      '매년 7월 6~14일 산 페르민 축제 기간엔 소몰이(엔시에로)가 구시가를 가로지른다. 헤밍웨이가 1923년 이 축제를 처음 본 뒤 소설 «태양은 다시 떠오른다»(1926)를 써 세계에 알렸다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 4,
  },
  {
    id: 'alto-del-perdon',
    townId: null,
    km: 78.5, // 추정치 — 가이드북 상 팜플로나에서 약 10~13km 지점
    nameKo: '용서의 언덕',
    nameEs: 'Alto del Perdón',
    storyKo:
      '해발 770m. "용서의 언덕"이라는 이름은 13세기 순례자 병원과 예배당(Nuestra Señora del Perdón)에서 왔다. 정상의 강철 조각상(1996년, 비센테 갈베테 작)엔 "바람의 길과 별의 길이 만나는 곳"이라는 문구가 새겨져 있다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 5,
  },
  {
    id: 'puente-la-reina-bridge',
    townId: 'puente-la-reina',
    km: 91.4,
    nameKo: '푸엔테 라 레이나',
    nameEs: 'Puente la Reina',
    storyKo:
      '이름 그대로 "왕비의 다리". 11세기 나바라 왕비가 순례자를 위해 놓았다고 전해지는 6개 아치의 로마네스크 다리가 마을 이름의 유래이자 상징이다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 6,
  },
  {
    id: 'irache-wine-fountain',
    townId: 'ayegui',
    km: 116.3,
    nameKo: '이라체 와인 샘',
    nameEs: 'Fuente del Vino de Irache',
    storyKo:
      '1991년 이라체 와이너리가 설치한 무료 와인 샘. 수도꼭지가 둘인데 하나는 물, 하나는 와인이다. 중세 수도원이 순례자에게 와인을 대접하던 환대 전통과 «칼릭스티누스 고문서»의 일화에서 착안했다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 7,
  },
  {
    id: 'santo-domingo-cathedral',
    townId: 'santo-domingo-de-la-calzada',
    km: 212.2,
    nameKo: '산토 도밍고 대성당',
    nameEs: 'Catedral de Santo Domingo de la Calzada',
    storyKo:
      '대성당 안 고딕 양식 닭장에는 살아있는 수탉과 암탉 한 쌍이 산다. 14세기부터 전해지는 "목매달린 청년이 살아났다"는 기적담에서 비롯된 전통으로, "이미 구워진 닭도 울었다"는 말에서 유래했다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 8,
  },
  {
    id: 'burgos-cathedral',
    townId: 'burgos',
    km: 284.9,
    nameKo: '부르고스 대성당',
    nameEs: 'Catedral de Burgos',
    storyKo:
      '1221년 착공해 1567년 완성된 고딕 대성당으로, 스페인에서 단독으로 유네스코 세계유산에 오른 유일한 대성당이다(1984년). 중세 카스티야의 영웅 엘 시드(로드리고 디아스 데 비바르)의 유해가 안치돼 있다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 9,
  },
  {
    id: 'meseta-start',
    townId: 'burgos',
    km: 284.9, // 상징적 지점 — "부르고스 이후"로 통칭될 뿐 가이드북에도 정확한 경계는 없다
    nameKo: '메세타 시작',
    nameEs: 'Inicio de la Meseta',
    storyKo:
      '부르고스에서 레온까지 약 200km, 해발 700~900m의 밀밭 평원이 이어진다. 그늘도 굴곡도 없는 구간을 버스로 건너뛰는 순례자도 많지만, "진짜 카미노는 메세타에서 시작된다"고 말하는 이들도 많다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 10,
  },
  {
    id: 'leon-cathedral',
    townId: 'leon',
    km: 465.5,
    nameKo: '레온 대성당',
    nameEs: 'Catedral de León',
    storyKo:
      '13~15세기에 걸쳐 만든 스테인드글라스가 창 130개·장미창 3개를 채운다. 중세 고딕 성당치고 원본 유리창이 이렇게 많이 남은 경우는 드물다 — 부르고스·산티아고 대성당과 함께 카미노 3대 대성당으로 꼽힌다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 11,
  },
  {
    id: 'astorga-gaudi-palace',
    townId: 'astorga',
    km: 513.8,
    nameKo: '아스토르가 주교궁',
    nameEs: 'Palacio Episcopal de Astorga',
    storyKo:
      '안토니오 가우디가 카탈루냐 밖에 남긴 단 3개 건물 중 하나. 1889년 화재로 소실된 주교관 자리에 지었으나 교구와의 갈등으로 가우디는 완공을 못 보고 떠났고, 건물은 1913년에야 마무리됐다. 지금은 카미노 박물관으로 쓰인다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 12,
  },
  {
    id: 'cruz-de-ferro',
    townId: null,
    km: 541.2, // 추정치 — 폰세바돈(539.7km) 이후 약 1.5km 지점(가이드북 기준)
    nameKo: '철의 십자가',
    nameEs: 'Cruz de Ferro',
    storyKo:
      '해발 1,505m, 프랑스 길 최고점. 순례자가 고향에서 가져온 돌을 십자가 아래 내려놓는 전통이 있다 — 산티아고 대성당 건축에 돌을 보태던 중세 관습에서 비롯됐다는 이야기가 전해진다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 13,
  },
  {
    id: 'ponferrada-templar-castle',
    townId: 'ponferrada',
    km: 567.1,
    nameKo: '폰페라다 성',
    nameEs: 'Castillo de los Templarios',
    storyKo:
      '1178년 레온 왕이 성전기사단에 하사한 요새로, 카미노를 지나는 순례자를 보호하는 임무를 맡았다. 1282년 지금의 규모로 확장을 마쳤으나 1311년 기사단 해체와 함께 몰수됐다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 14,
  },
  {
    id: 'villafranca-puerta-del-perdon',
    townId: 'villafranca-del-bierzo',
    km: 591.3,
    nameKo: '비야프랑카 용서의 문',
    nameEs: 'Puerta del Perdón',
    storyKo:
      '1186년 아스토르가 주교가 세운 "용서의 문". 병이나 부상으로 산티아고까지 완주하지 못하는 순례자도 이 문을 통과하면 완주와 같은 사면을 받았다 — 그래서 비야프랑카는 "작은 콤포스텔라"라 불린다. 성년에만 열린다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 15,
  },
  {
    id: 'o-cebreiro-grail',
    townId: 'o-cebreiro',
    km: 619.7,
    nameKo: '오 세브레이로',
    nameEs: 'O Cebreiro',
    storyKo:
      '9세기에 지어진 순례자 숙소가 기원인 교회. 1300년경 미사 중 성체가 살과 피로 변했다는 기적이 전해지며, 이때 쓰인 성작이 "성배"로 불리게 됐다는 전설이 갈리시아 진입의 상징이 됐다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 16,
  },
  {
    id: 'sarria-100km',
    townId: 'sarria',
    km: 658.9,
    nameKo: '사리아',
    nameEs: 'Sarria',
    storyKo:
      '산티아고까지 정확히 114.2km — 콤포스텔라 발급 최소 도보 거리(100km)를 채울 수 있는 마지막 출발점이라, 프랑스 길에서 가장 많은 순례자가 여기서 첫걸음을 뗀다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 17,
  },
  {
    id: 'portomarin-flooded',
    townId: 'portomarin',
    km: 681.1,
    nameKo: '포르토마린',
    nameEs: 'Portomarín',
    storyKo:
      '1962년 벨레사르 저수지 건설로 옛 마을이 물에 잠기기 전, 로마네스크 교회 산 니콜라스를 돌마다 번호를 매겨 해체한 뒤 지금의 언덕 위치에 그대로 재조립했다. 가뭄으로 수위가 낮아지면 옛 마을 흔적이 다시 드러나기도 한다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 18,
  },
  {
    id: 'monte-do-gozo',
    townId: 'monte-do-gozo',
    km: 768.5,
    nameKo: '몬테 도 고소',
    nameEs: 'Monte do Gozo',
    storyKo:
      '"기쁨의 산"이라는 이름 그대로, 여기서 처음으로 산티아고 대성당의 첨탑이 보인다. 12세기 «칼릭스티누스 고문서»는 이곳을 라틴어로 Mons Gaudii라 불렀고, 프랑스 순례자들은 Montjoie라 했다.',
    source: 'GUIDEBOOK',
    checkedAt: CHECKED_AT,
    order: 19,
  },
]

// data/forks.ts — 프랑스 길 갈림길 11곳 (CLAUDE.md 절대 규칙 4)
//
// ⚠️ 출처: 공개 가이드북·순례자 포럼 (Gronze.com 포럼, epiccamino.com "A Guide to
//   Alternative Routes on the Camino Francés", 2026-07 조사).
//
// 2026-07-28 갱신 (2단계):
//   1) isMain(공식 표지 경로) variant 9곳은 towns.ts의 기존 마을 순서와 완전히
//      같은 구간이라, data/profiles.ts에 이미 계산돼 있는 OSM+EU-DEM 실측
//      구간값을 그대로 합산해 채웠다(source: 'OSM+EUDEM') — 새로 지어낸 숫자가
//      아니라 이미 검증된 값의 산술 합이다. Overpass로 재확인한 결과 isMain이
//      아닌 대안 경로는 최소 7곳이 OSM에 전용 relation이 없고, 범용 도보 라우팅
//      (OSRM)으로 재구성해봐도 가이드북 거리와 20%+ 오차가 나 신뢰할 수
//      없었다(2026-07-28 테스트) — 그래서 대안 경로는 OSM 재구성이 아니라
//      아래 2)의 가이드북 리서치로 채웠다.
//   2) 대안 경로 10곳을 가이드북·순례자 사이트(Gronze 등) 리서치로 조사.
//      distanceKm을 채운 것(발카를로스·비야르 데 마사리페·프라델라·드라곤테·
//      사모스·아르가 강변길·비야비에코, 전부 source: 'GUIDEBOOK', 신뢰도는 각
//      항목 주석 참조)과, 출처가 상충하거나(부르고스 강변길·발투이예) 시작·
//      합류가 같은 마을이라 "본선 대비 거리" 자체가 애매하거나(에우나테·
//      몬테후라·gamonal) 전 구간을 명시한 출처가 없어서(비아 트라야나) 여전히
//      null로 남긴 것이 있다 — 항목별 주석에 이유를 남겼다. 채우는 방법은
//      더 이상 "실측 도보 필수"로 못박지 않는다(CLAUDE.md Phase 2 조건 참조).
//
// 2026-08-03 갱신 — null 7곳 중 2곳 채움, 5곳은 이유 갱신:
//   Wikiloc·OutdoorActive의 실제 GPX 트랙 페이지를 자동 조회하려 했으나 봇 차단
//   (HTTP 403)으로 원본 지오메트리 확보는 실패했다. 대신 여러 2차 가이드
//   사이트를 교차 확인하는 방식으로 진행했다:
//   - 채움: 발투이예(8.6km, caminosantiagocompostela.com의 구간별 세부 내역이
//     기존 상충 수치 중 "+0.4km" 쪽과 일치), 몬테후라(14.6km+고도,
//     rutasnavarra.com이 waypoint·고도·소요시간까지 구체적으로 제시).
//   - 여전히 null: 에우나테(왕복/통과 정의가 다른 수치들끼리 섞여 있어 우리
//     정의와 정확히 같은 구간을 잰 출처를 못 찾음), 가모날·강변길(부르고스,
//     하루 전체 거리인지 도시 진입부만인지 기준 불명 + "비야프리아"와
//     "카스타냐레스" 변형이 같은 길인지 확인 안 됨), 비아 트라야나(찾은 수치가
//     대부분 렐리에고스가 아니라 만시야 데 라스 물라스 기준이라 병합 지점 자체가
//     다를 수 있음). 전부 항목별 주석에 상세 근거를 남겼다.
//
// ⚠️ towns.ts에 없는 변형 전용 마을(발카를로스·비야르 데 마사리페 등)은 Town
//   레코드를 새로 만들지 않았다 — 좌표를 지오코딩으로 지어내는 대신, 이름만
//   highlightsKo에 텍스트로 남겼다. 마을 레코드가 필요해지면 실측 도보 때
//   좌표를 직접 재서 추가한다.
//
// 출처 목록:
//   - https://www.gronze.com/foros/camino-frances/consulta-al-foro-variantes-camino-frances
//   - https://epiccamino.com/a-guide-to-alternative-routes-on-the-camino-frances/
//   - https://www.gronze.com/etapa/saint-jean-pied-port/valcarlos/roncesvalles/recorrido (발카를로스)
//   - https://www.gronze.com/etapa/leon/villar-mazarife/recorrido ,
//     https://www.gronze.com/etapa/villar-mazarife/astorga/recorrido (비야르 데 마사리페)
//   - https://www.gronze.com/etapa/villafranca-bierzo/cebreiro/recorrido (프라델라)
//   - https://www.rutasnavarra.com/Rutas/Camino-de-Santiago-%C2%ABFranc%C3%A9s%C2%BB-Variante-de-Montejurra_Villatuerta-Noveleta-Zaraputz-Urbanizaci%C3%B3n-Irache-Luqu%C3%ADn-Enlace-etapa-Estella-Los-Arcos_10023.html (몬테후라, 2026-08-03)
//   - https://www.caminosantiagocompostela.com/cacabelos-to-villafranca-del-bierzo/ (발투이예, 2026-08-03)
import type { RouteFork } from '../lib/schema'

export const forks: RouteFork[] = [
  {
    id: 'fork-saint-jean',
    splitTownId: 'saint-jean-pied-de-port',
    mergeTownId: 'roncesvalles',
    variants: [
      {
        id: 'napoleon',
        forkId: 'fork-saint-jean',
        nameKo: '나폴레옹 루트',
        nameEs: 'Ruta Napoleón',
        isMain: true,
        townIds: ['saint-jean-pied-de-port', 'orisson', 'roncesvalles'],
        distanceKm: 25.5,
        ascent: 1308,
        descent: 574,
        closedFrom: '11-01',
        closedTo: '03-31',
        roadShareRatio: null,
        hasShelter: true,
        traits: ['SCENERY', 'HISTORIC'],
        highlightsKo: ['피레네 고지 경관', '오리송 대피소(유일한 중간 지점)'],
        cautionKo:
          '겨울철(11/1~3/31) 폐쇄. 오리송 위로는 대피소가 없어 악천후 시 위험 — 당일 안전 판단은 생장 순례자 사무소를 따른다.',
        source: 'OSM+EUDEM',
      },
      {
        id: 'valcarlos',
        forkId: 'fork-saint-jean',
        nameKo: '발카를로스 루트',
        nameEs: 'Ruta por Valcarlos',
        isMain: false,
        townIds: ['saint-jean-pied-de-port', 'roncesvalles'],
        // Gronze 구간 페이지 기준 23.4km(2026-07-28 조사). 타 출처는 24~25km대로
        // 약간의 편차가 있다 — 정밀 OSM+EU-DEM 계산은 아니고 가이드북 인용치다.
        distanceKm: 23.4,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['EASIER', 'WINTER_SAFE', 'ROAD_HEAVY'],
        highlightsKo: ['발카를로스(Valcarlos) 마을 경유', '겨울철 유일한 선택지'],
        cautionKo: '도로(N-135) 병행 구간이 많다. 우천 시 강변길 일부가 위험하다는 포럼 보고가 있다.',
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-zubiri-pamplona',
    splitTownId: 'zubiri',
    mergeTownId: 'pamplona',
    variants: [
      {
        id: 'zubiri-main',
        forkId: 'fork-zubiri-pamplona',
        nameKo: '비야바·부를라다 시가지',
        nameEs: 'Ruta por Villava y Burlada',
        isMain: true,
        townIds: ['zubiri', 'pamplona'],
        distanceKm: 20.3,
        ascent: 153,
        descent: 245,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['ROAD_HEAVY'],
        highlightsKo: [],
        cautionKo: null,
        source: 'OSM+EUDEM',
      },
      {
        id: 'arga-riverside',
        forkId: 'fork-zubiri-pamplona',
        nameKo: '아르가 강변길',
        nameEs: 'Variante del paseo fluvial del río Arga',
        isMain: false,
        townIds: ['zubiri', 'pamplona'],
        // 본선(zubiri-main 20.3km) 대비 마지막 구간(트리니다드 데 아레→팜플로나)이
        // 약 1.5km 더 길다는 가이드 서술 종합(2026-07-28 조사, 원출처 URL 불명확 —
        // 신뢰도 중간). 20.3 + 1.5 ≈ 21.8km.
        distanceKm: 21.8,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['QUIET', 'SCENERY'],
        highlightsKo: ['트리니다드 데 아레(Trinidad de Arre) 경유', '시가지 대신 강변 산책로'],
        cautionKo: null,
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-eunate',
    splitTownId: 'obanos',
    mergeTownId: 'obanos',
    variants: [
      {
        id: 'eunate-direct',
        forkId: 'fork-eunate',
        nameKo: '직행',
        nameEs: 'Ruta directa',
        isMain: true,
        townIds: ['obanos'],
        distanceKm: null,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: [],
        highlightsKo: [],
        cautionKo: null,
        source: 'GUIDEBOOK',
      },
      {
        id: 'eunate-detour',
        forkId: 'fork-eunate',
        nameKo: '에우나테 경당 우회',
        nameEs: 'Variante por la Ermita de Eunate',
        isMain: false,
        townIds: ['obanos'],
        // 시작/합류가 같은 마을(obanos)이라 "본선 대비 거리"라는 개념 자체가
        // 애매하다 — distanceKm을 강제로 채우지 않는다. 2026-08-03 재조사(Wikiloc
        // 원본 트랙 페이지는 자동 접근이 막혀 있어 — HTTP 403 — 실측 GPX 원본
        // 확보는 실패, 2차 가이드 사이트로만 교차 확인): "에우나테 경당까지만
        // 왕복 시 약 2km"와 "무루사발→에우나테→오바노스로 계속 걸으면 약
        // +3~3.2km"가 서로 다른 걸 측정한 것으로 보이지만(왕복 vs 통과),
        // "오바노스에서 갈라졌다 오바노스로 되돌아온다"는 이 데이터의 정의와
        // 정확히 같은 구간을 잰 출처는 못 찾았다 — 여전히 신뢰 부족으로 보류.
        distanceKm: null,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['HISTORIC', 'SCENERY'],
        highlightsKo: ['에우나테(Eunate) 8각형 경당 — 12세기 건축, 유래 미상'],
        cautionKo: '약간 우회(왕복 기준 몇 km 추가 — 정확한 거리는 실측 필요).',
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-estella',
    splitTownId: 'villatuerta',
    mergeTownId: 'villatuerta',
    variants: [
      {
        id: 'estella-main',
        forkId: 'fork-estella',
        nameKo: '에스테야 경유 본선',
        nameEs: 'Ruta por Estella',
        isMain: true,
        townIds: ['villatuerta', 'estella'],
        distanceKm: 5.3,
        ascent: 47,
        descent: 35,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['HISTORIC'],
        highlightsKo: ['에스테야 구시가지·수도원'],
        cautionKo: null,
        source: 'OSM+EUDEM',
      },
      {
        id: 'montejurra',
        forkId: 'fork-estella',
        nameKo: '몬테후라 변형',
        nameEs: 'Variante de Montejurra',
        isMain: false,
        townIds: ['villatuerta'],
        // 시작/합류가 같은 마을(villatuerta)이 아니라 실제 합류 지점이 로스 아르코스
        // 방면이라 estella-main과 endpoint가 달라 "본선 대비 추가 거리" 개념은 여전히
        // 안 맞는다 — 대신 변형 자체의 총거리(비야투에르타 출발~에스테야-로스아르코스
        // 구간 합류)를 채운다. 2026-08-03 재조사: rutasnavarra.com(Napar
        // Bideak)이 노벨레타·사라푸스·이라체 우르바니사시온·루킨 경유 전체 구간을
        // 총거리(14.6km)+고도(+622m/-741m)+소요시간(3:11h)까지 구체적으로 제시 —
        // 순례자 전용 사이트는 아니지만(신뢰도는 GUIDEBOOK 중에서도 중간), 막연한
        // 서술이 아니라 waypoint별 실측 트랙 기반 수치라 채택. ascent/descent는
        // estella-main과 구간 자체가 달라 별도 값(위 수치)을 그대로 쓴다.
        distanceKm: 14.6,
        ascent: 622,
        descent: 741,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['QUIET', 'SHORTER'],
        highlightsKo: ['한적한 시골길'],
        cautionKo: '에스테야 시내·수도원을 지나지 않는다 — 관광이 목적이면 본선을 권한다.',
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-burgos',
    splitTownId: 'burgos',
    mergeTownId: 'burgos',
    variants: [
      {
        id: 'gamonal',
        forkId: 'fork-burgos',
        nameKo: '가모날 시가지',
        nameEs: 'Ruta por Gamonal',
        isMain: true,
        townIds: ['burgos'],
        // 2026-08-03 재조사: 이전 마을(산 후안 데 오르테가)~부르고스 공식 구간
        // 총거리는 towns.ts 실측치로 284.9-259.1=25.8km(가이드 사이트 표기 25.7~
        // 25.8km와 일치). 다만 이건 "하루 전체 구간" 거리이지 fork-burgos가
        // 의도하는 "부르고스 초입 갈림길 이후만의 거리차"와 같은 단위인지 불확실
        // 하다(도시 진입부 몇 km만의 변형인지, 하루 전체인지 출처마다 기준이 다름)
        // — 잘못 끼워맞추느니 null 유지.
        distanceKm: null,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['ROAD_HEAVY'],
        highlightsKo: [],
        cautionKo: '공식 표지 경로지만 산업지대·간선도로 구간이 길다는 포럼 평가가 많다.',
        source: 'GUIDEBOOK',
      },
      {
        id: 'burgos-riverside',
        forkId: 'fork-burgos',
        nameKo: '강변길 (비야프리아 경유)',
        nameEs: 'Ruta fluvial por Villafría',
        isMain: false,
        townIds: ['burgos'],
        // 시작/합류가 같은 마을(burgos)이고, 2026-07-28 조사에서 출처 두 곳이
        // "강변길이 더 짧다"/"더 길다"로 방향 자체가 상충해 보류했다. 2026-08-03
        // 재조사에서 "카스타냐레스·푸엔테스 블랑카스 경유 강변 변형"(공식 경로
        // 대비 약 +0.4km, 25.7→26.1km)을 찾았으나, 그 변형의 경유지는
        // 카스타냐레스(Castañares)로 서술돼 있어 이 데이터의 "비야프리아
        // (Villafría) 경유"와 실제 같은 길인지 확인이 안 된다 — 이름이 다른
        // 두 변형을 같다고 넘겨짚지 않는다. distanceKm 보류.
        distanceKm: null,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['QUIET'],
        highlightsKo: ['공항 인근 우회', '강변 공원'],
        cautionKo: null,
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-fromista',
    splitTownId: 'fromista',
    mergeTownId: 'villalcazar-de-sirga',
    variants: [
      {
        id: 'fromista-main',
        forkId: 'fork-fromista',
        nameKo: '도로 병행 본선',
        nameEs: 'Ruta oficial',
        isMain: true,
        townIds: ['fromista', 'villalcazar-de-sirga'],
        distanceKm: 13.3,
        ascent: 43,
        descent: 17,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['ROAD_HEAVY'],
        highlightsKo: [],
        cautionKo: null,
        source: 'OSM+EUDEM',
      },
      {
        id: 'villovieco',
        forkId: 'fork-fromista',
        nameKo: '비야비에코 강변길',
        nameEs: 'Variante por Villoviedo',
        isMain: false,
        townIds: ['fromista', 'villalcazar-de-sirga'],
        // 본선(fromista-main 13.3km) 대비 약 +1~1.3km라는 가이드 서술 종합
        // (2026-07-28 조사, 변형 총거리를 명시한 단일 출처 없음 — 신뢰도 낮음).
        // 중간값으로 14.4km ≈ 13.3 + 1.1.
        distanceKm: 14.4,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['SCENERY', 'QUIET'],
        highlightsKo: ['우시에사(Ucieza) 강변', '비야비에코(Villovieco) 경유'],
        cautionKo: null,
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-sahagun',
    splitTownId: 'sahagun',
    mergeTownId: 'reliegos',
    variants: [
      {
        id: 'sahagun-main',
        forkId: 'fork-sahagun',
        nameKo: '베르시아노스 경유 본선',
        nameEs: 'Ruta por Bercianos del Real Camino',
        isMain: true,
        townIds: ['sahagun', 'reliegos'],
        distanceKm: 29.4,
        ascent: 109,
        descent: 72,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: [],
        highlightsKo: [],
        cautionKo: null,
        source: 'OSM+EUDEM',
      },
      {
        id: 'via-trajana',
        forkId: 'fork-sahagun',
        nameKo: '비아 트라야나 (로마 가도)',
        nameEs: 'Vía Trajana / Calzada Romana',
        isMain: false,
        townIds: ['sahagun', 'reliegos'],
        // 2026-07-28 조사: "사아군→렐리에고스" 전 구간을 직접 명시한 단일 출처가
        // 없어 조각 구간을 이어붙인 추정(약 31~32km, 본선 29.4km보다 조금 김)만
        // 나왔다 — 신뢰도가 낮아 distanceKm을 채우지 않는다. 2026-08-03 재조사로
        // 찾은 수치(32km, 38.04km 등)도 대부분 "사아군→만시야 데 라스 물라스"
        // 기준이었다 — 비아 트라야나는 렐리에고스를 아예 지나지 않고 만시야로
        // 바로 이어진다는 서술도 있어(즉 병합 지점이 렐리에고스가 아닐 수 있음),
        // mergeTownId(reliegos)와 같은 지점을 잰 수치인지부터 불확실하다. 보류.
        distanceKm: null,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['QUIET', 'HISTORIC'],
        highlightsKo: ['로마 시대 가도', '칼사다 델 코토·칼사딜야 데 로스 에르마니요스 경유'],
        cautionKo: '약 18km 구간에 마을이 칼사딜야 데 로스 에르마니요스 한 곳뿐 — 물·식수 미리 준비.',
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-leon',
    splitTownId: 'leon',
    mergeTownId: 'hospital-de-orbigo',
    variants: [
      {
        id: 'villadangos',
        forkId: 'fork-leon',
        nameKo: '비야당고스 (차도)',
        nameEs: 'Ruta por Villadangos del Páramo',
        isMain: true,
        townIds: ['leon', 'villadangos-del-paramo', 'hospital-de-orbigo'],
        distanceKm: 31.0,
        ascent: 152,
        descent: 167,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['ROAD_HEAVY', 'SHORTER'],
        highlightsKo: [],
        cautionKo: '국도(N-120) 병행 구간이 길다.',
        source: 'OSM+EUDEM',
      },
      {
        id: 'villar-de-mazarife',
        forkId: 'fork-leon',
        nameKo: '비야르 데 마사리페',
        nameEs: 'Ruta por Villar de Mazarife',
        isMain: false,
        townIds: ['leon', 'hospital-de-orbigo'],
        // Gronze 구간 두 개(레온→비야르 21.1km + 비야르→오스피탈 구간) 합산 약
        // 36.0km(2026-07-28 조사). 독립 출처의 "+4.2km" 서술과 오차 0.8km로 대체로
        // 일치하나, 두 페이지를 이어붙인 값이라 본선만큼 정밀하지 않다.
        distanceKm: 36.0,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['QUIET'],
        highlightsKo: ['오신시아 데 라 발돈시나·비야르 데 마사리페·비야반테 경유(현재 towns.ts 미등록)'],
        cautionKo: null,
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-villafranca',
    splitTownId: 'villafranca-del-bierzo',
    mergeTownId: 'o-cebreiro',
    variants: [
      {
        id: 'valcarce-main',
        forkId: 'fork-villafranca',
        nameKo: '발카르세 계곡 본선',
        nameEs: 'Ruta por el valle del Valcarce',
        isMain: true,
        townIds: ['villafranca-del-bierzo', 'o-cebreiro'],
        distanceKm: 28.1,
        ascent: 890,
        descent: 70,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: [],
        highlightsKo: ['트라바델로·베가 데 발카르세 경유'],
        cautionKo: null,
        source: 'OSM+EUDEM',
      },
      {
        id: 'pradela',
        forkId: 'fork-villafranca',
        nameKo: '프라델라 능선 변형',
        nameEs: 'Variante de Pradela',
        isMain: false,
        townIds: ['villafranca-del-bierzo'],
        // 발카르세 계곡 본선(28.1km) 대비 Gronze 서술 기준 약 +1.5km(2026-07-28 조사).
        // ascent/descent는 본선과 변형 구간이 뒤섞인 출처라 특정하지 못해 null로 남긴다.
        distanceKm: 29.6,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['SCENERY'],
        highlightsKo: ['프라델라 마을 경유 능선길(현재 towns.ts 미등록)'],
        cautionKo: '본선보다 오르내림이 크다. 다음 날 오 세브레이로 오르막이 있어 포럼에서는 신중히 권한다.',
        source: 'GUIDEBOOK',
      },
      {
        id: 'dragonte',
        forkId: 'fork-villafranca',
        nameKo: '드라곤테 루트',
        nameEs: 'Ruta de Dragonte',
        isMain: false,
        townIds: ['villafranca-del-bierzo'],
        distanceKm: 26,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['SCENERY', 'QUIET'],
        highlightsKo: ['해발차 큰 산길 3회 반복', '연간 도보자 매우 적음(자료 기준 100명 미만)'],
        cautionKo: '총 약 26km, 약 9시간 소요(가이드북 기준). 매우 외딴 고난도 구간 — 대피소·마을이 거의 없다. 체력·날씨 확인 없이 권하지 않는다.',
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-triacastela',
    splitTownId: 'triacastela',
    mergeTownId: 'sarria',
    variants: [
      {
        id: 'san-xil',
        forkId: 'fork-triacastela',
        nameKo: '산 실 (짧음)',
        nameEs: 'Ruta por San Xil',
        isMain: true,
        townIds: ['triacastela', 'sarria'],
        distanceKm: 18.3,
        ascent: 294,
        descent: 528,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['SHORTER'],
        highlightsKo: ['숲길, 산 실 마을 경유(현재 towns.ts 미등록)'],
        cautionKo: null,
        source: 'OSM+EUDEM',
      },
      {
        id: 'samos',
        forkId: 'fork-triacastela',
        nameKo: '사모스 (대수도원)',
        nameEs: 'Ruta por Samos',
        isMain: false,
        townIds: ['triacastela', 'sarria'],
        distanceKm: 24.3,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['MONASTERY', 'HISTORIC'],
        highlightsKo: ['사모스 수도원(1000년 이상 역사, 수도원 알베르게)'],
        cautionKo: '본선보다 약 6km 더 걷는다(가이드북 기준).',
        source: 'GUIDEBOOK',
      },
    ],
  },
  {
    id: 'fork-cacabelos',
    splitTownId: 'cacabelos',
    mergeTownId: 'villafranca-del-bierzo',
    variants: [
      {
        id: 'cacabelos-main',
        forkId: 'fork-cacabelos',
        nameKo: '직행 본선',
        nameEs: 'Ruta directa (N-VI)',
        isMain: true,
        townIds: ['cacabelos', 'villafranca-del-bierzo'],
        distanceKm: 8.2,
        ascent: 155,
        descent: 127,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: true,
        traits: ['ROAD_HEAVY'],
        highlightsKo: [],
        cautionKo: null,
        source: 'OSM+EUDEM',
      },
      {
        id: 'valtuille',
        forkId: 'fork-cacabelos',
        nameKo: '발투이예 포도밭길',
        nameEs: 'Variante por Valtuille de Arriba',
        isMain: false,
        townIds: ['cacabelos', 'villafranca-del-bierzo'],
        // 2026-07-28 조사 당시엔 "+0.4km"과 "+3km"가 상충해 보류했다. 2026-08-03
        // 재조사: caminosantiagocompostela.com이 카카벨로스→피에로스 2.4km +
        // 피에로스→발투이예 데 아리바 3.3km + 발투이예→비야프랑카 2.9km로 구간별
        // 세부 내역을 제시(합계 8.6km) — 본선(cacabelos-main 8.2km, OSM+EUDEM
        // 실측) 대비 +0.4km로 두 쪽 상충하던 수치 중 작은 쪽과 일치해 채택한다.
        // "+3km" 쪽은 출처가 막연해 근거 부족 판단.
        distanceKm: 8.6,
        ascent: null,
        descent: null,
        closedFrom: null,
        closedTo: null,
        roadShareRatio: null,
        hasShelter: false,
        traits: ['SCENERY'],
        highlightsKo: ['비에르소 포도밭 지대', '발투이예 데 아리바 경유(현재 towns.ts 미등록)'],
        cautionKo: null,
        source: 'GUIDEBOOK',
      },
    ],
  },
]

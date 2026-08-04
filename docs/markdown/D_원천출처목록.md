# D. 원천 데이터 출처 목록 — 전체 한 곳에 모음

> **이 문서는 무엇인가**: `data/` 아래 모든 파일이 실제로 어느 URL·API에서 나온 값인지, 코드 주석에 흩어져 있는 걸 한 곳에 모았다. `B_지도데이터.md`·`C_숙소카드교통데이터.md`가 "어떻게 조사했나"를 설명한다면, 이 문서는 "어디로 가면 원본을 다시 볼 수 있나"만 순수하게 목록화한 것이다.
> ⚠️ **로컬에 캐시된 원본은 없다** (지도 좌표 JSON 예외, 5절 참고). 여기 적힌 URL이 재검증할 수 있는 유일한 경로다. 사이트 개편·페이지 삭제로 링크가 죽어있을 수 있다 — 그럴 땐 `DEVLOG.md`의 해당 날짜 항목에 조사 당시 확인한 값이 텍스트로 남아있다.

---

## 1. 지도·경로 (`data/towns.ts`, `data/profiles.ts`) — ⭐ 정식 문서화된 공개 API

이 프로젝트에서 유일하게 "사람이 웹페이지를 읽고 옮긴 게" 아니라 **코드가 API를 직접 호출**해서 만든 데이터다(`B_지도데이터.md` 1.1절).

| API | 문서 | 엔드포인트(예) | 인증 | 비용 |
|---|---|---|---|---|
| **Overpass API** | https://wiki.openstreetmap.org/wiki/Overpass_API | `overpass.kumi.systems/api/interpreter`, `overpass-api.de/api/interpreter` | 불필요 | 무료 |
| **Open Topo Data** | https://www.opentopodata.org/ | `api.opentopodata.org/v1/eudem25m?locations=lat,lng\|lat,lng...` | 불필요 | 무료(공개 인스턴스, 초당 1회 준수) |

- OSM relation 6개(ID: 2163569·2163558·2163560·2163561·2163565·2163559)
- EU-DEM 25m, 100m 간격 7,677개 좌표 조회
- (비교용, 미채택) IGN MDT05 — WCS INSPIRE 서비스(스페인 국립지리원). 정확한 엔드포인트 URL은 기록해두지 않았다. 급경사에서 부정확해 미채택 (`B_지도데이터.md` 3.3절)

### 1.1 식당·바·카페 1,247곳 (`data/restaurants.ts`, 2026-08-04) — 같은 API 재사용

숙소(Gronze.com 수작업)와 달리 이건 **Overpass API를 다시 호출**해서 만들었다 — `amenity~"restaurant|bar|cafe"` 태그를 마을 좌표(`towns.ts`의 lat/lng) 반경 700m로 조회. 82개 마을 전부 조회했고 61곳에서 데이터를 찾았다(21곳은 0건 — 지어내지 않고 빈 채로 둠, 좌표가 경로 위 보간점이라 실제 마을 중심과 약간 어긋났을 가능성도 있음, `data/restaurants.ts` 헤더 주석 참고).

- **뺀 필드**: `opening_hours`. 표본 조사(팜플로나 광장 208곳 중 24곳=11.5%, 오르니요스 3곳 중 1곳=33%) 결과 보유율이 너무 낮아 "정확한 데이터"로 볼 수 없었다 — `exposed_stretches.ts`가 같은 이유로 `Waypoint.opensAt`을 비워둔 전례와 동일 판단(규칙 1)
- **스크립트**: `scripts/pipeline/build_restaurants.py` (재시도 전략은 `build_geometry.py`의 `overpass()`와 동일 패턴)

## 2. 갈림길 11곳 (`data/forks.ts`)

**구조·정성적 조사**:
- https://www.gronze.com/foros/camino-frances/consulta-al-foro-variantes-camino-frances
- https://epiccamino.com/a-guide-to-alternative-routes-on-the-camino-frances/

**대안 경로 거리(GUIDEBOOK)**:
- https://www.gronze.com/etapa/saint-jean-pied-port/valcarlos/roncesvalles/recorrido — 발카를로스
- https://www.gronze.com/etapa/leon/villar-mazarife/recorrido
- https://www.gronze.com/etapa/villar-mazarife/astorga/recorrido — 비야르 데 마사리페
- https://www.gronze.com/etapa/villafranca-bierzo/cebreiro/recorrido — 프라델라
- https://www.rutasnavarra.com/Rutas/Camino-de-Santiago-Franc%C3%A9s-Variante-de-Montejurra_... — 몬테후라 (2026-08-03)
- https://www.caminosantiagocompostela.com/cacabelos-to-villafranca-del-bierzo/ — 발투이예 (2026-08-03)

## 3. 숙소 283곳 (`data/albergues.ts`)

| 조사 차수 | 출처 |
|---|---|
| 1차 (이름·유형·요금) | https://www.gronze.com/camino-frances — 구간별 33개 페이지 |
| 2차 (beds) | https://www.gronze.com — 개별 알베르게 상세 페이지 280개 |
| 3차 (reservation, 235/239곳) | https://www.gronze.com — 개별 상세 페이지 "Admite reserva" 절 |
| 4차 (나머지 4곳 + 정정 2건) | https://www.alberguescaminosantiago.com/, https://caminodesantiago.consumer.es/, https://caminomaps.org/ |

## 4. 그늘 없음 구간 7곳 (`data/exposed_stretches.ts`)

Gronze.com 각 구간 "Al Loro"(실용팁) 서브페이지:
- https://www.gronze.com/etapa/estella-lizarra/arcos/al-loro
- https://www.gronze.com/etapa/najera/santo-domingo-calzada/al-loro
- https://www.gronze.com/etapa/burgos/hornillos-camino/al-loro
- https://www.gronze.com/etapa/hornillos-camino/castrojeriz/al-loro
- https://www.gronze.com/etapa/castrojeriz/fromista/al-loro
- https://www.gronze.com/etapa/carrion-condes/terradillos-templarios/al-loro
- https://www.gronze.com/etapa/ponferrada/villafranca-bierzo/al-loro

> 나머지 26개 구간도 같은 패턴(`gronze.com/etapa/{slug}/al-loro`)으로 조사했으나 명시적 근거를 못 찾아 배열에서 제외(추정 금지, 규칙 1).

## 5. 안개 지도 랜드마크 19곳 (`data/landmarks.ts`)

- https://viajecaminodesantiago.com — 이라체 와인 샘, 포르토마린
- https://wisepilgrim.com — 용서의 언덕, 레포에데르 고개, 부르고스
- https://caminoways.com — 철의 십자가, 폰페라다 성, 산토도밍고
- https://roncesvalles.es, https://www.authentic-journeys.com — 론세스바예스
- https://en.wikipedia.org/wiki/Roncevaux_Pass, /wiki/Monte_do_Gozo
- https://www.britannica.com/topic/Fiesta-de-San-Fermin — 팜플로나 산 페르민
- https://www.gaudiallgaudi.com, https://www.palaciodegaudi.es — 아스토르가
- https://mappingspain.com, https://www.fundacionjacobea.org — 레온 대성당
- https://waypoints.ace.fordham.edu, https://thepilgrimsguide.com — 비야프랑카 용서의 문
- https://www.pilgrimaps.com, https://eucharisticmiracles.faith — 오 세브레이로 성배
- https://www.tourisme64.com — 생장피드포르 성문
- https://www.caminoadventures.com, https://followthecamino.com — 메세타

## 6. 접근 교통 4개 경로 (`data/access.ts`)

- https://stingynomads.com/st-jean-pied-de-port-how-go-get/
- https://www.omio.com — 파리~바욘, 바욘~생장, 팜플로나~생장 요금
- https://airviewkorea.com — 인천~파리 직항 항공사·소요시간
- 예약 링크: https://www.sncf-connect.com

## 7. 계획된 이동수단 (`data/transit.ts`)

- https://www.omio.com/buses/burgos/leon — ALSA 버스
- https://www.busbud.com/en/bus-leon-burgos — 요금대 확인
- https://www.omio.com/trains/burgos/leon — Renfe Alvia 기차
- https://www.omio.es/autobuses/sahagun/leon-qh9gu — 사아군~레온 버스
- 예약 링크: https://www.alsa.com, https://www.renfe.com

## 8. 보여주기 카드 23장 (`data/cards.ts`)

**외부 URL 출처 없음.** B·C 15장은 F-04 `phrasebook.ts`와 같은 수준의 자체 작성 표준 회화, A(부상) 7장 초안도 마찬가지로 자체 작성 스크립트다(규칙 11 준수 여부는 `data/cards.test.ts`의 금칙어 테스트로 검증). "가져온 데이터"가 아니라 "직접 쓴 콘텐츠"라 이 목록에 해당 항목이 없다.

---

## 9. 로컬에 원본이 실존하는 유일한 예외

`data/geometry/`(git에는 없음, `.gitignore` 대상)에 Overpass API 원본 응답이 JSON으로 남아있다:

```
01_sjpp_logrono_ways.json      706KB
03_logrono_burgos_ways.json    418KB
04_burgos_leon_ways.json       436KB
06_leon_cacabelos_ways.json    414KB
07_cacabelos_palas_ways.json   438KB
08_palas_santiago_ways.json    267KB
full_route.json               1.45MB  (스티칭 완료본)
restaurants_checkpoint.json    (식당 파이프라인 재실행용 체크포인트, 1.1절)
```

`scripts/pipeline/build_geometry.py`·`build_restaurants.py`가 Overpass API를 다시 호출하면 언제든 재생성 가능한 산출물이라 커밋하지 않았다. 이 파일들이 로컬에서도 사라지면, 1절의 relation ID 또는 1.1절의 마을 좌표로 Overpass API를 다시 호출해 복구한다.

---

## 10. 관련 문서

| 문서 | 내용 |
|---|---|
| `B_지도데이터.md` | 지도·고도 데이터 조사 방법·검증 과정 |
| `C_숙소카드교통데이터.md` | 숙소·카드·안개지도·교통 데이터 조사 방법·확보율 |
| `DEVLOG.md` | 각 출처를 실제로 조사한 날짜·과정·판정 기준 상세 기록 |

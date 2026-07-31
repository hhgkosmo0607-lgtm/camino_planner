# 개발 로그 (DEVLOG)

> 무엇을·왜 바꿨는지 날짜순 기록. 최신이 위. 쉬운 설명은 `학습노트.md`, 규칙은 `CLAUDE.md`.

---

## 2026-07-31 (34) — F-24 접근 교통을 Day 0으로 일정에 통합

**배경**: `data/access.ts`(접근 교통 4개 경로)와 `/tools/access` 화면은 F-19 이전에
이미 있었지만 `/plan` 일정 계산기와 분리된 독립 페이지였다. 이어서작업.md가 남긴
다음 후보 중 사용자가 "F-24 Day 0 통합"을 선택했다.

- **`lib/geo.ts`**: `accessRoutesTo(toTownId)`/`findAccessRoute(id)` 추가 —
  `data/access.ts` 조회 헬퍼(기존 `findTransitOptions` 패턴과 동일).
- **`components/AccessDay0.tsx`(신설)**: `ForkPicker`와 같은 태도 — 링크(`<a>`)만
  으로 동작(JS 없이도 선택됨), `ar=routeId` 쿼리로 선택 상태를 URL에 담는다
  (규칙 8). 어느 경로도 권하지 않고 소요시간·비용·구간만 보여주며, 선택하지
  않아도 `buildPlan()` 계산에는 전혀 영향이 없다 — `PlanInput`/`Stage` 스키마는
  건드리지 않았다(접근 교통은 도보 구간 계산과 무관한 별개 정보이기 때문).
- **`app/plan/page.tsx`**: 출발지가 생장피드포르일 때만(`accessRoutesTo`가
  빈 배열이 아닐 때) 에타파 목록 맨 위에 "Day 0" 카드로 렌더. 레온·사리아
  출발(접근 경로 데이터가 없는 출발지)에서는 자동으로 숨는다.
- **`app/plan/print/page.tsx`**: `ar` 쿼리가 있으면 인쇄용 표에도 0일차 행으로
  같이 찍힌다(60대 이상 순례자에게 닿는 유일한 경로라는 규칙 9 취지에 맞춰
  인쇄본에서도 누락되지 않게 함).
- **`app/tools/access/page.tsx`**: 각 경로 카드에 "이 경로로 일정 만들기 →"
  링크(`/plan?ar=routeId`) 추가 — 두 화면을 서로 오갈 수 있게 배선.
- 새 스키마 필드·새 테스트 없음(순수 조회 헬퍼 2개 + 렌더 전용 컴포넌트라
  계산 로직이 아님, 규칙 6 대상 아님). `tsc`·`vitest`(102/102)·`eslint`·
  `next build`(184p, 신규 라우트 없음) 통과. `npm run dev`로 `/plan?ar=via-paris`
  (선택 시 전체 구간 펼쳐짐 확인)·`/plan?start=leon`(Day 0 미노출 확인)·
  `/plan/print?ar=via-paris`(0일차 행 확인) 직접 curl로 SSR 결과 확인.

---

## 2026-07-30 (33) — F-19 갈림길 화면(ForkPicker) 구현, variantChoices 배선

**배경**: `lib/schema.ts`의 `PlanInput.variantChoices`(forkId→variantId)는 이미 있었지만
`lib/planner/split.ts` 어디에서도 읽지 않았다 — `Stage.variantId`도 늘 `null`로
고정. `data/forks.ts`(갈림길 11곳 구조·거리)는 있는데 화면이 없어 "데이터+화면
세트" 원칙(CLAUDE.md 작업 방식)에 어긋난 상태였다.

- **`lib/planner/forks.ts`(신설, 순수 함수)**: `forksFullyInStage(fromKm, toKm)` —
  fork가 하루 구간(Stage)에 완전히 들어갈 때만 반환한다. 하루 목표거리가 짧아
  fork 중간에서 날짜가 끊기면(경계 걸침) 본선 구간별 프로파일과 변형 전체
  거리를 정확히 대응시킬 수 없어 아예 손대지 않는다(규칙 1 — 틀린 숫자를
  보여주느니 선택지를 숨긴다). `defaultVariant`/`selectedVariant`(존재하지 않는
  variantId는 기본값 폴백)와, 나폴레옹 루트 겨울 폐쇄(11-01~03-31, 연말 경계
  넘김)를 판정하는 `isVariantClosedOn`도 여기 있다.
- **`lib/planner/split.ts`의 `applyVariantOverrides`**: fork가 통째로 들어가는
  Stage에 한해 선택한 variant의 `distanceKm`(있으면)으로 거리를 덮어쓰고
  `estimatedMinutes`를 재계산한다. `ascent`/`descent`는 변형 쪽 실측이 없으면
  (`null`) 본선 값을 그대로 보존한다 — 지어내지 않는다. `Stage.hazards`/
  `warnings`는 여전히 본선 기준으로 남아있다(변형 경로의 구간별 위험 데이터가
  없어서 정직하게 그대로 뒀다).
- **`lib/url.ts`**: `v=forkId~variantId,forkId~variantId` 쿼리 파라미터 추가
  (`skip`과 같은 인코딩 패턴). `withVariantChoice()`로 ForkPicker의 링크
  href를 서버 렌더 시점에 미리 계산한다(JS 없이도 클릭이 동작해야 하므로,
  규칙 7·8).
- **`components/ForkPicker.tsx`(신설)**: `/plan`의 각 날짜 카드(`StageCard`)
  안, 위험구간 배지 아래에 렌더. variant마다 이름·거리(있으면)·특징·주의
  문구를 보여주고, 계절 폐쇄 기간이면 경고를 덧붙인다. "어느 쪽도 권하지
  않는다"(F-26과 같은 태도) — 순수 정보 제공. 링크(`<a>`)만으로 동작.
- `StageCard.tsx`의 `HAZARD_ICON`에 `ROAD_WALKING`/`WINTER_RISK`/`EXPOSED`
  한글 라벨을 추가했다(이미 `buildHazards()`가 만들고 있었는데 화면 라벨
  매핑만 빠져 있었다 — 별개 세션이 채운 EXPOSED 포함 3종이 지금까지 영문
  타입명 그대로 노출되고 있던 걸 이번에 발견해 같이 고침).
- **실제 브라우저로 검증**: `npm run dev` + Playwright(Chrome 채널)로
  `/plan?start=saint-jean-pied-de-port&d=28&sd=2026-12-15` 접속 → 1일차
  카드에 ForkPicker 렌더, 발카를로스 클릭 → URL이
  `v=fork-saint-jean~valcarlos`로 바뀌고 거리 25.7km→23.6km, 콤포스텔라
  안내의 총 도보거리(773→771km)까지 연쇄적으로 정확히 갱신됨을 확인.
  겨울 폐쇄 경고("겨울철(11-01~03-31) 폐쇄 기간입니다")도 `sd`가 폐쇄
  기간일 때 정상 노출. 콘솔 에러 없음.
- 테스트 27개 추가(`forks.test.ts` 14개, `split.test.ts` 4개, `url.test.ts` 9개).
  `tsc --noEmit`·`vitest`(102/102)·`eslint`·`next build`(184 정적 페이지)
  전부 통과.
- **남은 것**: 23개 variant 중 7개(에우나테·몬테후라·gamonal·부르고스강변길·
  비아트라야나·발투이예 등)는 `distanceKm`이 여전히 `null`이라 ForkPicker에
  거리 없이 정보만 뜬다 — `data/forks.ts` 자체의 한계(2026-07-28 조사 기록
  참고)이지 이번 화면 작업의 버그가 아니다.

## 2026-07-29 (32) — F-20 위험구간 8종 중 마지막 EXPOSED(그늘 없음) 구현

**배경**: `lib/schema.ts`의 `HazardType`에는 이미 `EXPOSED`가 정의돼 있었지만
`lib/planner/split.ts`의 `buildHazards()`는 만들지 않고 있었다. CLAUDE.md 위험
유형 8종 중 유일하게 남아 있던 것("그늘 없음"). 같은 파일에 이미 실제 데이터로
구현돼 있던 `ROAD_WALKING`(차도 병행)·`WINTER_RISK`(겨울 결빙)와 같은 방식으로
"확인된 것만 채운다"(규칙 1)를 따랐다.

- **방법**: Gronze.com 공식 프랑스 길 33구간 페이지의 "Al Loro"(실용팁) 서브페이지를
  전부(변형 구간 3개 제외, 메인 루트만) WebFetch로 열어 "그늘이 없다/노출된다"는
  명시적 서술(sin sombra, apenas sombra, escasez de sombra, expuesto/a al sol, a
  pleno sol 등)이 있는지 확인했다. "그늘이 있다"는 반대 서술(프로미스타→카리온
  데 로스 콘데스, 베르시아노스→만시야 구간의 "áreas de descanso con sombra")과,
  그늘과 무관한 일반 기후 서술(로그로뇨→나헤라의 "en verano, el calor es
  intenso")은 애매하다고 보고 넣지 않았다.
- **결과**: 33구간 중 7구간에서 명시적 근거를 찾아 채웠다 — 에스테야→로스
  아르코스(정확히는 하위 구간 비야마요르 데 몬하르딘→로스 아르코스 12.2km),
  나헤라→산토 도밍고 데 라 칼사다, 부르고스→오르니요스 델 카미노, 오르니요스
  델 카미노→카스트로헤리스, 카스트로헤리스→프로미스타, 카리온 데 로스
  콘데스→테라디요스 데 로스 템플라리오스, 폰페라다→비야프랑카 델 비에르소.
  새 파일 `data/exposed_stretches.ts`(`source: 'GUIDEBOOK'`, 각 항목에 원문
  인용·출처 URL 포함)에 담고, `lib/planner/split.ts`의 `buildHazards()`에
  세 번째 블록으로 판정 로직을 추가했다. ROAD_WALKING/WINTER_RISK는 마을쌍
  프로파일(연속 두 마을) 단위로 판정하지만, exposed_stretches.ts는 공식 33구간
  (여러 마을을 아우름) 단위 데이터라 km 범위 겹침으로 판정하는 점이 다르다 —
  에스테야→로스 아르코스처럼 공식 구간의 일부만 근거가 있는 경우도 정확히
  반영하기 위해서다.
- **함께 검토했으나 구현하지 않은 것**:
  - **통신 두절(NO_SIGNAL)**: 프랑스 길에 대한 체계적 자료가 없다 — 포럼에
    나오는 통신 두절 얘기는 대부분 다른 루트(Camino Olvidado·Picos de
    Europa)였다. 지어내지 않고 보류.
  - **바 개점 시각(`Waypoint.opensAt`)**: 소도시 바 영업시간은 계절마다 바뀌고
    안정적 출처가 없다. 정적 데이터로 박아두면 오히려 틀린 정보를 안내하게
    되므로 구현하지 않았다.
- `lib/planner/split.test.ts`에 EXPOSED 테스트 2건 추가(부르고스→오르니요스
  구간, 비야마요르 데 몬하르딘→로스 아르코스 하위 구간).
- `tsc --noEmit`·`vitest`·`next build` 전부 통과 확인.

## 2026-07-29 (31) — data/albergues.ts reservation 필드 실제 조사 완료 (239곳 중 235곳)

**배경**: `2026-07-28 (29)` 항목(beds 보강) 직후, `reservation` 필드도 같은 방식으로
채웠다는 주석이 파일 상단에 있었으나 실제로는 조사가 전혀 실행되지 않았다 —
호출부에 `reservation` 인자 자체가 없어 전부 기본값 `UNKNOWN`으로 남아 있었다.
이전 세션이 토큰 부족으로 계획만 적어놓고 실행을 못 한 채 종료한 것으로 추정된다
(직전 커밋 "토큰 없다 ㅜ"). 이번 세션이 실제로 조사해 채웠다.

- **방법**: MUNICIPAL·XUNTA·DONATIVO 44곳은 이미 CLAUDE.md 도메인 사실로 일괄
  `NONE` 처리돼 있어 그대로 뒀다. PARISH·MONASTERY·PRIVATE 239곳을 Gronze.com
  개별 알베르게 상세 페이지의 "Admite reserva" 필드 + 연락처 절(전화/이메일/
  자체 홈페이지/Booking.com 등)을 WebSearch로 페이지를 찾고 WebFetch로 내용을
  확인하는 방식으로 하나씩 조사했다.
- **판정 기준**: Booking.com 등 온라인 예약 시스템이 명시되면 `ONLINE`. "por
  WhatsApp"이 명시되면 `WHATSAPP`. 전화·이메일·자체 홈페이지만 있고 온라인
  예약 시스템이 확인 안 되면 `PHONE`(보수적 판정 — 실제로는 이메일 예약도
  가능할 수 있지만 전화가 항상 되는 공통분모라 대표값으로 채택). "Admite
  reserva: No"가 명시되면 `NONE`. 페이지가 없거나 판정 근거가 전혀 없으면
  인자를 추가하지 않고 `UNKNOWN` 기본값 그대로 뒀다 — 추측 금지(규칙 1).
- **결과**: 239곳 중 235곳 확인 완료 — `PHONE` 81 · `WHATSAPP` 5 · `ONLINE` 132 ·
  `NONE` 17. 4곳은 끝까지 확인 못해 `UNKNOWN`으로 남았다: 벨로라도 Albergue
  parroquial de Belorado, 토산토스 Albergue parroquial San Francisco de Asís
  (둘 다 Gronze 페이지에 "Admite reserva" 필드나 예약 관련 서술 자체가 없고
  전화번호만 있어 판정 근거 부족), 카스트로헤리스 Espacio Interior·엘 부르고
  라네로 Albergue de peregrinos Domenico Laffi(둘 다 beds 조사 때도 상세
  페이지를 못 찾았던 곳과 동일 — 여전히 없음).
- **작업 중 발견한 버그**: beds가 `null`로 남아 5-인자 호출이던 카카벨로스
  Saint James Way·트라바델로 Camino y Leyenda 두 곳에 reservation을 그대로
  6번째 자리에 추가했더니 헬퍼 `a(townId, name, type, priceEur, beds?, reservation?)`
  시그니처상 5번째 자리(`beds: number | null`)에 문자열이 들어가 `tsc` 타입
  에러가 났다. `beds` 자리에 `null`을 명시로 채우고 그 뒤에 reservation을
  넣어 수정했다.
- **작업 중 발견한 사고**: 이 리포는 워크트리 격리 에이전트로 실행 중이었는데
  초반 작업을 실수로 공유 체크아웃 경로(`C:\02Workspaces\camino_planner\data\
  albergues.ts`)에 했다 — 41건이 잘못된 위치에 적용됐다. 공유 체크아웃 파일을
  워크트리 원본으로 복원(`cp`)하고, 같은 조사 결과를 워크트리 경로에 재적용해
  바로잡았다. 이후 작업은 전부 워크트리 경로에서 진행했다.
- 파일 상단 주석(reservation 3차 조사 단락)을 실제 결과(235/239, 4곳 목록,
  판정 기준)로 정직하게 갱신 — 이전 주석의 "PARISH·MONASTERY(33곳)는 개별
  조사, PRIVATE(206곳)도 개별 조사" 같은 과장(실제로는 실행 자체가 안 됐었음)을
  제거했다.
- 재확인: `tsc --noEmit`·`vitest`(76/76)·`next build`(184페이지) 전부 통과.
- **남은 일**: contact·openFrom/openTo·hasKitchen 등 나머지 세부 필드는 여전히
  이번 조사 범위 밖(UNKNOWN/null). 4곳 미확인은 향후 Gronze 페이지가 보강되거나
  다른 출처가 확인되면 채울 수 있다.

## 2026-07-28 (29) — data/albergues.ts beds 필드 보강 (283곳 중 280곳)

F-02(혼잡 추정) 착수 전 선행 작업. F-02는 마을 침대 수가 있어야 판단이 가능한데
albergues.ts의 `beds`는 전부 `null`이었다("출처에 거의 안 나와서" — 이전 세션이
구간 요약 페이지만 봤기 때문). 백그라운드 에이전트로 재조사를 위임했다(세션
한도로 한 번 중단됐다 재개, 총 2회차).

- **개별 알베르게 상세 페이지**(Gronze.com, 구간 요약 페이지가 아니라 알베르게
  하나당 페이지의 "Precios y plazas" 절)에서 도미토리별 침대 수를 찾아 합산하는
  방식으로 전환 — 구간 요약 페이지엔 없던 정보가 개별 페이지엔 있었다.
  283곳 중 280곳 확보, 3곳(카스트로헤리스 Espacio Interior, 카카벨로스 Saint
  James Way, 트라바델로 Camino y Leyenda)은 페이지가 없거나 방 단위로만 표기돼
  침대 합계를 못 내서 `null`로 남겼다 — 지어내지 않았다.
- **조사 중 자체 교정 사례**: "도미토리 개수"와 "총 침대 수"를 혼동해 틀린 값을
  넣을 뻔한 경우가 여러 건 있었다(예: 수비리 Río Arga Ibaia — 도미토리 3개를
  침대 3개로 오독할 뻔함, 실제 20개). 이상치는 "Precios y plazas" 원문을 재확인해
  고쳤다.
- `a(townId, name, type, priceEur, beds?)` — 헬퍼에 선택적 5번째 인자 추가, 기존
  4-인자 호출은 그대로 `beds: null` 유지.
- 재확인: `tsc`·`vitest`(54/54, 이 시점까지) 통과.

## 2026-07-28 (30) — F-02 혼잡 추정: 정밀 수요 공식 대신 실제 확인 가능한 요소만으로 3단계 판정

F-26 다음 순서. 사용자가 "전체 283곳 다 조사"를 선택해 먼저 알베르게 침대 수를
보강(29번 항목)한 뒤 F-02 본 기능을 구현했다.

- **`lib/planner/congestion.ts`(신설)**: 03 문서 F-02 원안의 "예상 수요 = 기준
  순례자 수 × 계절계수 × 요일계수 × 구간계수 × 특수일계수" 정밀 공식은 구현하지
  않았다 — 하루 단위 기준 순례자 수 실측 데이터가 없어 계수를 지어내야 했기
  때문(규칙 1). 대신 실제로 확인 가능한 요소만 점수화해 3단계(LOW/HURRY/HIGH)로
  판정: 마을 실측 침대 수, 사리아 이후 구간(기존 도메인 사실), 성수기(5~10월,
  WebSearch로 "83%가 이 기간 도착" 확인) + 9월 최성수, 부활절(Meeus/Jones/Butcher
  그레고리력 계산식 — 결정론적 계산이라 지어낸 값 아님, 2024~2028 실제 날짜로
  테스트 검증), 성 야고보 축일(7/25, 산티아고 인근만)·산 페르민(7/6~14, 팜플로나
  인근만)·2027 성년(기존 CLAUDE.md 사실).
- **데이터 불일치 발견·해결**: 구현 중 `data/towns.ts`의 기존 `beds` 필드(출처 불명
  레거시 값)와 새로 조사한 `data/albergues.ts` 합계가 81개 마을 중 21곳에서 50%
  넘게 차이 나는 걸 발견(몬테 도 고소 400→1120, 부르고스 350→136 등). 사용자에게
  물어 "새 조사치로 towns.ts 교체"를 선택받아 81/82 마을의 `beds`를 albergues.ts
  실측 합계로 교체했다(오바노스만 albergues.ts에 데이터가 없어 레거시 값 유지).
  `REST_TOWN_MIN_BEDS`(휴식일 배치)·`FEW_BEDS`(경고) 임계값 로직에 영향을 주지만
  재검증 결과 회귀 없음.
- **`lib/schema.ts`**: `CongestionLevel`·`CongestionInfo` 타입 신설, `Stage.congestion`
  필드 추가. 기존에 있었지만 늘 `null`이었던 `Stage.date`도 이번에 실제로 채웠다
  (`lib/planner/split.ts`의 `finalizeDatesAndCongestion()` — 휴식일 삽입으로
  `dayNo`가 재부여된 *이후*에만 날짜를 계산할 수 있어서 별도 후처리 단계로 분리).
- **`lib/geo.ts`**: `totalBedsForTown()` 추가(beds 확인된 알베르게만 합산, 전부
  null이거나 마을에 알베르게 자체가 없으면 null).
- **`components/StageCard.tsx`**: 등급별 색상(LOW=moss, HURRY=중립, HIGH=vino, 노란
  flecha는 쓰지 않음 — 규칙 "길 안내 전용")로 표시. 반영된 근거가 하나도 없으면
  표시 안 함(빈 카드로 겁주지 않기 위함).
- 테스트: `congestion.test.ts` 16개(부활절 실제 날짜 검증 포함) + `split.test.ts`에
  배선 검증 5개 추가(총 76/76).
- 재확인: `tsc`·`eslint`·`next build`(184페이지) 전부 통과. `npm run start`로
  `/plan?start=sarria&sd=2026-09-01` SSR 확인 — "서두르세요"·"만실 가능성 높음"과
  실제 반영 근거("사리아 이후 구간 — ...", "성수기(5~10월) — 순례자의 약 83%가...")
  전부 노출.

## 2026-07-28 (28) — F-26 계획된 이동수단: 메세타 실제 버스·기차 노선 반영

F-05 다음 순서로 착수. "실측 도보로 노선·요금 확인 후"라던 기존 M20 조건은 Phase 2 게이트
재해석(2026-07-27) 이후로는 적용되지 않는다 — 공개 예매 사이트 조사로 충분히 착수 가능.

- **`data/transit.ts`(신설)**: WebSearch로 부르고스~레온(ALSA 버스 약 1시간 40분·€15~35,
  Renfe Alvia 기차 약 1시간 20분·€20~40)과 사아군~레온(ALSA 버스 약 55분·€6~9) 실제 노선을
  조사. 03 문서 F-26 원안 목업의 "버스 약 3시간"은 실제 조사 전 추정치였음을 확인, 실측
  1시간 40분으로 정정.
  출처: Omio·Busbud·Alsa 공식(부르고스~레온), Omio.es(사아군~레온).
- **`lib/schema.ts`**: `TransitOption` 인터페이스 신설(PlannedTransport는 "계획", TransitOption은
  "조사된 실제 노선" — 후자로 전자를 채우는 구조).
- **`lib/geo.ts`**: `findTransitOptions(from, to)` 추가 — 조사해둔 구간만 찾고 없으면 빈 배열
  (지어내지 않음, 규칙 1).
- **`lib/url.ts`**: `parseSkips()`가 이제 `findTransitOptions()`로 실제 mode·소요시간·비용을
  채운다. 조사 안 된 임의 구간은 기존처럼 일반 문구+costEur null로 정직하게 폴백.
- **`components/PlanControls.tsx`**: 기존 단일 체크박스("메세타 버스로 건너뛰기")를 3지
  라디오(전부 걷기/사아군→레온만/부르고스→레온 전체)로 교체, 각 옵션에 실제 소요시간·요금·
  단축거리 표시. **어느 쪽도 권하지 않는다는 원칙(CLAUDE.md 규칙 4 정신)은 유지** — 담담하게
  정보만 제공.
- `app/plan/page.tsx`의 `skipMeseta: boolean` prop을 `skip: '' | 'sahagun~leon' | 'burgos~leon'`
  문자열로 교체.
- 재확인: `tsc`·`eslint`·`next build`(184페이지, 신규 라우트 없이 `/plan` 강화) 전부 통과.
  `npm run start`로 `/plan?skip=burgos~leon`·`skip=sahagun~leon` SSR 확인 — "ALSA 버스 약
  1시간 40분 · 메세타 건너뛰기"·"약 €25", "ALSA 버스 약 55분"·"약 €8" 실제 값 노출 확인.

## 2026-07-28 (27) — F-05 짐배송 비용 비교 완료 (리스크 수치화는 보류)

사용자가 "순서대로 다 진행"을 확정해 F-04 다음으로 바로 착수. `/tools/cost`와 같은
독립형 계산기 패턴(범위로 출력, lib/planner 밖에 인라인 순수 함수)을 따랐다.

- **`app/tools/luggage/page.tsx`(신설)** + `LuggageControls.tsx`: 도보 일수·힘든 날 수를
  입력받아 배송 안 함/힘든 날만/매일 3개 시나리오의 배송비+숙박비 차액+총 추가 비용을
  범위로 계산. "공립은 짐 배송을 안 받는다"(CLAUDE.md 기존 도메인 사실) → 배송 쓰는 날은
  예약 가능한 사립로 숙소가 강제 전환되는 구조를 그대로 반영.
- **배송비 €5~7/구간을 WebSearch로 재확인**(Correos Paq Mochila·Jacotrans 등 공개 요금).
  숙박비 공립 €8~10·사립 €12~25는 `/tools/cost`가 이미 쓰던 조사치를 재사용.
- **03 문서 원안의 "부상 위험 점수 62→41→28"은 구현하지 않기로 판단**: 지금 위험 점수
  엔진(`risk.ts`)은 이미 "의학 근거 없는 임시 가중치"라고 자인하는 상태인데, 배낭 무게가
  점수에 얼마나 영향을 주는지는 그보다도 근거가 없어 새 가중치를 만드는 게 규칙 11
  정신에 어긋난다고 봤다. 대신 배낭 계산기(F-07)와 같은 정성적 문장("짐 없이 걸으면
  무릎·발 부담이 줄어든다")만 안내 — 숫자는 지어내지 않았다.
- 03 문서 F-05 절 상단에 완료 배너 추가(비용만 완료, 리스크는 보류라고 명시).
- `ToolNav`·`sitemap.ts`에 반영(무료 도구 6번째). 재확인: `tsc`·`eslint`·`next build`
  (184페이지) 전부 통과. `npm run start`로 `/tools/luggage` SSR 확인, 계산값 수기 검산 일치.

## 2026-07-28 (26) — F-04 전화·WhatsApp 예약 스크립트 생성기 완료

새 조사가 거의 필요 없는 순수 콘텐츠 작업으로 F-04를 완료했다. 표준 관광 회화 수준의 스페인어
템플릿 6종(알베르게 전화·WhatsApp·약국·빈대 신고·응급·식당)에 인원·시각·이름만 채워 넣는다.

- **`lib/phrasebook.ts`(신설)**: `buildPhrase(situation, params)` 순수 함수. 인원 1~9명(우노~누에베),
  시각 0~23시(도세~온세, "de la mañana/tarde/noche" 문법 포함)를 스페인어·한글 발음·뜻 3단으로
  생성. 이름은 선택 입력.
- **규칙 11 준수가 핵심**: 약국·응급·빈대 문장은 "도움·추천을 요청"하는 데서 멈춘다 — 어떤 약도
  이름으로 지정하지 않고("소염제 주세요" 대신 "뭐가 좋을지 추천해 주시겠어요?"), 처치 방법도
  안내하지 않는다. `phrasebook.test.ts`에 금칙어 목록(이부프로펜·소염제·파라세타몰·아스피린·
  연고·붕대)을 만들어 6개 상황 전부에서 자동으로 감시하는 테스트를 추가했다 — 코드 리뷰로만
  잡기 쉬운 회귀를 막기 위함.
- **`app/tools/phrases/page.tsx`(신설)** + `PhraseControls.tsx`(상황·인원·시각·이름 입력,
  URL 쿼리스트링 상태) + `CopyButton.tsx`(범용 클립보드 복사, `ShareButton.tsx`와 같은 패턴).
  약국·응급·빈대 화면에는 "처치·복용은 현지 약사·의료진의 안내를 따르세요" caption을 명시.
  `ToolNav`·`sitemap.ts`에 추가.
- 테스트 18개 추가(총 54/54). `tsc`·`eslint`·`next build`(183페이지) 전부 통과. `npm run start`로
  `/tools/phrases` 4개 상황(albergue_call·pharmacy·emergency·bedbug) SSR 콘텐츠 curl 확인.

## 2026-07-27 (25) — F-20 일자별 상세: 거점·위험구간을 실제 데이터로 산출 (부분 구현)

새 조사 없이 이미 가진 데이터(town.services, profiles.ts)만으로 되는 코딩 작업으로 F-20에 착수했다.

- **`lib/planner/split.ts`**: `buildWaypoints()` — 구간 안 중간 마을들의 서비스 중 WaypointKind와 직접 대응되는 것만(WATER·PHARMACY·ATM·BAG_TRANSFER→BAG_DROP) 거점으로 뽑는다. SHOP·MEDICAL·MASS는 대응되는 WaypointKind가 없어 그냥 뺐다(지어내지 않음). `buildHazards()` — profiles.ts 하강이 임계치(500m) 넘는 구간을 STEEP_DESCENT로, 물/바 있는 마을 사이 간격이 10km 넘으면 NO_WATER로 표시. 그늘·차도·통신·겨울 위험은 그 데이터 자체가 없어서 만들지 않았다.
- **`components/StageCard.tsx`**: `<details>/<summary>`로 "일자별 상세 보기" 펼침 추가 — 순수 HTML 접기라 JS 없이도 서버 렌더된 그대로 동작(규칙 7).
- **테스트 6개 추가**(`split.test.ts`, 총 36/36): 거점이 START(0km)~ARRIVE(distanceKm) 범위 안에서 오름차순인지, 이동수단 구간엔 거점·위험이 없는지, 엘 아세보→몰리나세카에 STEEP_DESCENT hazard가 실제로 잡히는지, hazard의 km 범위가 항상 유효한지.
- 03 문서 F-20 절 상단에 "부분 구현" 배너 추가 — 원래 목업(첫 바 개점 시각, 세요 위치, 숙박 예약 상태, 그늘/차도/통신 위험)의 상당수는 가진 데이터로 계산할 수 없어 비워뒀다고 명시.
- 재확인: `tsc`·`vitest`(36/36)·`eslint`·`next build`(182페이지, 기존 `/plan` 화면 강화만) 전부 통과. `npm run start`로 `/plan` SSR 확인 — "일자별 상세 보기" 70회, "급내리막"·"물 없음"·"식수"·"약국" 전부 HTML에 노출.

## 2026-07-27 (24) — data/albergues.ts 신설: 82개 마을 알베르게 283곳 (F-05 기반 데이터)

Phase 2에서 가장 크고 중요한 항목("침대 확보 불안이 1번 문제", CLAUDE.md 실제 애로사항)에 착수했다. Gronze.com의 프랑스 길 표준 구간(etapa) 33개 페이지를 전수 조사해 82개 마을 중 81곳의 알베르게 정보를 확보했다.

- **조사 방법**: `https://www.gronze.com/etapa/...` 33개 페이지를 WebFetch로 순회. 각 요청에서 우리 towns.ts에 실제로 있는 마을 이름만 지정해 추출(중간에 지나가지만 towns.ts에 없는 작은 마을·산장은 제외 — forks.ts 때와 같은 원칙, 좌표 없는 Town을 새로 만들지 않는다).
- **필터링**: Hostal·Hotel·Pensión·Casa Rural·Apartamento 등 일반 숙박은 제외하고 "Albergue"(또는 Gîte d'étape·Refugio 등 순례자 전용 표현)만 남겼다. "일시 휴업" 명시된 곳도 제외(문 닫은 곳을 있는 것처럼 보이면 규칙 1 위반).
- **⚠️ Xunta 구분 실제로 적용**: CLAUDE.md "숙소 자주 틀림" 표가 경고하는 그대로 — O 세브레이로부터 산티아고까지(갈리시아) 공립 알베르게는 지자체가 아니라 Xunta(갈리시아 자치정부) 소관이라 `type: 'XUNTA'`로, 그 앞(나바라~카스티야) 공립은 `'MUNICIPAL'`로 정확히 갈랐다.
- **schema.ts**: `Albergue.source`에 `'GUIDEBOOK'` 추가(원래 `FIELD|PARTNER|USER_REPORT|PLACEHOLDER`만 있었음 — RouteVariant·AccessRoute와 다른 패턴이었던 걸 통일).
- **데이터 규모**: 283개 레코드, 81/82 마을(오바노스는 실제로 순례자 전용 알베르게가 검색에 없어 0개 — 지어내지 않고 그대로 둠). `priceEur`는 도미토리 최저가 하나만(정밀 요금표 아님), `beds`·`reservation`·`contact`·`openFrom/openTo`·`hasKitchen` 등은 이번 조사 범위 밖이라 전부 `null`/`UNKNOWN`으로 정직하게 남겼다.
- **화면 연결**: `lib/geo.ts`에 `getAlbergues()`·`ALBERGUE_TYPE_LABEL` 추가, `app/town/[slug]/page.tsx`의 "정보 확인 중" 자리를 실제 목록(이름·유형·요금·출처·확인일자)으로 교체. 데이터 없는 마을(오바노스)은 기존 플레이스홀더 문구 그대로 유지.
- **검수에서 잡은 실수**: 트리아카스텔라 항목에 실수로 사리아 데이터를 복붙해 넣었다가, 마을별 albergue 개수 자동 대조(모든 town id가 최소 1개는 있는지 스크립트로 확인)로 발견·재조사해 수정.
- 재확인: `tsc`·`vitest`(30/30)·`eslint`·`next build`(182페이지, 기존 town 페이지 내용만 강화돼 페이지 수 변화 없음) 전부 통과. `npm run start`로 `/town/sarria`(Xunta 표시 확인)·`/town/obanos`(플레이스홀더 유지 확인) SSR 렌더 확인.

## 2026-07-27 (23) — access.ts 출처 정직성 보완 + /tools/access 화면 (무료 도구 4번째)

- **출처 점검**: `data/forks.ts`(23개 변형)·`data/access.ts`(4개 경로) 전부 `source`/`checkedAt` 필드가 빠짐없이 채워져 있는지 재확인(grep으로 개수 대조). `access.ts`의 `estimatedCostKrw`가 유럽 내 기차·버스 요금(직접 검색 확인)과 인천↔유럽 항공권 몫(01 문서 기존 왕복 추정치를 편도로 나눈 값, **이번에 재검색 안 함**)을 섞고 있었는데 같은 `GUIDEBOOK` 라벨을 붙이고 있어서, 파일 상단 주석과 각 줄 인라인 주석으로 이 차이를 명시적으로 갈랐다.
- **`/tools/access` 신설**: 무료 도구 4번째(`ToolNav`에 추가, `sitemap.ts` 반영). `data/access.ts`의 4개 경로를 구간별(비행기·기차·버스·택시) 소요시간·요금·주의사항과 함께 보여준다. 서버 컴포넌트, 입력 없는 순수 참고 페이지라 정적 생성됨.
- 화면 상단에 "가이드북 출처, 2026-07 확인, 예약 전 재확인" 고지를 넣어 규칙 1(데이터 출처 정직성)을 화면에서도 지킨다.
- README.md의 "실측 도보 완료 전까지 Phase 2 착수 안 함" 서술도 정정(전전 항목 반영이 누락돼 있었음).
- 재확인: `tsc`·`vitest`(30/30)·`eslint`(JSX 큰따옴표 이스케이프 수정 1건)·`next build`(**182페이지**) 전부 통과. `npm run start`로 `/tools/access` SSR 렌더 확인(JS 없이도 4개 경로 이름 전부 노출).

## 2026-07-27 (22) — data/access.ts 신설: 접근 교통(F-24) 4개 경로 확보

Phase 2 게이트 정정(바로 전 항목) 이후 첫 착수 항목으로 F-24(접근·귀환 교통)를 골랐다 — 알베르게 실데이터보다 범위가 작고 이미 CLAUDE.md에 뼈대(파리·비아리츠·팜플로나 경유, 바욘→생장 하루 6편)가 있어서 검증이 빠르다고 판단했다.

- **조사**(WebSearch): 인천→파리 직항(약 14시간10분, 대한항공·아시아나·티웨이·에어프랑스·루프트한자), 파리 몽파르나스→바욘 TGV(4시간, 40유로, 하루 5~8편), 바욘→생장(1시간, 12유로, 하루 6편 — 기존 CLAUDE.md 값과 일치 확인), 비아리츠 공항→바욘 버스(Txiktxak, 25분, 2유로), 팜플로나→생장 버스(성수기 ALSA/Conda, 1시간45분, 22유로 / 비수기는 직행 없어 팜플로나→론세스바예스 버스+택시로 대체).
- **발견한 것**: 03 문서가 예전부터 "CDG 공항에 TGV역이 있어 시내에 안 나가도 된다"고 적어뒀는데, 실제로는 그 경로가 환승 포함 약 6시간 반으로 몽파르나스 경유(4시간)보다 훨씬 느리다는 걸 재검색으로 확인 — 둘 다 유효한 선택지라 둘 다 기록하고 트레이드오프를 캡션에 남겼다.
- **schema.ts**: `AccessRoute`에 `source: 'FIELD'|'GUIDEBOOK'|'ESTIMATED'`·`checkedAt`(YYYY-MM) 필드 추가 — `RouteVariant`와 같은 패턴. 인천→비아리츠·인천→팜플로나는 직항이 없어 구체적 경유편을 지어내지 않고 `durationMin`/`costEur`를 `null`로 남겼다(캐주얼하게 "파리 경유겠지"로 추정하지 않음).
- **`data/access.ts` 신설**: 4개 경로(파리·비아리츠·팜플로나 성수기·팜플로나 비수기). 전부 `source: 'GUIDEBOOK'`, `checkedAt: '2026-07'`. 항공·기차 요금은 변동이 잦아 04 문서 "정기 재확인"(연 2회, 3월·9월) 대상에 편입.
- CLAUDE.md 디렉터리 구조·F-24 각주, 03 문서 F-24·M18 항목에 반영.
- 재확인: `tsc`·`vitest`(30/30)·`eslint`·`next build`(181페이지, 아직 이 데이터를 쓰는 화면 없음) 전부 통과.

## 2026-07-27 (21) — "실측 도보 완료 전까지 Phase 2 금지" 조건 정정 + 필드 테스터 대안 신설

사용자가 "실측 도보 없이도 데이터를 안 지어낼 수 있지 않냐"고 문제를 제기했다. 맞는 지적이었다 — CLAUDE.md·05 문서가 "실측 도보"(직접 걷기)와 "데이터를 지어내지 않는다"(절대 규칙 1)를 하나로 묶어놓았을 뿐, 둘은 원래 별개다.

### 정리

- **규칙 1(데이터 지어내지 않기)의 실제 조건은 "출처가 있는가"이지 "직접 걸었는가"가 아니다.** 어제 만든 `data/forks.ts`(가이드북·포럼 출처, `source: 'GUIDEBOOK'`)가 이미 그 사례다. → **Phase 2는 이제 "실측 도보 완료 후"가 아니라 "출처 있는 데이터로 채울 수 있는 만큼 지금 착수"로 조건이 바뀐다.**
- 다만 실측 도보를 요구했던 이유가 하나 더 있었다: **정밀 지오메트리(가이드북엔 없고 OSM에도 없는 갈림길 변형 경로의 정확한 거리·오르막/내리막)**와 **안개 지도 랜드마크의 1인칭 스토리**, 그리고 **"걸어보지 않은 팀이 만든 앱은 커뮤니티에서 즉시 판별된다"는 신뢰 문제**다. 이 셋은 가이드북으로 못 채운다 — 데이터 정확성이 아니라 별개의 이유라 이번 정정 대상이 아니다.
- 사용자가 이 남은 문제(커뮤니티 신뢰·1인칭 콘텐츠)의 해법을 제시했다: **창업팀이 직접 걷는 대신, 어차피 카미노를 걸을 예정인 순례자를 필드 테스터로 모집**해 같은 데이터(GPX·숙소 체크리스트·랜드마크 사진)를 받는 방법. 오히려 여러 실제 순례자가 참여했다는 사실 자체가 창업팀 단독 도보보다 커뮤니티 신뢰에 유리할 수 있다는 논리다.

### 반영

- **CLAUDE.md**: Phase 2 착수 조건 문단을 "출처 있는 데이터면 착수 가능 / 정밀 지오메트리·1인칭 콘텐츠·커뮤니티 신뢰는 여전히 누군가 실제로 걸어야 하되 창업팀일 필요는 없음"으로 재작성. F-19·F-15 각주 정정.
- **05_검증계획.md**: 6장(실측 도보) 앞에 **"6.0 방법 두 가지 — 창업팀 도보 vs 필드 테스터 모집"** 절 신설. 비교표(비용·데이터 다양성·커뮤니티 신뢰·일관성·리스크) 포함. 어느 쪽으로 할지는 아직 결정하지 않았다고 명시.
- **00_README.md**(v6.13), **이어서작업.md**: Phase 2 조건·확인 순서·판단 게이트 표기를 동일하게 정정.
- **바꾸지 않은 것**: 갈림길 정밀 지오메트리는 여전히 `null`이고, 규칙 1(출처 없이 지어내지 않기) 자체는 그대로 유효하다. "실측 도보"라는 단어를 문서에서 지운 게 아니라, 그게 걸려 있던 **조건의 성격**(데이터 정확성 vs 신뢰·콘텐츠)을 분리했을 뿐이다.

## 2026-07-27 (20) — Phase 3+ 지도·내비게이션 백엔드 아키텍처 논의를 06 문서에 기록

앱 트랙(Phase 3+)에서 쓸 지도·라우팅 백엔드 아키텍처 제안을 사용자와 논의하고 06 문서에 정리했다. **아직 착수가 아니라 기록만** — 실측 도보(Phase 2 게이트)도 안 끝났고 이 백엔드는 그보다 뒤다.

- 레이어별 선택: MapLibre GL(렌더링) · PMTiles/Protomaps(타일) · GraphHopper(미시 라우팅, 셀프호스팅) · 자체 엔진(거시 라우팅, PostGIS+networkx) · Photon(지오코딩, 셀프호스팅) · Copernicus GLO-30(고도, 사전 계산) · OSM+Overture(POI 기반) · 구글 Places(POI 상세, 실시간 호출만).
- **핵심 논점 — 오프라인/온라인 분리**: 구글 Places를 "저장 금지, 실시간 호출만"으로 쓰면 통신이 끊기면 그 정보를 못 본다는 뜻이라, 규칙 10(메세타·갈리시아 통신 두절 구간에서도 핵심 기능 동작)과 충돌한다. → 지도·라우팅·고도·OSM 기반 POI는 **오프라인 필수**(사전 다운로드), 구글 Places·실시간 대중교통·지오코딩 자동완성은 **온라인 보너스**(없어도 핵심 기능 지장 없음)로 역할을 나누기로 확정.
- `providers/` 계층으로 외부 소스별(OSM/GraphHopper/Google/GTFS) 추상화 + 소스별 라이선스·저장 정책 분리 — `data/forks.ts`의 `source: 'GUIDEBOOK'` 같은 기존 출처 관리 패턴(규칙 1)을 백엔드 아키텍처 레벨까지 그대로 끌고 간 것.
- 규모별 확장 계획(MVP → 1,000명 → 전세계)도 함께 기록 — 지금 당장 필요 없는 건(PgBouncer, 읽기 복제본, OR-Tools 등) 미리 깔지 않는다는 원칙 유지.
- 06_개발가이드.md "저장소 구조 결정" 절 바로 뒤에 새 절로 추가(v2.0→v2.1). 00 문서 개정 이력 v6.12.

## 2026-07-27 (19) — data/forks.ts 신설: 갈림길 11곳 구조만 채움, 수치는 실측 전까지 null

실측 도보 없이 Phase 2(갈림길 추천, F-19)로 넘어갈 수 있는지 검토했다. 결론: **구조는 공개 자료로 채울 수 있지만, 정확한 거리·오르막/내리막은 지금 채울 수 없다** — 채우려 하면 규칙 1(데이터 지어내지 않기)을 어기게 된다.

### 조사

- Gronze.com 포럼("변형 경로" 스레드), epiccamino.com "Alternative Routes on the Camino Francés" 등에서 갈림길 11곳 후보를 조사(WebSearch·WebFetch). 기존 문서에 이름만 있던 "그 외 8곳"의 실체를 확인: 아르가 강변길(수비리~팜플로나) · 에우나테 우회 · 몬테후라 변형(에스테야) · 부르고스 강변길 · 비야비에코(프로미스타) · 비아 트라야나(사아군) · 프라델라·드라곤테(비야프랑카~오세브레이로) · 발투이예 포도밭길(카카벨로스). 기존 3곳(생장·레온·트리아카스텔라)과 합쳐 정확히 11곳.
- 메인 루트처럼 OSM relation을 찾아 이어붙이는 방식을 시도했으나, **Overpass에서 조사한 10개 변형 이름 중 최소 7개가 전용 `route=hiking` relation이 아예 없었다**(에우나테·드라곤테·비야르 데 마사리페·산 실·비아 트라야나·프라델라·사모스). 이름 없는 way 조각으로만 존재해서 마을 단위로 수동 추적해야 하고, 이건 메인 루트 파이프라인보다 오히려 손이 많이 간다.
- **환경 메모**: 이 환경에서 Overpass API에 Python `urllib`으로 직접 요청하면 매번 막히거나(HTTP 406, Apache 레벨 차단으로 추정) 응답 없이 멈춘다. **`curl`로 우회하면 통과한다**(요청 헤더/TLS 핑거프린트 차이로 추정) — 단 짧은 시간에 여러 번 부르면 429(rate limit)에 걸리므로 호출 사이 10~15초 이상 띄워야 한다.

### 결정·구현

- **schema.ts**: `RouteVariant`의 `distanceKm`·`ascent`·`descent`·`roadShareRatio`를 `number` → `number | null`로 변경(null=실측 전). `source: 'FIELD' | 'GUIDEBOOK' | 'ESTIMATED'` 필드 신설 — `Albergue.source`와 같은 패턴. 이 타입을 실제로 쓰는 코드가 아직 없어서(F-19 미구현) 기존 로직에 영향 없음(`tsc` 확인).
- **`data/forks.ts` 신설**: 11곳 전부, 각 변형의 이름·경유 마을(towns.ts에 있는 것만)·계절 폐쇄·정성적 특징(traits)·주의사항을 가이드북 근거로 채웠다. 전부 `source: 'GUIDEBOOK'`, 수치 필드는 전부 `null`. towns.ts에 없는 변형 전용 마을(발카를로스·비야르 데 마사리페·프라델라 등)은 좌표를 지어내지 않고 이름만 `highlightsKo` 텍스트로 남겼다.
- CLAUDE.md 규칙 4, 00 문서 5.1절, 03 문서 F-19·M19를 "forks.ts 구조는 있음, 수치는 실측 도보 후"로 정정.
- 재확인: `tsc`·`vitest`(30/30)·`eslint`·`next build`(181페이지, forks.ts를 아직 쓰는 화면이 없어 변화 없음) 전부 통과.

### 교훈

애초에 "파이프라인만 확장하면 금방 되겠지"라고 판단한 게 틀렸다. **CLAUDE.md가 Phase 2를 실측 도보 뒤로 미룬 이유(규칙 1)가 바로 이거였다** — 갈림길 변형 경로는 OSM에 깨끗하게 준비돼 있지 않아서, 결국 실측 도보에서 GPX를 직접 남기는 것 말고는 정직한 방법이 없다.

## 2026-07-27 (18) — 완주 보상 브레인스토밍: 안개 지도 시간 기록 추가, 새 후보 신설 (00 문서 v6.10)

"보상은 소유욕을 만들어야 한다"(00 문서 2.6절) 관련 브레인스토밍 요청에 답하며 문서를 갱신했다.

- **결정·반영**: 안개 지도에 **스팟별 도착 날짜·시각**을 화면·포스터에 실제로 보여주기로 확정. 스키마에는 이미 `FogState.revealedAt`(랜드마크 ID → 개방 시각)이 있어서 **새 데이터 모델이 필요 없다** — 지금까지 내부에만 있던 값을 사용자에게 드러내는 화면·인쇄 설계만 추가하면 된다. 03 문서 6.4절, 00 문서 2.6절, CLAUDE.md "완주 이후" 반영.
- **후보로만 신설(미채택)**: 여정 타임랩스(매일 기록을 하루씩 재생하는 영상) · 고도 단면 포스터(`Elevation.tsx`를 실제 기록으로 그려 포스터화, 컴포넌트 재활용이라 원가 거의 0). 채택하려면 03 문서 6.8 채택 순서·6.9 지표에 정식 편입 필요.
- **⚠️ 결정 보류 — 캐릭터(마스코트) 도입 여부**: v5.1에서 "마스코트를 만들지 않고 이미 있는 것을 쓴다"고 명시적으로 제외했던 것을 이번에 재검토 요청받았다. **아직 결론 내지 않았다** — 도입 시 후보 두 방향(콘차 의인화 / 순례자 실루엣 아이콘)만 03 문서 6.4절에 기록해두고, F축처럼 실제로 뒤집을지는 다음에 확정한다. 어느 쪽이든 flecha(노란색)는 캐릭터 색으로 쓰지 않는다는 규칙은 유지.
- **각인 조가비(A6)는 이미 있던 항목**이라 브레인스토밍에서 나온 "조가비 각인" 제안은 신규 추가가 아니라 기존 항목 재확인으로 처리.
- `docs/markdown` 변경에 맞춰 `python scripts/regen_docs.py`로 재생성.

## 2026-07-27 (17) — axe-core 접근성 자동 검사 도입 (06 문서 CI 파이프라인)

`06_개발가이드.md` "CI 파이프라인" 표에 `playwright test` 다음 단계로 `axe-core 검사`가 명시돼 있었는데 빠져 있었다. Phase 2 데이터가 아니라 이미 만든 Phase 1 화면의 테스트 인프라라 지금 채워도 되는 항목이라 판단해 추가했다.

- `@axe-core/playwright` devDependency 추가, `e2e/accessibility.spec.ts` — 화면 템플릿 10종(`/`, `/plan`, `/plan/print`, `/town/[slug]`, `/stage/[slug]`, `/route/[slug]`, `/tools/{cost,pack,timeline}`, `/privacy`)에 대해 WCAG 2A/2AA 기준으로 자동 검사. 06 문서 기준대로 critical·serious 심각도만 실패 조건으로 삼는다(마을·구간 82/81개는 같은 컴포넌트 재사용이라 전부 다 돌릴 필요 없음).
- 결과: 10개 페이지 전부 **critical/serious 0건.** 참고로 심각도 전체(minor·moderate 포함)로 넓혀 한 번 더 돌려봐도 **0건** — 규칙 9(접근성 하한선)가 실제로 잘 지켜지고 있음을 자동 검증으로 확인.
- `test:e2e`(`playwright test`)가 `e2e/` 전체를 도니 별도 스크립트 불필요.
- 재확인: `tsc`·`vitest`(30/30)·`playwright test`(11/11: E2E 1 + 접근성 10)·`next build`(181페이지) 전부 통과.

## 2026-07-27 (16) — 전 문서·코드 주석 쉬운 말 정리

"모든 문서파일과 주석을 쉬운 용어로, 전문용어는 괄호로 뜻을 설명" 요청에 따라 3단계로 나눠 진행했다.

- **1단계 — 핵심 문서**: `CLAUDE.md`(순수 함수·서버 렌더·useEffect·ODbL·EU-DEM·React Native·워크스페이스 등), `README.md`(Vitest·Playwright·Resend 등), `이어서작업.md`(레이트리밋·SDK 등)에 괄호 설명 추가. `학습노트.md`는 이미 이 취지로 잘 쓰여 있어 깨진 글자(mojibake) 하나만 고쳤다. 카미노 스페인어 도메인 용어(알베르게·크레덴시알 등)는 규칙 5(원어 병기)의 대상이라 그대로 뒀다.
- **2단계 — 코드 주석 44개 파일**: `app/`·`components/`·`lib/`·`config/`·`scripts/` 전수 확인. 대부분 이미 짧고 명확했고, 실제로 손댄 곳은 `lib/schema.ts`(역참조)·`lib/planner/split.ts`(탐욕 분할)·파이썬 파이프라인 3종(haversine·선형보간·슬러그·LiDAR·WCS INSPIRE 등)·`scripts/regen_docs.py`(pandoc·gfm) 정도. `python -m py_compile`로 파이썬 문법 확인.
- **3단계 — docs/markdown 사업·전략 문서 11개**(약 12,700줄): 전체를 다시 쓰지 않고, 반복 등장하는 비즈니스·개발 전문용어(세그먼트·전환율·리텐션·바이럴·화이트라벨·페르소나·MVP·KPI·LTV·GPX)를 각 문서 안 **첫 등장 지점에서만** 괄호로 풀이했다. `A_순례길입문.md`는 검색에 걸리는 용어가 없어 그대로 뒀다.
- 세 단계 모두 뒤 `tsc`·`vitest`(30/30)·`playwright test`(1/1)·`next build`(181페이지)로 재확인, 매번 통과.
- `docs/markdown`·`CLAUDE.md`를 여러 차례 고쳤으므로 그때그때 `python scripts/regen_docs.py`로 `docs/docx/*`·`문서뷰어.html` 재생성.

## 2026-07-27 (15) — Playwright E2E 도입 (06 문서 시나리오 1)

`06_개발가이드.md` "테스트 전략"이 명시한 3개 E2E 시나리오 중 지금 있는 기능으로 실행 가능한 **시나리오 1(일정 생성 → 공유 → 복원)** 만 구현했다. 시나리오 2(갈림길 선택)·3(Plan B)은 해당 UI가 아직 없어(Phase 2·3) 지금 만들면 존재하지 않는 기능을 테스트하게 되므로 보류 — CLAUDE.md가 이미 경고한 "P1 프롬프트에 Phase 2·3이 끼어드는" 실수를 피했다.

- `@playwright/test` devDependency(개발할 때만 쓰고 실제 서비스에는 안 들어가는 패키지) 추가, `playwright.config.ts`(webServer 설정이 `next build && next start`로 테스트용 서버를 자동으로 띄워준다), `e2e/plan-share-restore.spec.ts`.
- 클립보드 권한에 기대지 않고, 컨트롤 변경 후의 URL을 완전히 새 브라우저 컨텍스트에서 열어 같은 결과가 나오는지로 "공유 링크로 복원"을 검증한다 — 상태가 URL에만 있다는 규칙 8을 그대로 이용.
- 라디오 입력이 `sr-only`라 `.check()`가 라벨에 가로막혀 실패 — 라벨 텍스트를 클릭하도록 수정.
- `app/plan/page.tsx`의 "에타파 · N일" 텍스트에 `data-testid="plan-total-days"` 추가(테스트용 훅, 화면엔 영향 없음).
- vitest가 `e2e/*.spec.ts`까지 테스트로 주워가 `@playwright/test`의 `test()`와 충돌 — `vitest.config.ts`를 새로 만들어 `e2e/`를 제외.
- `package.json`에 `"test:e2e": "playwright test"` 추가. `.gitignore`에 `test-results/`·`playwright-report/`·`blob-report/`·`playwright/.cache/` 추가.
- `npx playwright install chromium --with-deps`로 브라우저 바이너리 설치 필요(최초 1회, ~300MB).
- 재확인: `tsc`·`vitest`(30/30)·`playwright test`(1/1)·`next build`(181페이지)·`eslint` 전부 통과.

## 2026-07-27 (14) — 이어서작업.md·CLAUDE.md 일정 표기에서 확정 날짜 제거

`이어서작업.md`의 "판단 게이트" 표가 "~2026-09", "2026-10초~11초" 같은 구체 날짜를 못 박고 있어 계속 갱신이 필요했던 문제를 정리했다. 실행 시점은 달력 날짜가 아니라 **순서·선행조건**으로 판단하도록 표를 다시 썼다(예: "게이트 2 선행조건 → 게이트 2 → 실측 도보 → 게이트 3" 순서). CLAUDE.md의 "웹 트랙 Phase 1 완료" 문장에서도 `2026-07-27` 고정 날짜를 뺐다(정확한 날짜는 git 커밋 이력·DEVLOG에 이미 있음).

- Phase 2(알베르게 실데이터·갈림길 등)를 실측 도보 완료 전까지 착수하지 않는다는 **조건 자체는 그대로 유지** — CLAUDE.md 절대규칙 1(데이터 지어내지 않기)과 직결이라 날짜와 무관하게 유효하다.
- 확인 후 `docs/markdown/05_검증계획.md`의 게이트 1~4 헤더(2026년 9월/10월/12월, 2027년 6월)도 같은 방식으로 정리 — "게이트 N (조건 후)" 형태로 통일. 같은 표가 그대로 복사돼 있던 `00_README.md`·`사업계획서.md`의 "게이트 | 시기 | 결정" 표, `04_실행계획.md`의 "게이트 2 판단표" 헤더도 일관성을 위해 함께 정리(요청 범위는 05 문서였지만 동일 표의 중복이라 확장). "2027년 성년 시즌" 같은 표현은 그대로 뒀다 — 성년(Año Santo)은 프로젝트 추정이 아니라 실제 캘린더상 고정된 해이기 때문(CLAUDE.md 용어사전 "성년" 참고).
- `CLAUDE.md`·`docs/markdown/*` 를 고쳤으므로 `python scripts/regen_docs.py`로 `docs/docx/*`·`문서뷰어.html` 두 차례 재생성(Windows라 `python3` 아닌 `python`).

## 2026-07-27 (13) — 배포 전 최종 점검 + 규칙 9 위반 수정

`이어서작업.md`의 "배포 전 최종 점검" 체크리스트를 실행했다.

- **Windows 세션 `node_modules` 누락**: 지난 Mac 세션에서 추가된 `@vercel/analytics`·`vitest`가 이 머신엔 설치돼 있지 않아 `tsc`·`test`가 전부 모듈 못 찾음 에러였다. `npm install`로 해결 — 코드 문제 아니었음.
- `npx tsc --noEmit` / `npm test`(30/30) / `npm run build`(181페이지) 전부 통과.
- `npm audit` 12 high는 전부 `next`·`eslint`가 번들한 전이 의존성(postcss·sharp·minimatch)이고, 제안된 "수정"이 사실 `next` 9.3.3으로의 다운그레이드라 무의미 — 손대지 않음.
- `/api/health`, `/privacy` 응답 정상. `EmailCapture`는 `RESEND_API_KEY` 없으면 `/plan`에서 완전히 사라지고, 있으면(가짜 키로도) 정상 렌더 — 규칙 8 확인.
- `security-review` 스킬은 PR diff(커밋되기 전 변경 내용 비교) 기반이라 이미 커밋된 `/api/subscribe`·`/api/health`엔 못 돌림 → 수동 검토. 이메일 정규식(패턴으로 문자열 형식을 검사하는 방법) 검증, 목적지 주소가 코드에 고정돼 있어 SSRF(공격자가 서버를 속여 임의의 다른 주소로 요청을 보내게 만드는 공격) 불가, 비밀키·PII(이름·이메일 같은 개인식별정보) 로깅 없음 — 발견 사항 없음.
- **규칙 9(본문 최소 17px) 위반 발견·수정**: `app/globals.css`가 `body` 기본값을 17px로 잡아뒀는데, `RiskGauge`(부상 위험 안내 문구!)를 포함해 8개 파일의 실제 본문 문단이 `text-[15px]`로 그 위를 덮어쓰고 있었다. `StageCard.tsx`는 도보일 제목만 17px(`text-[17px] font-semibold`)이고 휴식일·이동수단 제목은 15px로 같은 컴포넌트 안에서도 일관성이 깨져 있었다. 버튼·칩·배지·내비 링크처럼 본문이 아닌 짧은 UI 요소는 그대로 두고, 실제로 읽어야 하는 문단·설명·체크리스트 항목만 17px로 올렸다.
  - 수정 파일: `components/RiskGauge.tsx`, `components/CalculatorCTA.tsx`, `components/EmailCapture.tsx`, `components/StageCard.tsx`, `app/page.tsx`, `app/plan/page.tsx`, `app/route/[slug]/page.tsx`, `app/tools/{cost,pack,timeline}/page.tsx`, `app/town/[slug]/page.tsx`.
  - 수정 후 `tsc`·`test`·`build` 재확인, 전부 통과.
- 남은 배포 콘솔 작업(체크리스트만, 코드 아님): Vercel에 `NEXT_PUBLIC_SITE_URL`·`RESEND_API_KEY`·`RESEND_AUDIENCE_ID` 설정 여부.

---

## 2026-07-27 (12) — P7 계측, 웹 트랙 Phase 1(P0~P7) 완료

`@vercel/analytics` 연결 + 커스텀 이벤트 6종, 헬스체크, 개인정보 처리방침, 선택적 이메일 수집. 이걸로 웹 트랙 Phase 1 코드 구현이 전부 끝났다.

- `components/Track.tsx` — 서버 렌더 페이지(SEO 마을·구간·도구·계산 결과)에서도 조회 이벤트를 보낼 수 있게 하는 범용 클라이언트 트래커. `useEffect`에서 `track()` 한 번 호출하고 화면엔 아무것도 안 그린다.
- 이벤트: `plan_calculated`(app/plan, route·targetKm·fitness·riskScore) · `plan_link_copied`(ShareButton) · `plan_printed`(PrintButton에 `event` prop 추가, `/plan/print`에서만 넘김) · `tool_used`(cost/pack/timeline) · `town_page_viewed`/`stage_page_viewed`.
- ★ `plan_calculated`도 규칙 3을 따른다: `riskDataQuality === 'ESTIMATED'`면 이벤트에서 `riskScore` 필드 자체를 뺀다(RiskGauge가 화면에서 숨기는 것과 같은 가드).
- `app/api/health/route.ts` — 배포 모니터링용. 일정 계산과는 무관(규칙 10 저촉 아님).
- `app/privacy/page.tsx` — 가입 없음/URL 저장 원칙 재확인, Analytics 수집 항목 나열, 이메일 선택 수집 고지. 문의 연락처는 서비스명 확정 전이라 placeholder.
- 이메일 수집은 **Resend**로 결정(SDK 안 씀, `fetch`로 Audiences API 직접 호출 — 새 의존성 최소화). `app/api/subscribe/route.ts`가 `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` 미설정 시 503을 내고, `app/plan/page.tsx`는 그 환경변수 존재 여부로 `EmailCapture` 컴포넌트 자체를 서버에서 렌더하지 않는다 — 키가 없어도 계산 기능은 완전히 그대로 동작한다(완료 조건, 규칙 8).
- `.env.example` 신설(`RESEND_API_KEY`·`RESEND_AUDIENCE_ID`·`NEXT_PUBLIC_SITE_URL`), `.gitignore`에 `!.env.example` 예외 추가.
- **부수 수정**: P6에서 `app/sitemap.ts`에 `/tools/{cost,pack,timeline}`이 누락돼 있던 걸 발견해 추가(규칙 7 위반이었음). `/privacy`도 함께 추가.

**검증**: tsc·eslint clean, vitest 30/30, `npm run build` → **181 정적 페이지**(178 + privacy·헬스체크·구독 API). `next start`로 직접 확인: `/api/health` 200, `/privacy` 200, 환경변수 없을 때 `EmailCapture` 미노출·`/api/subscribe` 503, 환경변수 있을 때(`RESEND_API_KEY=fake_key`) `EmailCapture` 노출.

⚠️ 빌드 1차 시도가 `fonts.gstatic.com` 연결 실패(간헐적 네트워크 이슈, 코드와 무관)로 깨졌다 — 재시도로 통과. 이 프로젝트 코드와는 상관없는 환경 이슈이니 다음에 똑같이 재현되면 재시도부터 해본다.

---

## 2026-07-25 (11) — 문서 동기화 (구현 반영)

이번 세션 변경(EU-DEM 고도·Next16/Tailwind v4·source 라벨·크림 디자인·파이썬 파이프라인)에 맞춰 기획 문서를 정리.

- **프레임워크**: Next.js 15→16, Tailwind v3→v4(globals.css `@theme`) — 03·06·사양서.
- **고도 출처**: IGN MDT05(5m) → **EU-DEM 25m** + "왜 IGN이 아닌가" 3소스 교차검증 근거 — CLAUDE.md 규칙3, 06 P0.5(원안은 참고용으로 보존하고 상단 정정 배너), 03 부록(정정 배너+출력/출처 문자열), 00_README, 02, 사양서, A(프랑스 20km 공백이 EU-DEM으로 해소됨).
- **source 유니온**: `'OSM+MDT' | 'OSM+EUDEM' | 'ESTIMATED'`로 통일 — 스키마·06/03/사양서 타입 스니펫·UML(06 mermaid, UML.html) enum.
- **스크립트 경로**: build-profiles.ts → `scripts/pipeline/build_geometry.py`(+compare_dem/verify_route) — CLAUDE.md 디렉터리·규칙3.
- **출처 표시**: 고도 "© EU-DEM (Copernicus)"로.
- **README.md**: 스택·현재 구현 상태(P0~P6, 178 페이지)·DEVLOG 링크 추가.
- 원칙: 원본 연구 서술(IGN 검토 근거)은 삭제하지 않고 정정 배너로 "실제 결과는 EU-DEM"임을 명시.

✅ **파생 산출물 재생성 완료**: `docs/docx/*.docx`(12) · `문서뷰어.html` · `UML.html` 모두 현재 .md/schema에 맞춰 갱신. 재생성 스크립트를 **`scripts/regen_docs.py`로 저장**(이전엔 소실됐었음). pypandoc_binary 설치. 검증: 03.docx에 EU-DEM·Next16 반영, 뷰어 브라우저 렌더 정상(EU-DEM 27회). (`.md`가 정본, docx/뷰어는 공유용 export)

---

## 2026-07-25 (10) — 디자인: 따뜻한 크림(#f9e3ab) 메인 톤

사용자 지정(수정할거.md "전체 UI 색 톤 f9e3ab 기준 미니멀"). 크림을 메인 톤으로, 코발트와 짝지어 미니멀하게.

- `app/globals.css` 토큰만 변경(컴포넌트 무수정 — 전부 토큰 기반): `--sand #f9e3ab`(신규 메인), `--granite`도 크림으로(bg-granite=페이지 배경), `--stone #cbab66`(따뜻한 테두리), `--muted #6f6450`(따뜻하게). ink/flecha/vino/moss 유지.
- **규칙 보존**: 크림은 '캔버스'(페이지 배경)로만. 콘텐츠는 흰 카드·코발트 헤더 위 → 노란 화살표(flecha)가 크림에 안 묻힘. flecha는 길 안내 전용 그대로.
- **접근성**(규칙 9, 4.5:1): text/sand 12.4, muted/sand 4.59, muted/white 5.81, flecha/ink 8.27 — 텍스트 전부 통과. 테두리는 비텍스트라 warm hairline(흰 위 2.2:1)로 카드 정의.
- `CLAUDE.md` 디자인 토큰 절 갱신(메인 톤·flecha 규칙 유지 명시).

**검증**: build 178 페이지·테스트 30/30 무변화(CSS-only). 스크린샷(390px) plan·town·cost 확인 — 크림 배경에 흰 카드가 warm 보더로 떠 보이고 코발트 헤더+flecha 대비 유지, 코발트+크림 미니멀 일관.

---

## 2026-07-25 (9) — P6 무료 도구 3종 (비용·배낭·타임라인)

각자 독립 URL로 검색 유입을 만든다. 전부 가입·이메일 없이 즉시 사용, 상태는 URL(공유 가능), 서버 렌더(규칙 7·8).

- `app/tools/cost` — 비용 계산기. 입력: 일수·공립비율·외식비율·장비신규. 출력은 **단일값 아닌 범위**("약 320만~570만 원"). 항공/숙박/식비/장비/보험 항목별 범위. 환율(≈1450원/유로)은 "대략치" 명시.
- `app/tools/pack` — 배낭 무게 계산기. 권장 상한 = 체중×10%. ★ **체중 선택 입력**(민감정보 강제 금지) → 미입력 시 7kg 기준. 계절별 품목 목록·합계, 초과 시 감량 우선순위, 짐 배송 시 데이파크 안내(+공립 배송 수령 불가 경고).
- `app/tools/timeline` — 준비 타임라인(F-08). 출발일 → D-90~D-1 역산 체크리스트(날짜 계산), 항목별 관련 페이지 링크, 인쇄 가능. ★ 의료 정보 없음(규칙 11): 상비약은 "준비" 리마인더만, 약품명·처치법 배제 + "의료 정보를 제공하지 않습니다" 면책.
- `components/ToolNav` — 세 도구 ↔ /plan 상호 링크.

**검증**(`npm run build` → **178 페이지**): tsc·eslint clean. 각 도구 SSR(JS-off) 렌더, 파라미터별 결과 변화(비용 40일 320~570만 / 10일 160~270만), 체중 미입력→7kg·w=60→6.0kg, 타임라인 9/1 출발→D-90 6/3 역산, 도구 상호·`/plan` 링크, 약품명 미노출 확인. 도구는 searchParams 의존이라 동적 렌더(canonical(검색엔진에 "이 주소가 진짜 대표 주소"라고 알려주는 것) 무파라미터 URL은 SSR 인덱싱 가능).

---

## 2026-07-25 (8) — P5 SEO 페이지 대량 생성 (175 정적 페이지)

검색이 유일한 100% 관문(규칙 7). 마을·구간·루트를 전부 정적 생성하고 서로 내부 링크로 연결.

- `lib/geo.ts` — 공유 조회 헬퍼: getTown/townNeighbors/remainingKm, allStages(81 연속쌍)/getStage, estimatedMinutes/difficultyKo, SERVICE_LABEL, ROUTES(3). 순수 조회.
- `app/town/[slug]/page.tsx` — **82개**. generateStaticParams. 한글+원어명, 산티아고까지 남은 거리, 해발, 이전/다음 마을, 서비스, 침대. ★ 숙소는 데이터 없어 "정보 확인 중"(규칙 1 — 안 지어냄). /plan CTA + 인접 구간 링크.
- `app/stage/[slug]/page.tsx` — **81개**. slug `A-to-B`(town id에 `-to-` 없음 확인). 거리·고도단면(Elevation, profiles 경유)·예상소요·난이도·통과 마을(링크). 고도는 profiles만(규칙 3).
- `app/route/[slug]/page.tsx` — **3개**(전 구간/레온/사리아). 총거리·표준일수·주요도시·기간별 추천일정 3(→/plan)·전체 고도단면·**TouristTrip JSON-LD**(검색엔진이 페이지 내용을 정형화된 형식으로 미리 읽을 수 있게 코드 안에 심어두는 구조화 데이터).
- `app/sitemap.ts`(168 URL) + `app/robots.ts`(/dev·/plan/print 제외, sitemap 링크). 모든 SEO 페이지 하단 `CalculatorCTA`.
- flecha(노랑)는 CTA 버튼에 안 씀(길 안내 전용) → 흰 버튼으로.

**검증** (`npm run build`): **175 정적 페이지** 생성(요건 170+ 충족). title 166개(마을82+구간81+루트3) **전부 고유**, 19~41자(60자 이내, 잘림 없음). SSR(JS-off): 원어명·"정보 확인 중"·CTA 렌더. 내부 링크 마을↔구간↔루트↔/plan 연결. tsc·eslint clean, 전체 테스트 30/30 유지.

---

## 2026-07-25 (7) — P4 인쇄용 일정표 (app/plan/print)

60대+ 순례자에게 닿는 유일한 경로("자녀가 뽑아 부모에게 주는" 용도, 규칙 9). /plan과 같은 searchParams를 받아 서버에서 계산.

- `app/plan/print/page.tsx` — 서버 컴포넌트. 표(일자·날짜·출발→도착[한글+원어]·거리·오르막·침대) + 하단 긴급전화 112 + 기본 스페인어 5문장(의료 정보 없음, 규칙 11). 상단에 총 일수·거리·출발일~도착일.
- 날짜: `startDate`(URL `sd` 파라미터) 있으면 일자별 "M/D (요일)" 계산. `lib/url.ts`에 `sd` 인코딩/디코딩(ISO 검증) 추가, `PlanControls`에 날짜 입력.
- `@media print`(globals.css): `.no-print` 숨김, `break-inside:avoid`(행 안 잘림), `thead` 페이지마다 반복, 링크 URL 미표시, 11pt, `@page margin 14mm`.
- `/plan`에 "인쇄용 보기" 링크(현재 쿼리 유지), `PrintButton`(window.print).

**검증**: 전체 테스트 30/30(sd 왕복 포함), tsc·eslint clean. playwright 인쇄 미디어 에뮬레이션: 생장 36일(휴식1) 일정이 **A4 2페이지**에 깨끗하게, 배경/네비 제거, 날짜 정확(9/1 화 ~ 10/6 화), 원어명 병기.

---

## 2026-07-25 (6) — 출처 라벨 정직화 (OSM+MDT → OSM+EUDEM)

[2026-07-25 (2)]에서 남긴 라벨 문제 해결. 실제 고도는 EU-DEM 25m인데 `source: 'OSM+MDT'`(IGN 5m를 뜻함)로 표기돼 있어 데이터를 실제보다 정밀한 것처럼 오도했다(규칙 1 위배).

- `lib/schema.ts`: `SegmentProfile.source`에 `'OSM+EUDEM'` 추가(경로 OSM + 고도 EU-DEM 25m). `'OSM+MDT'`(IGN 5m)는 미래 예약. `Plan.riskDataQuality` 타입을 `SegmentProfile['source']`로.
- `lib/planner/risk.ts` `riskDataQuality`: 전부 IGN일 때만 'OSM+MDT', 하나라도 EU-DEM이면 정직하게 'OSM+EUDEM'.
- `lib/planner/split.ts` 기본 source, `scripts/pipeline/build_geometry.py` 생성기, `data/profiles.ts`(81구간 전부 재생성) → 모두 `OSM+EUDEM`.
- 테스트: `riskDataQuality === 'OSM+EUDEM'` 로 갱신.

EU-DEM은 (추정이 아니라) 실측이므로 injuryRiskScore 숫자 노출은 계속 허용(ESTIMATED만 숨김, 규칙 3). 전체 테스트 29/29, tsc 통과.

---

## 2026-07-25 (5) — P3 계획 계산기 (app/plan, URL 상태)

06 문서 P3 사양대로 일정 계산기 구현. **URL 쿼리스트링이 유일한 상태 저장소**(규칙 8, localStorage 없음).

- `lib/url.ts` — `encodePlan`/`decodePlan`. 순수 함수, 잘못된 값 기본값 폴백. 쿼리 예: `?start=sarria&d=20&f=high&rest=1&skip=burgos~leon`. 라운드트립 테스트 6/6.
- `app/plan/page.tsx` — **async 서버 컴포넌트**. searchParams→decodePlan→buildPlan을 서버에서 계산(규칙 7). Mojon·요약(일수/거리/평균)·RiskGauge·콤포스텔라 안내·고도단면·StageCard 목록. `generateMetadata`로 동적 OG(Open Graph — 카카오톡·페이스북 등에 링크를 공유하면 뜨는 미리보기 카드 규격)("산티아고 순례길 N일 일정 — …").
- `components/PlanControls.tsx` (client) — 출발지 칩3·모드토글·km슬라이더·체력·휴식일·메세타버스. onChange→`router.replace`로 URL만 갱신(계산은 서버). `<form method="get">`라 **JS 꺼도 제출 동작**(noscript 적용 버튼).
- `components/ShareButton.tsx` (client) — `navigator.clipboard`로 현재 URL 복사.

**검증**:
- 전체 테스트 29/29(url 6 + split 23), tsc·eslint 통과.
- SSR(curl, JS-off): 기본 35일/생장, 사리아→하루도장2개, 메세타→버스카드, 위험점수 숫자 노출(OSM+MDT라 규칙3 통과).
- 잘못된 값 폴백: `?start=nowhere&d=999&f=superman&rest=-5` → 생장/40(clamp)/normal/0.
- **playwright**: 슬라이더 30 이동→URL이 `?…&d=30…`으로 갱신, 그 URL 새 탭에 붙여넣으면 동일 결과. 모바일 375px 레이아웃 안 깨짐.

미구현(사양 명시): Lighthouse 측정(수동), P4 인쇄용 페이지는 다음 단계.

---

## 2026-07-25 (4) — P2 시그니처 컴포넌트 5종

06 문서 P2 사양대로 재사용 컴포넌트를 TS+Tailwind v4로 구현. 전부 **서버 컴포넌트**(useEffect/클라이언트 상태 없음 → SEO 규칙 7, JS 꺼도 본문 렌더).

- `components/Shell.tsx` — 조가비 방사형 SVG (size/color/rays)
- `components/Mojon.tsx` — 이정표 헤더. 남은 거리 스페인식 소수점(`592,500`), mono+tabular-nums 32px+, flecha 진행률 바
- `components/Elevation.tsx` — 고도 단면 SVG (preserveAspectRatio="none", vectorEffect non-scaling-stroke, role=img+aria). ⚠️ 시각화 전용, 판단은 profiles.ts로(주석 명시)
- `components/StageCard.tsx` — 일자 카드. 원어명 병기(규칙 5), 경고 배지 7종(급내리막=vino danger 등, flecha 미사용), 휴식일·이동수단 변형
- `components/RiskGauge.tsx` — 위험 점수 게이지. ★ riskDataQuality==='ESTIMATED'면 숫자 숨기고 안내만(규칙 3)

`app/dev/page.tsx`에서 실제 buildPlan 결과로 전부 렌더 확인. **검증**: tsc·eslint 통과, dev 서버 SSR HTML에 원어명·스페인식 소수점·경고 배지·이동수단/휴식일 카드 모두 포함, **모바일 375px 스크린샷에서 안 깨짐**. 색 규칙 준수(노랑 flecha는 진행률·고도 마크 = 길 안내에만).

접근성: 본문 17px(globals), 일자 번호 터치 타깃 44×44px(h-11 w-11), 위험 게이지 role=meter+aria, 고도 SVG role=img+aria-label.

---

## 2026-07-25 (3) — OSM 경로 정확도 검증: 정확함 확인

고도만 검증했었기에, 경로(길 모양) 자체가 실제 카미노와 맞는지 reference 없이 검증했다(`scripts/pipeline/verify_route.py`). **결론: 경로는 정확하다.**

### 3가지 검사

| 검사 | 결과 | 판정 |
|---|---|---|
| **길이** | 767.5km vs 가이드북 773.1km (−0.7%) | ✓ |
| **연속성** | 점 32,381개, 평균 간격 23.7m, 구간 경계 0m | ✓ |
| **마을 통과** (핵심) | 실제 좌표 기준 전 마을이 경로 수백 m 이내, 중앙값 126m | ✓ |

연속성에서 100m 초과 간격이 856곳(최대 1,301m) 있으나, 메세타 직선 구간의 성긴 OSM 노드 간격이다(순간이동이면 구간 경계가 0m가 아니었을 것). 100m 리샘플 시 직선 보간되나 직선 구간이라 무해.

### "마을 통과" 검증의 함정 — 지오코딩은 못 믿는다

1차로 82개 마을을 Nominatim으로 독립 지오코딩해 경로 거리를 쟀더니 중앙값 126m(우수)였지만 이상치 13곳이 나왔다. 그런데 **이상치는 전부 지오코딩 오류였다**:
- León이 **561km** 떨어진 걸로 나옴 → 레온은 카미노 대도시라 경로 오류일 수 없음. Nominatim이 동명 다른 곳 반환.
- 지역명(", León, España")을 붙이니 León 330m·Fonfría 302m·Salceda 25m로 경로에 붙음 → 지오코딩 오류 확정.
- 비에르소·갈리시아 유명 마을 10곳(Ponferrada 등)은 지역명을 붙여도 멀게 나왔으나, **알려진 실제 좌표로 직접 재니 전부 25~566m 이내**로 경로가 통과함을 확인. Overpass place 노드 조회도 이름 매칭 문제로 실패 → 지오코딩·이름검색 자체가 흔한 마을명에 취약함이 재확인됨.
- 결정적 근거: 앞서 León(465km) 0.1km, Sarria(658.9km) 1.1km, Santiago(773.1km) 0.1km로 검증됨. 그 사이(567~619km)만 20km 틀리는 건 연속 경로에서 기하학적으로 불가능.

### 부수 소득 — 초기 설계 결정 사후 정당화

이 검증은 "마을 좌표를 왜 Nominatim이 아니라 **km-비율 보간**으로 했나"([2026-07-25 (1)] 참조)를 뒷받침한다. 동명 마을 지오코딩은 실제로 신뢰 불가였다 — km-비율 보간이 옳은 선택이었다.

---

## 2026-07-25 (2) — IGN 5m vs EU-DEM 25m 실측 비교: 예상과 반대 결과 🔴

CLAUDE.md가 지정한 IGN MDT05(5m)로 바꾸면 더 정확할 거라 가정하고, 실제로 IGN 5m를 조회해 EU-DEM 25m와 비교했다. **결과는 반대였다 — 가장 중요한 날(피레네)에서 5m가 오히려 크게 틀린다.**

### 취득 방법
IGN 5m는 공개 조회 API가 없지만, 스페인 IGN **WCS INSPIRE 서비스**(유럽 공공기관들이 지도 데이터를 표준 규격으로 조회할 수 있게 열어둔 서비스, 주소: `servicios.idee.es/wcs-inspire/mdt`, `COVERAGEID=Elevacion4258_5`)가 좁은 bbox(조회하려는 좌표 범위 사각형) 실시간 조회를 지원한다. 검증용으로 필요한 지점만 작게 조회했다(배포용 전체 도엽 다운로드 아님 → CLAUDE.md 취지 준수). 도구: `scripts/pipeline/compare_dem.py` (rasterio(파이썬에서 지도·고도 같은 격자 데이터를 다루는 라이브러리) 필요).

### 구간별 누적 상승/하강 (둘 다 동일 스무딩 win5/hys3m)

| 구간 | IGN 5m | EU-DEM 25m | 차이 |
|---|---|---|---|
| **피레네 1일차** (기준 ~1,280m) | **+2,355 / −1,437** | **+1,327 / −574** | 상 +1,028 |
| 엘아세보→몰리나세카 급하강 | +0 / −546 | +0 / −541 | 하 +5 |
| 오 세브레이로 오르막 | +652 / −0 | +646 / −6 | 상 +6 |
| 메세타 평지 (대조군) | +112 / −155 | +108 / −161 | 상 +4 |

최고점(고도 절대값)은 네 구간 모두 5m 이내로 일치 → **DEM 데이터 자체는 둘 다 정확하다.**

### 핵심 발견: 급경사에서 5m가 노이즈를 폭증시킨다

완만한 구간 3곳은 5m와 25m가 10m 이내로 일치한다. 그런데 **급경사 피레네만 5m가 +2,355m로, 실제값(~1,280m)의 거의 두 배**다. 스무딩을 극단까지(win41/hys15m) 올려도 5m는 1,858m에 머물러 **끝내 기준값에 수렴하지 못한다.** EU-DEM 25m는 win9에서 1,288m로 기준과 정확히 맞는다.

| 스무딩 | IGN 5m | EU-DEM 25m |
|---|---|---|
| 없음 | 2,848m | 1,511m |
| win5/hys3m (현재) | 2,355m | 1,327m |
| win9/hys5m | 2,328m | **1,288m** ← 기준 근접 |
| win41/hys15m | 1,858m | 1,112m |

**원인**: 5m LiDAR(레이저를 쏴서 반사되는 시간으로 지형을 정밀 측량하는 기술)는 미세 지형(요철)까지 충실히 담는데, OSM 경로에 내재한 수평 위치 오차(수 m~수십 m)가 급경사(30%+)에서는 지점마다 수 m의 수직 오차로 증폭된다. 256개 점에 걸쳐 이 오차가 "가짜 오르내림"으로 누적된다. 25m DEM은 셀 자체가 25m×25m 평균이라 이 미세 노이즈를 원천적으로 눌러준다. → **경로 트랙을 따라 누적 상승을 잴 때는 고해상도가 오히려 독이 될 수 있다** (하이킹 데이터에서 알려진 함정).

### reference 없이 검증 — 독립 3개 데이터 교차검증

"1,280m가 맞다"는 근거가 가이드북(gronze 등) 인용이라 순환논증 위험이 있었다. 그래서 **서로 완전히 독립으로 만들어진 고도 데이터 3개**를 같은 피레네 1일차 점들에서 뽑아 비교했다(Open Topo Data 조회).

| 데이터 | 제작 주체·방식 | 누적 상승 | 누적 하강 |
|---|---|---|---|
| **IGN MDT05 (5m)** | 스페인, 항공 LiDAR(레이저 측량) | **2,355m** | 1,437m |
| EU-DEM (25m) | 유럽 Copernicus, 합성 | 1,327m | 574m |
| SRTM (30m) | 미국 NASA, 우주왕복선 레이더 | 1,309m | 560m |
| ASTER (30m) | 미국·일본, 위성 광학 | 1,324m | 573m |

**방식도 주체도 다른 세 데이터(레이더/광학/합성)가 1,309~1,327m 안에 오차 18m로 수렴**한다. IGN 5m만 두 배(2,355m)로 홀로 떨어진다. → 가이드북 값을 안 믿어도, **데이터끼리의 일치만으로** IGN 5m가 outlier(잡음 과대계상)임을 알 수 있다. 가이드북 ~1,280m는 여기에 추가로 부합할 뿐 근거의 전제가 아니다.

**인식론적 정직성**: 누적 오르막에는 절대적 참값이 없다(해안선 역설 — 자를 잘게 댈수록 커진다). 우리가 아는 것은 "독립 데이터 다수가 어디에 합의하는가"이고, 사람이 걷는 스케일에서의 오르막은 그 합의값(~1,320m)이다. IGN 5m의 초과분은 사람이 체감하지 않는 미세 요철 + 경로 오차의 산물이다.

### 결론 / 결정

- **"5m가 무조건 더 정확"은 틀렸다.** 우리 파이프라인(100m 간격 OSM 경로 샘플링)에서는 **EU-DEM 25m가 부상 1위 구간(피레네)의 기준값과 맞는, 더 나은 선택**이다. 근거는 가이드북이 아니라 독립 3개 데이터의 합의다.
- 따라서 **IGN 5m로 성급히 교체하지 않는다.** 교체하려면 경로를 DEM에 스냅하거나 스무딩을 급경사 전용으로 재설계하는 별도 작업이 필요하고, 그렇게 해도 이득이 불확실하다.
- 남은 진짜 문제는 **라벨**이다: `source: 'OSM+MDT'`는 IGN을 쓴 것처럼 보이나 실제는 EU-DEM이다. → 스키마 출처에 `'OSM+EUDEM'`을 추가해 **정직하게 표기**하는 것이 규칙 1에 맞다. (데이터는 그대로 두고 라벨만 교정)

---

## 2026-07-25 — 실측 데이터 파이프라인 완성 + F-01 구간 계획 엔진

### 1. 경로·고도 데이터 파이프라인 (`scripts/pipeline/build_geometry.py`)

이전 세션에서 1일차 구간만 검증하고 멈춘 파이프라인을 전 구간으로 확장해 완성했다.

- **6개 OSM 릴레이션 → 단일 767.5km 경로**로 스티칭. 구간 경계 간격 전부 0m(완벽 연결), 가이드북 773.1km 대비 0.7% 오차.
- **82개 마을 좌표 매핑** — 설계 결정: **km-비율 보간** 채택(Nominatim 지오코딩 아님).
  - 근거: 실측 경로(767.5km)가 가이드북 km(773.1km)와 0.7%밖에 안 달라(ratio 0.9928) km 비율이 경로상 위치와 잘 일치. Nominatim(주소·지명을 좌표로 바꿔주는 OSM의 지오코딩 서비스)은 동명 마을·rate limit(짧은 시간에 너무 많이 요청하면 막아버리는 제한)로 사람 손 없이 자동으로 돌리는 배치 작업엔 부적합.
- **`data/towns.ts`**(마을 82, lat/lng 포함) · **`data/profiles.ts`**(구간 81, ascent/descent/maxElevation/maxGradient) 생성. `lib/schema.ts` 준수, `tsc` 통과.
- **원본 값 보존**: `towns.km`·`elevation`은 검증된 원본(`src/camino-companion.jsx`)을 정규식(패턴을 정해두고 문자열에서 원하는 부분만 골라내는 방법)으로 그대로 읽어 덮어쓰지 않고, 없던 `lat`/`lng`만 채웠다(CLAUDE.md 규칙 1).
- **좌표 원본**(`data/geometry/`)·`__pycache__`는 `.gitignore`로 제외(ODbL 파생 DB 배포 회피, 규칙 3). 커밋되는 건 `towns.ts`/`profiles.ts` 숫자뿐.

### 2. API 검증 — 지어낸 값이 아님을 확인 (CLAUDE.md 규칙 1)

두 공개 API가 실제 데이터를 반환했는지 알려진 사실과 대조했다.

- **Overpass API (OSM 경로)**: relation 6개를 way 수천 개로 받아 끝점을 이어붙임. 총 767.5km, 경계 0m. 1일차 길이 163.3km ≈ 가이드북 162.2km.
- **Open Topo Data (EU-DEM 25m 고도)**: 100m 간격 7,677개 지점 조회. 알려진 지점과 대조:

  | 지점 | 측정 | 실제 | 차이 |
  |---|---|---|---|
  | 생장(출발) | 181m | ~170m | 11m |
  | 레포에데르 고개 | 1,421m | ~1,400m | 21m |
  | 팜플로나 | 452m | ~450m | 2m |
  | 부르고스 | 851m | ~860m | 9m |
  | 철의 십자가(최고점) | 1,510m | 1,505m | 5m |
  | 산티아고 | 255m | ~260m | 5m |

  전부 오차 범위 내. 고도 표준편차 250m(실제 지형이면 수백 m, 0이면 가짜) → 데이터는 진짜다.
- **마을 좌표**: 팜플로나·부르고스·레온·사리아·산티아고 등 실제 도시 중심과 최대 1.1km 이내.

### 3. 규칙 3 실증 — 마을 고도차 방식이 왜 위험한가

| 구간 | 마을 고도차 방식 | 실측 파이프라인 | 실제 |
|---|---|---|---|
| 생장→론세스바예스 (상승) | +780m | **1,308m** | ~1,280m |
| 엘 아세보→몰리나세카 (하강) | 0m ("쉬운 날") | **하강 541m** | −550m 급경사 돌길 |

마을 고도차로 계산하면 1일차를 "평범한 산길"로, 무릎 부상 급하강 구간을 "쉬운 날"로 오판한다. 실측 프로파일이 이를 교정한다.

### 4. F-01 부상 회피형 구간 분할 엔진 (`lib/planner/`)

데이터가 확보돼 착수 가능해진 다음 단계. 03·06 문서 F-01 사양 구현.

- 파일: `types.ts`(스키마 재노출), `split.ts`(엔진), `risk.ts`(위험 점수), `split.test.ts`.
- 순수 함수 — `fetch`/`window`/`localStorage` 참조 없음(규칙 6·10, RN 이식 대비). 타입은 `lib/schema.ts`에서 import.
- **고도는 `data/profiles.ts`만 경유**. `towns.elevation`을 빼서 오르막을 구하지 않는다(테스트로 강제 — 소스에 `.elevation` 접근 금지).
- 로직: 탐욕 분할 + 부상 회피 후처리(초반 적응 ×0.8, 오르막 보정 ×0.85, 회복 배치 ×0.85, 큰 도시 휴식일, 마지막 <6km 병합), 경고 6종, 콤포스텔라·도장 규칙(총 도보 거리 기준이지 위치 기준 아님), 계획된 이동수단(메세타 버스는 `walkedKm` 제외/`totalKm` 포함).
- 위험 점수 재보정: 24km/normal → 40(무난), 32km/high → 85(위험). 초기 버전은 모든 일정이 90+로 몰려 무의미했음.
- **`npm test` 23/23 통과, `tsc` 통과.**

### 5. 검수에서 잡은 버그

- 🐛 **계획된 이동수단이 목표 거리에 따라 누락**: 탐욕 분할이 부르고스를 지나치면(목표 27km+) 메세타 버스가 발동하지 않고 전 구간을 걸어버렸다. → **이동수단 출발지를 강제 정차점**으로 만들어 수정. 목표 18~30km 전 범위 회귀 테스트 추가.

### ⚠️ 남은 결정·한계

- **배포 전 걸림돌**: 고도가 CLAUDE.md 지정 IGN MDT05(5m)가 아니라 **EU-DEM 25m**다. `source: 'OSM+MDT'`로 표기했지만 실제론 EU-DEM. 최종 배포 전 스페인 구간 IGN 5m 교체 여부 결정 필요.
  - 이 때문에 `injuryRiskScore` 숫자 노출은 신중히(규칙 3 정신). `riskDataQuality`가 데이터를 정직하게 반영하도록 설계함.
- **risk.ts 가중치는 전부 의학적 근거 없는 임시값**(규칙 11). 정형외과·스포츠의학 자문 전까지 "의학 판단"으로 제시 금지.
- 문서(P1)와 **의도된 편차 2건**(테스트 주석 명시): ① riskDataQuality가 실측이라 'OSM+MDT'(문서는 'ESTIMATED' 전제) ② 피레네를 오리송에서 끊는 더 안전한 분할.
- 콤포스텔라 세부 규칙(마지막 20km·국외 출발 시 스페인 내 70km) 미구현 — 도보 100km/자전거 200km/전기자전거 제외 + 연속성만 판정. Phase 2 보완.

### 환경 메모

- 이 Mac은 Node 없어 Homebrew로 node 26 설치(`/opt/homebrew/bin`). 데이터 도구는 `python3`. python.org에서 받은 빌드라 `Install Certificates.command`를 1회 실행해 SSL(인터넷 통신을 암호화하는 보안 규격) 인증서 문제 해결. (직전 Windows 세션 지침과 다름)
- Vitest 추가(devDependency로), `package.json`에 `"test": "vitest run"`.

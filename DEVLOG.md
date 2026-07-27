# 개발 로그 (DEVLOG)

> 무엇을·왜 바꿨는지 날짜순 기록. 최신이 위. 쉬운 설명은 `학습노트.md`, 규칙은 `CLAUDE.md`.

---

## 2026-07-27 (13) — 배포 전 최종 점검 + 규칙 9 위반 수정

`이어서작업.md`의 "배포 전 최종 점검" 체크리스트를 실행했다.

- **Windows 세션 `node_modules` 누락**: 지난 Mac 세션에서 추가된 `@vercel/analytics`·`vitest`가 이 머신엔 설치돼 있지 않아 `tsc`·`test`가 전부 모듈 못 찾음 에러였다. `npm install`로 해결 — 코드 문제 아니었음.
- `npx tsc --noEmit` / `npm test`(30/30) / `npm run build`(181페이지) 전부 통과.
- `npm audit` 12 high는 전부 `next`·`eslint`가 번들한 전이 의존성(postcss·sharp·minimatch)이고, 제안된 "수정"이 사실 `next` 9.3.3으로의 다운그레이드라 무의미 — 손대지 않음.
- `/api/health`, `/privacy` 응답 정상. `EmailCapture`는 `RESEND_API_KEY` 없으면 `/plan`에서 완전히 사라지고, 있으면(가짜 키로도) 정상 렌더 — 규칙 8 확인.
- `security-review` 스킬은 PR diff 기반이라 커밋된 `/api/subscribe`·`/api/health`엔 못 돌림 → 수동 검토. 이메일 정규식 검증, 고정된 Resend 호스트(SSRF 불가), 시크릿·PII 로깅 없음 — 발견 사항 없음.
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

**검증**(`npm run build` → **178 페이지**): tsc·eslint clean. 각 도구 SSR(JS-off) 렌더, 파라미터별 결과 변화(비용 40일 320~570만 / 10일 160~270만), 체중 미입력→7kg·w=60→6.0kg, 타임라인 9/1 출발→D-90 6/3 역산, 도구 상호·`/plan` 링크, 약품명 미노출 확인. 도구는 searchParams 의존이라 동적 렌더(canonical 무파라미터 URL은 SSR 인덱싱 가능).

---

## 2026-07-25 (8) — P5 SEO 페이지 대량 생성 (175 정적 페이지)

검색이 유일한 100% 관문(규칙 7). 마을·구간·루트를 전부 정적 생성하고 서로 내부 링크로 연결.

- `lib/geo.ts` — 공유 조회 헬퍼: getTown/townNeighbors/remainingKm, allStages(81 연속쌍)/getStage, estimatedMinutes/difficultyKo, SERVICE_LABEL, ROUTES(3). 순수 조회.
- `app/town/[slug]/page.tsx` — **82개**. generateStaticParams. 한글+원어명, 산티아고까지 남은 거리, 해발, 이전/다음 마을, 서비스, 침대. ★ 숙소는 데이터 없어 "정보 확인 중"(규칙 1 — 안 지어냄). /plan CTA + 인접 구간 링크.
- `app/stage/[slug]/page.tsx` — **81개**. slug `A-to-B`(town id에 `-to-` 없음 확인). 거리·고도단면(Elevation, profiles 경유)·예상소요·난이도·통과 마을(링크). 고도는 profiles만(규칙 3).
- `app/route/[slug]/page.tsx` — **3개**(전 구간/레온/사리아). 총거리·표준일수·주요도시·기간별 추천일정 3(→/plan)·전체 고도단면·**TouristTrip JSON-LD**.
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
- `app/plan/page.tsx` — **async 서버 컴포넌트**. searchParams→decodePlan→buildPlan을 서버에서 계산(규칙 7). Mojon·요약(일수/거리/평균)·RiskGauge·콤포스텔라 안내·고도단면·StageCard 목록. `generateMetadata`로 동적 OG("산티아고 순례길 N일 일정 — …").
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
IGN 5m는 공개 조회 API가 없지만, 스페인 IGN **WCS INSPIRE 서비스**(`servicios.idee.es/wcs-inspire/mdt`, `COVERAGEID=Elevacion4258_5`)가 좁은 bbox 실시간 조회를 지원한다. 검증용으로 필요한 지점만 작게 조회했다(배포용 전체 도엽 다운로드 아님 → CLAUDE.md 취지 준수). 도구: `scripts/pipeline/compare_dem.py` (rasterio 필요).

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

**원인**: 5m LiDAR는 미세 지형(요철)까지 충실히 담는데, OSM 경로에 내재한 수평 위치 오차(수 m~수십 m)가 급경사(30%+)에서는 지점마다 수 m의 수직 오차로 증폭된다. 256개 점에 걸쳐 이 오차가 "가짜 오르내림"으로 누적된다. 25m DEM은 셀 자체가 25m×25m 평균이라 이 미세 노이즈를 원천적으로 눌러준다. → **경로 트랙을 따라 누적 상승을 잴 때는 고해상도가 오히려 독이 될 수 있다** (하이킹 데이터에서 알려진 함정).

### reference 없이 검증 — 독립 3개 데이터 교차검증

"1,280m가 맞다"는 근거가 가이드북(gronze 등) 인용이라 순환논증 위험이 있었다. 그래서 **서로 완전히 독립으로 만들어진 고도 데이터 3개**를 같은 피레네 1일차 점들에서 뽑아 비교했다(Open Topo Data 조회).

| 데이터 | 제작 주체·방식 | 누적 상승 | 누적 하강 |
|---|---|---|---|
| **IGN MDT05 (5m)** | 스페인, 항공 LiDAR | **2,355m** | 1,437m |
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
  - 근거: 실측 경로(767.5km)가 가이드북 km(773.1km)와 0.7%밖에 안 달라(ratio 0.9928) km 비율이 경로상 위치와 잘 일치. Nominatim은 동명 마을·rate limit로 무인 배치에 부적합.
- **`data/towns.ts`**(마을 82, lat/lng 포함) · **`data/profiles.ts`**(구간 81, ascent/descent/maxElevation/maxGradient) 생성. `lib/schema.ts` 준수, `tsc` 통과.
- **원본 값 보존**: `towns.km`·`elevation`은 검증된 원본(`src/camino-companion.jsx`)을 정규식으로 그대로 읽어 덮어쓰지 않고, 없던 `lat`/`lng`만 채웠다(CLAUDE.md 규칙 1).
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

- 이 Mac은 Node 없어 Homebrew로 node 26 설치(`/opt/homebrew/bin`). 데이터 도구는 `python3`. python.org 빌드라 `Install Certificates.command` 1회 실행해 SSL 해결. (직전 Windows 세션 지침과 다름)
- Vitest 추가(devDep), `package.json`에 `"test": "vitest run"`.

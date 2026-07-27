# 카미노 플래너

한국인 순례자를 위한 카미노 데 산티아고 동반 서비스. 스택·규칙은 [CLAUDE.md](./CLAUDE.md), 기획 전체는 [docs/markdown/00_README.md](./docs/markdown/00_README.md), **변경 이력은 [DEVLOG.md](./DEVLOG.md)** 를 본다.

## 스택

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4(디자인 값은 `app/globals.css` `@theme`, 메인 톤 크림 #f9e3ab) · Vitest(계산 로직 테스트) · Playwright(E2E, 브라우저를 직접 띄워서 화면 흐름을 확인하는 테스트). 상태는 URL 쿼리스트링에 담는다(DB·로그인 없음).

## 현재 구현 상태 (Phase 1, P0~P7 완료)

- **데이터**: `data/towns.ts`(마을 82) · `data/profiles.ts`(구간 81, 실측 고도). 경로는 OpenStreetMap(무료 오픈 지도, 라이선스 ODbL) + 고도는 **EU-DEM 25m**(유럽 Copernicus 위성이 만든 고도 데이터) — 파이썬 파이프라인 `scripts/pipeline/`으로 생성. 더 정밀한 IGN 5m는 안 씀(급경사에서 오히려 부정확, DEVLOG 참조).
- **엔진**: `lib/planner/`(F-01 구간 분할·부상 위험). 순수 함수, 테스트 30/30.
- **E2E**: Playwright `e2e/`. 06 문서가 정한 3개 시나리오 중 지금 있는 기능으로 되는 시나리오 1(생성→공유→복원)만 구현 — 나머지 둘은 해당 UI가 생기는 Phase 2·3에서 추가.
- **화면**: `/plan`(계산기) · `/plan/print`(인쇄) · `/town·/stage·/route`(SEO 정적 175p) · `/tools/{cost,pack,timeline}`(무료 도구) · `/privacy`(개인정보 처리방침). `npm run build` → 181 페이지.
- **계측(P7)**: Vercel Analytics(방문자 행동 자동 기록 도구) 커스텀 이벤트 6종(`components/Track.tsx`) · `app/api/health` 헬스체크(서버가 살아있는지 확인) · 선택적 이메일 수집(Resend라는 이메일 발송 서비스 이용, `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` 미설정 시 폼 자체가 비활성화 — 계산 기능과 무관).
- **다음 단계**: Phase 2는 실측 도보 완료 전까지 착수하지 않는다(06 문서 "이후 단계 — 조건부").

## 개발 서버

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인한다.

## 타입 검사 · 테스트 · 빌드

```bash
npx tsc --noEmit
npm test
npm run build
npm run test:e2e   # 최초 1회: npx playwright install chromium --with-deps
```

## 데이터 모델

`lib/schema.ts`가 정본이다. 문서(03·06)와 어긋나면 이 파일이 맞다. 시각화는 [UML.html](./UML.html) 또는 `docs/markdown/06_개발가이드.md` "데이터 모델 UML" 절.

# 카미노 플래너

한국인 순례자를 위한 카미노 데 산티아고 동반 서비스. 스택·규칙은 [CLAUDE.md](./CLAUDE.md), 기획 전체는 [docs/markdown/00_README.md](./docs/markdown/00_README.md), **변경 이력은 [DEVLOG.md](./DEVLOG.md)** 를 본다.

## 스택

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4(토큰은 `app/globals.css` `@theme`, 메인 톤 크림 #f9e3ab) · Vitest. 상태는 URL 쿼리스트링(DB·로그인 없음).

## 현재 구현 상태 (Phase 1, P0~P7 완료)

- **데이터**: `data/towns.ts`(마을 82) · `data/profiles.ts`(구간 81, 실측 고도). 경로 OSM(ODbL) + 고도 **EU-DEM 25m**(Copernicus) — 파이썬 파이프라인 `scripts/pipeline/`으로 생성. IGN 5m 아님(급경사 정확도 문제, DEVLOG 참조).
- **엔진**: `lib/planner/`(F-01 구간 분할·부상 위험). 순수 함수, 테스트 30/30.
- **화면**: `/plan`(계산기) · `/plan/print`(인쇄) · `/town·/stage·/route`(SEO 정적 175p) · `/tools/{cost,pack,timeline}`(무료 도구) · `/privacy`(개인정보 처리방침). `npm run build` → 181 페이지.
- **계측(P7)**: Vercel Analytics 커스텀 이벤트 6종(`components/Track.tsx`) · `app/api/health` 헬스체크 · 선택적 이메일 수집(Resend, `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` 미설정 시 폼 자체가 비활성화 — 계산 기능과 무관).
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
```

## 데이터 모델

`lib/schema.ts`가 정본이다. 문서(03·06)와 어긋나면 이 파일이 맞다. 시각화는 [UML.html](./UML.html) 또는 `docs/markdown/06_개발가이드.md` "데이터 모델 UML" 절.

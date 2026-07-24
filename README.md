# 카미노 플래너

한국인 순례자를 위한 카미노 데 산티아고 동반 서비스. 스택·규칙은 [CLAUDE.md](./CLAUDE.md), 기획 전체는 [docs/markdown/00_README.md](./docs/markdown/00_README.md)를 본다.

## 개발 서버

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인한다.

## 타입 검사

```bash
npx tsc --noEmit
```

## 데이터 모델

`lib/schema.ts`가 정본이다. 문서(03·06)와 어긋나면 이 파일이 맞다. 시각화는 [UML.html](./UML.html) 또는 `docs/markdown/06_개발가이드.md` "데이터 모델 UML" 절.

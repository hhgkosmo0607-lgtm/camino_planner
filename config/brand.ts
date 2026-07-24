/**
 * 브랜드명 단일 관리 지점.
 * CLAUDE.md: "서비스명은 미확정이다. 브랜드명은 config/brand.ts에서만 관리하고
 * 다른 곳에 하드코딩하지 않는다."
 *
 * 후보 (02_전략과사업.md 12.2절): 세요(Sello) · 모혼(Mojón) · 콘차(Concha) · 부엔(Buen)
 * 확정 전까지는 아래 placeholder를 그대로 쓴다. 이름이 정해지면 여기만 고친다.
 */
export const brand = {
  nameKo: "카미노 플래너",
  nameEn: "Camino Planner",
  taglineKo: "혼자 걷지만, 판단까지 혼자 하지 않게 돕는다.",
  isFinalized: false,
} as const;

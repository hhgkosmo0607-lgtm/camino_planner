/**
 * lib/cost.ts — 비용 계산(F-06) + 지출 기록 합산(F-23) 순수 함수.
 *
 * ★ 단일 숫자가 아니라 범위로 낸다("약 380만~450만 원") — 불확실성을 정직하게 전달(규칙 1).
 * ★ 순수 함수. fetch/window/localStorage 참조 없음. 실제 저장은 lib/localLog.ts가 한다.
 */

// 환율은 대략치다(변동). 결과를 범위로 내므로 정밀 환율을 주장하지 않는다.
export const EUR_KRW = 1450

export const toManwon = (eur: number) => (eur * EUR_KRW) / 10000

export interface CostRow {
  ko: string
  low: number // 만원
  high: number
}

export interface CostBreakdown {
  total: [number, number] // 만원
  rows: CostRow[]
}

/** 일수·공립 비율·외식 비율·장비 구매 여부로 총비용 범위(만원)를 추정한다. /tools/cost가 쓰던 로직을 분리했다. */
export function estimateTripCostManwon(
  days: number,
  publicPct: number,
  eatOutPct: number,
  buyGear: boolean,
): CostBreakdown {
  const pub = publicPct / 100
  const eat = eatOutPct / 100

  const flight: [number, number] = [120, 180]
  // 숙박 (EUR/일): 공립 8~10, 사립 12~25
  const lodgeLow = toManwon(days * (pub * 8 + (1 - pub) * 12))
  const lodgeHigh = toManwon(days * (pub * 10 + (1 - pub) * 25))
  // 식비 (EUR/일): 직접요리 15~25, 외식 25~40 (외식 비율로 보간)
  const foodLow = toManwon(days * (15 + eat * 10))
  const foodHigh = toManwon(days * (25 + eat * 15))
  const gearRange: [number, number] = buyGear ? [30, 120] : [0, 20]
  const etc: [number, number] = [10, 20] // 보험·유심·환전 등

  const low = flight[0] + lodgeLow + foodLow + gearRange[0] + etc[0]
  const high = flight[1] + lodgeHigh + foodHigh + gearRange[1] + etc[1]
  const round10 = (n: number) => Math.round(n / 10) * 10
  return {
    total: [round10(low), round10(high)],
    rows: [
      { ko: '항공', low: flight[0], high: flight[1] },
      { ko: '숙박', low: Math.round(lodgeLow), high: Math.round(lodgeHigh) },
      { ko: '식비', low: Math.round(foodLow), high: Math.round(foodHigh) },
      { ko: '장비', low: gearRange[0], high: gearRange[1] },
      { ko: '보험·기타', low: etc[0], high: etc[1] },
    ],
  }
}

export type ExpenseCategory = 'LODGING' | 'FOOD' | 'TRANSPORT' | 'GEAR' | 'ETC'

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  LODGING: '숙박',
  FOOD: '식사',
  TRANSPORT: '교통',
  GEAR: '장비',
  ETC: '기타',
}

export interface ExpenseEntry {
  id: string
  category: ExpenseCategory
  amountEur: number
  note: string
}

/** F-23 "실제 기록" 합산. 기록이 없으면 전부 0(지어내지 않는다). */
export function summarizeExpenses(entries: ExpenseEntry[]): {
  totalEur: number
  byCategory: Record<ExpenseCategory, number>
} {
  const byCategory: Record<ExpenseCategory, number> = {
    LODGING: 0,
    FOOD: 0,
    TRANSPORT: 0,
    GEAR: 0,
    ETC: 0,
  }
  let totalEur = 0
  for (const e of entries) {
    if (!Number.isFinite(e.amountEur) || e.amountEur <= 0) continue
    byCategory[e.category] += e.amountEur
    totalEur += e.amountEur
  }
  return { totalEur, byCategory }
}

/**
 * cost.test.ts — F-06 비용 추정 + F-23 지출 합산 순수 함수 테스트.
 */

import { describe, it, expect } from 'vitest'
import { estimateTripCostManwon, summarizeExpenses } from './cost'

describe('estimateTripCostManwon', () => {
  it('일수가 늘어나면 총비용도 늘어난다', () => {
    const short = estimateTripCostManwon(10, 50, 50, false)
    const long = estimateTripCostManwon(34, 50, 50, false)
    expect(long.total[0]).toBeGreaterThan(short.total[0])
    expect(long.total[1]).toBeGreaterThan(short.total[1])
  })

  it('공립 비율이 높을수록(사립보다 저렴) 총비용이 낮아진다', () => {
    const mostlyPublic = estimateTripCostManwon(30, 90, 50, false)
    const mostlyPrivate = estimateTripCostManwon(30, 10, 50, false)
    expect(mostlyPublic.total[1]).toBeLessThan(mostlyPrivate.total[1])
  })

  it('장비 구매를 켜면 장비 항목 범위가 늘어난다', () => {
    const withGear = estimateTripCostManwon(30, 50, 50, true)
    const withoutGear = estimateTripCostManwon(30, 50, 50, false)
    const gearRow = (b: typeof withGear) => b.rows.find((r) => r.ko === '장비')!
    expect(gearRow(withGear).high).toBeGreaterThan(gearRow(withoutGear).high)
  })

  it('항목별 합이 총비용 범위와 일치한다(반올림 오차 10만원 이내)', () => {
    const b = estimateTripCostManwon(34, 50, 50, true)
    const sumLow = b.rows.reduce((a, r) => a + r.low, 0)
    const sumHigh = b.rows.reduce((a, r) => a + r.high, 0)
    expect(Math.abs(b.total[0] - sumLow)).toBeLessThanOrEqual(10)
    expect(Math.abs(b.total[1] - sumHigh)).toBeLessThanOrEqual(10)
  })
})

describe('summarizeExpenses', () => {
  it('빈 배열이면 전부 0(지어내지 않는다)', () => {
    const s = summarizeExpenses([])
    expect(s.totalEur).toBe(0)
    expect(s.byCategory.FOOD).toBe(0)
  })

  it('카테고리별로 정확히 합산한다', () => {
    const s = summarizeExpenses([
      { id: '1', category: 'LODGING', amountEur: 10, note: '' },
      { id: '2', category: 'LODGING', amountEur: 12, note: '' },
      { id: '3', category: 'FOOD', amountEur: 8, note: '' },
    ])
    expect(s.byCategory.LODGING).toBe(22)
    expect(s.byCategory.FOOD).toBe(8)
    expect(s.totalEur).toBe(30)
  })

  it('0 이하이거나 NaN인 금액은 무시한다', () => {
    const s = summarizeExpenses([
      { id: '1', category: 'ETC', amountEur: 0, note: '' },
      { id: '2', category: 'ETC', amountEur: -5, note: '' },
      { id: '3', category: 'ETC', amountEur: NaN, note: '' },
      { id: '4', category: 'ETC', amountEur: 7, note: '' },
    ])
    expect(s.totalEur).toBe(7)
  })
})

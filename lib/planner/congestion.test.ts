/**
 * congestion.test.ts — F-02 혼잡 추정 테스트.
 *
 * 부활절 계산은 알려진 실제 날짜(2024~2028)로 검증한다. 나머지는 임계값·특수일
 * 반영 여부를 확인한다 — 절대적인 "정확한 혼잡도"를 주장하는 테스트가 아니라
 * "반영해야 할 실제 요소가 실제로 반영되는지"만 본다.
 */

import { describe, it, expect } from 'vitest'
import { assessCongestion } from './congestion'

const d = (iso: string) => new Date(iso + 'T00:00:00Z')

describe('congestion — 부활절(Semana Santa) 실제 날짜 반영', () => {
  // 실제 부활절: 2024-03-31, 2025-04-20, 2026-04-05, 2027-03-28
  it('부활절 당일은 성주간으로 반영된다(2026-04-05)', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2026-04-05') })
    expect(r.reasonsKo.some((x) => x.includes('성주간'))).toBe(true)
  })

  it('성지주일(부활절 -7일)도 성주간으로 반영된다(2026-03-29)', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2026-03-29') })
    expect(r.reasonsKo.some((x) => x.includes('성주간'))).toBe(true)
  })

  it('성주간 범위 밖은 반영되지 않는다(2026-03-20)', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2026-03-20') })
    expect(r.reasonsKo.some((x) => x.includes('성주간'))).toBe(false)
  })
})

describe('congestion — 침대 수(실측)', () => {
  it('침대 수가 적으면(<20) 이유에 반영되고 등급이 올라간다', () => {
    const few = assessCongestion({ townKm: 300, totalBeds: 10, date: null })
    const many = assessCongestion({ townKm: 300, totalBeds: 200, date: null })
    expect(few.reasonsKo.some((x) => x.includes('적은 편'))).toBe(true)
    expect(many.level === 'LOW').toBe(true)
  })

  it('침대 데이터가 없으면(null) 그 이유로 등급을 올리지 않는다', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: null, date: null })
    expect(r.totalBeds).toBeNull()
    expect(r.reasonsKo.some((x) => x.includes('적은 편'))).toBe(false)
  })
})

describe('congestion — 사리아 이후 구간', () => {
  it('사리아(658.9km) 이후는 이유에 반영된다', () => {
    const r = assessCongestion({ townKm: 700, totalBeds: 100, date: null })
    expect(r.reasonsKo.some((x) => x.includes('사리아'))).toBe(true)
  })
  it('사리아 이전은 반영되지 않는다', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: null })
    expect(r.reasonsKo.some((x) => x.includes('사리아'))).toBe(false)
  })
})

describe('congestion — 성수기·특수일', () => {
  it('5~10월은 성수기로 반영된다', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2026-07-15') })
    expect(r.reasonsKo.some((x) => x.includes('성수기'))).toBe(true)
  })
  it('9월은 성수기 + 최성수 둘 다 반영된다', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2026-09-10') })
    expect(r.reasonsKo.some((x) => x.includes('성수기'))).toBe(true)
    expect(r.reasonsKo.some((x) => x.includes('최성수'))).toBe(true)
  })
  it('겨울(1월)은 성수기로 반영되지 않는다', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2026-01-15') })
    expect(r.reasonsKo.some((x) => x.includes('성수기'))).toBe(false)
  })
  it('7월 25일 성 야고보 축일은 산티아고 인근(remainingKm<=30)에서만 반영된다', () => {
    const near = assessCongestion({ townKm: 760, totalBeds: 100, date: d('2026-07-25') })
    const far = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2026-07-25') })
    expect(near.reasonsKo.some((x) => x.includes('성 야고보'))).toBe(true)
    expect(far.reasonsKo.some((x) => x.includes('성 야고보'))).toBe(false)
  })
  it('산 페르민(7/6~14)은 팜플로나 인근(km 67.5 근방)에서만 반영된다', () => {
    const near = assessCongestion({ townKm: 67.5, totalBeds: 100, date: d('2026-07-10') })
    const far = assessCongestion({ townKm: 500, totalBeds: 100, date: d('2026-07-10') })
    expect(near.reasonsKo.some((x) => x.includes('산 페르민'))).toBe(true)
    expect(far.reasonsKo.some((x) => x.includes('산 페르민'))).toBe(false)
  })
  it('2027년은 성년으로 반영된다', () => {
    const r = assessCongestion({ townKm: 300, totalBeds: 100, date: d('2027-06-01') })
    expect(r.reasonsKo.some((x) => x.includes('성년'))).toBe(true)
  })
  it('날짜가 없으면(date: null) 날짜 기반 요소는 전부 건너뛴다', () => {
    const r = assessCongestion({ townKm: 700, totalBeds: 10, date: null })
    expect(r.reasonsKo.every((x) => !x.includes('성수기') && !x.includes('축일') && !x.includes('성년'))).toBe(true)
  })
})

describe('congestion — 등급 3단계', () => {
  it('아무 위험 요소 없음 → LOW', () => {
    const r = assessCongestion({ townKm: 100, totalBeds: 200, date: d('2026-01-15') })
    expect(r.level).toBe('LOW')
  })
  it('여러 요소 겹치면 → HIGH', () => {
    const r = assessCongestion({ townKm: 700, totalBeds: 10, date: d('2026-09-10') })
    expect(r.level).toBe('HIGH')
  })
})

/**
 * cards.test.ts — F-12 보여주기 카드 규칙 11 검증.
 *
 * A축(부상) 카드는 처치·약품을 지정하면 안 되고 "전문가에게 도움·추천을
 * 요청하는 데서 멈춰야" 한다(lib/phrasebook.test.ts와 같은 원칙·같은 금칙어
 * 목록). 코드 리뷰만으론 놓치기 쉬운 회귀를 막는다.
 */

import { describe, it, expect } from 'vitest'
import { cards } from './cards'

const FORBIDDEN_WORDS = [
  'ibuprofeno', '이부프로펜',
  'antiinflamatorio', '소염제',
  'paracetamol', '파라세타몰',
  'aspirina', '아스피린',
  'pomada', '연고',
  'venda', '붕대',
]

const injuryCards = cards.filter((c) => c.category === 'INJURY')

describe('cards — 23장 고정', () => {
  it('총 23장', () => {
    expect(cards.length).toBe(23)
  })

  it('id 중복 없음', () => {
    const ids = cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('cards — A축(부상) 규칙 11', () => {
  it('8장 전부 INJURY 카테고리', () => {
    expect(injuryCards.length).toBe(8)
  })

  it.each(injuryCards.map((c) => c.id))('%s — 약품명·처치법 금칙어 없음(steps+blockedReasonKo 전부)', (id) => {
    const card = injuryCards.find((c) => c.id === id)!
    const joined = [
      card.blockedReasonKo ?? '',
      ...card.steps.flatMap((s) => [
        s.promptEs,
        s.promptKo,
        ...s.options.flatMap((o) => [o.labelEs, o.labelKo]),
      ]),
    ]
      .join(' ')
      .toLowerCase()
    for (const w of FORBIDDEN_WORDS) {
      expect(joined).not.toContain(w.toLowerCase())
    }
  })

  it('steps가 있는 카드는 blockedReasonKo로 "검수 대기"를 밝힌다(자문 검수를 거친 것처럼 보이면 안 됨)', () => {
    for (const card of injuryCards) {
      if (card.steps.length > 0) {
        expect(card.blockedReasonKo).not.toBeNull()
      }
    }
  })

  it('A7은 여전히 완전히 보류(steps 비어 있음) — 성격이 달라 이번 초안 대상이 아님', () => {
    const a7 = injuryCards.find((c) => c.id === 'A7')!
    expect(a7.steps.length).toBe(0)
    expect(a7.blockedReasonKo).not.toBeNull()
  })
})

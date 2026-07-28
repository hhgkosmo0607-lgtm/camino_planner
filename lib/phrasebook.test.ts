/**
 * phrasebook.test.ts — F-04 예약 스크립트 생성기 테스트.
 *
 * 규칙 11 검증이 핵심이다: 약국·응급·빈대 문장에 약품명·처치법이 섞여 들어가지
 * 않는지 금칙어로 감시한다(코드 리뷰만으론 놓치기 쉬운 회귀 방지).
 */

import { describe, it, expect } from 'vitest'
import { buildPhrase, PHRASE_SITUATIONS, type PhraseSituationId } from './phrasebook'

const ALL_SITUATIONS = PHRASE_SITUATIONS.map((s) => s.id)

// 통증 대처법·약품명(규칙 11)에 해당할 수 있는 스페인어/한국어 낱말. 하나라도
// 나오면 "우리가 처치를 지정"하는 쪽으로 넘어간 것 — 실패해야 한다.
const FORBIDDEN_WORDS = [
  'ibuprofeno', '이부프로펜',
  'antiinflamatorio', '소염제',
  'paracetamol', '파라세타몰',
  'aspirina', '아스피린',
  'pomada', '연고',
  'venda', '붕대',
]

describe('phrasebook — buildPhrase', () => {
  const baseParams = { people: 2, hour: 15, name: '' }

  it.each(ALL_SITUATIONS)('%s — 최소 1줄 이상, es/ko/meaning 모두 채워짐', (id) => {
    const lines = buildPhrase(id as PhraseSituationId, baseParams)
    expect(lines.length).toBeGreaterThan(0)
    for (const l of lines) {
      expect(l.es.trim()).not.toBe('')
      expect(l.ko.trim()).not.toBe('')
      expect(l.meaning.trim()).not.toBe('')
    }
  })

  it.each(ALL_SITUATIONS)('%s — 규칙 11: 약품명·처치법 금칙어 없음', (id) => {
    const lines = buildPhrase(id as PhraseSituationId, baseParams)
    const joined = lines.map((l) => `${l.es} ${l.ko} ${l.meaning}`).join(' ').toLowerCase()
    for (const w of FORBIDDEN_WORDS) {
      expect(joined).not.toContain(w.toLowerCase())
    }
  })

  it('albergue_call — 1인은 단수 문장(Soy una persona)', () => {
    const lines = buildPhrase('albergue_call', { people: 1, hour: 15, name: '' })
    expect(lines.some((l) => l.es.includes('Soy una persona'))).toBe(true)
  })

  it('albergue_call — 다인은 Somos N personas', () => {
    const lines = buildPhrase('albergue_call', { people: 3, hour: 15, name: '' })
    expect(lines.some((l) => l.es === 'Somos tres personas.')).toBe(true)
  })

  it('albergue_call — 이름을 넣으면 Mi nombre es 줄이 추가된다', () => {
    const withName = buildPhrase('albergue_call', { people: 1, hour: 15, name: '김철수' })
    const withoutName = buildPhrase('albergue_call', { people: 1, hour: 15, name: '' })
    expect(withName.some((l) => l.es.includes('Mi nombre es 김철수'))).toBe(true)
    expect(withoutName.some((l) => l.es.startsWith('Mi nombre es'))).toBe(false)
  })

  it('사람 수·시각 범위를 벗어나면 안전 범위로 잘린다', () => {
    const lines = buildPhrase('albergue_call', { people: 999, hour: -5, name: '' })
    expect(lines.some((l) => l.es.includes('nueve personas'))).toBe(true)
  })

  it('시각 1시는 la una (여성 단수) 문법을 쓴다', () => {
    const lines = buildPhrase('albergue_call', { people: 1, hour: 13, name: '' })
    expect(lines.some((l) => l.es.includes('sobre la una'))).toBe(true)
  })

  it('restaurant — 순례자 메뉴 문구를 포함한다', () => {
    const lines = buildPhrase('restaurant', { people: 2, hour: 0, name: '' })
    expect(lines.some((l) => l.es.includes('menú del peregrino'))).toBe(true)
  })
})

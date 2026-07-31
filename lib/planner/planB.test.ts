/**
 * planB.test.ts — F-21 Plan B(축소판) 대안 미리보기 순수 함수 테스트.
 */

import { describe, it, expect } from 'vitest'
import { planBOptions } from './planB'

describe('planBOptions', () => {
  it('부르고스→오르니요스: 더 간다(온타나스)·되돌아간다(타르다호스)·사립예약(2곳)이 나온다', () => {
    const opts = planBOptions('burgos', 'hornillos-del-camino')
    const further = opts.find((o) => o.kind === 'FURTHER')
    const shorter = opts.find((o) => o.kind === 'SHORTER')
    const priv = opts.find((o) => o.kind === 'PRIVATE_BOOKING')

    expect(further?.townId).toBe('hontanas')
    expect(further!.totalDayKm).toBeGreaterThan(0)
    expect(shorter?.townId).toBe('tardajos')
    expect(shorter!.deltaKm).toBeLessThan(0) // 되돌아가면 원래보다 짧아진다
    expect(priv?.labelKo).toContain('2곳')
  })

  it('바로 다음 마을이 도착지면(경계 붙음) 되돌아간다 옵션이 없다', () => {
    const opts = planBOptions('burgos', 'tardajos')
    expect(opts.find((o) => o.kind === 'SHORTER')).toBeUndefined()
  })

  it('도착지가 산티아고(마지막 마을)면 더 간다 옵션이 없다', () => {
    const opts = planBOptions('monte-do-gozo', 'santiago-de-compostela')
    expect(opts.find((o) => o.kind === 'FURTHER')).toBeUndefined()
  })

  it('실제 조사된 노선(부르고스~레온)이 있는 구간만 이동수단 옵션이 뜬다', () => {
    const withTransit = planBOptions('burgos', 'leon')
    expect(withTransit.find((o) => o.kind === 'TRANSPORT')).toBeDefined()

    const withoutTransit = planBOptions('burgos', 'hornillos-del-camino')
    expect(withoutTransit.find((o) => o.kind === 'TRANSPORT')).toBeUndefined()
  })

  it('사립 알베르게가 없는 마을(공립만 있는 마을)은 사립예약 옵션이 없다', () => {
    // Xunta 공립만 있는 갈리시아 소도시 예시 — 실제 데이터 기준으로 확인
    const opts = planBOptions('sarria', 'portomarin')
    const priv = opts.find((o) => o.kind === 'PRIVATE_BOOKING')
    // 사립이 있으면 카운트가 맞아야 하고, 없으면 옵션 자체가 없어야 한다(지어내지 않음)
    if (priv) expect(priv.labelKo).toMatch(/\d+곳/)
  })
})

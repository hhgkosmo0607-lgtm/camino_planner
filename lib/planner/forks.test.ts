/**
 * forks.test.ts — F-19 갈림길 판정 순수 함수 테스트.
 */

import { describe, it, expect } from 'vitest'
import { forksFullyInStage, defaultVariant, selectedVariant, isVariantClosedOn } from './forks'
import { forks } from '../../data/forks'
import { towns } from '../../data/towns'

const kmOf = (id: string) => towns.find((t) => t.id === id)!.km

describe('forksFullyInStage', () => {
  it('생장→론세스바예스 하루(0~25.7km 근처)에는 fork-saint-jean이 완전히 들어간다', () => {
    const fromKm = kmOf('saint-jean-pied-de-port')
    const toKm = kmOf('roncesvalles')
    const found = forksFullyInStage(fromKm, toKm)
    expect(found.some((f) => f.id === 'fork-saint-jean')).toBe(true)
  })

  it('구간이 fork 중간에서 끊기면(경계 걸침) 반환하지 않는다', () => {
    const fromKm = kmOf('saint-jean-pied-de-port')
    const toKm = kmOf('orisson') // fork-saint-jean은 roncesvalles까지라 여기서 끊김
    const found = forksFullyInStage(fromKm, toKm)
    expect(found.some((f) => f.id === 'fork-saint-jean')).toBe(false)
  })

  it('fork가 전혀 없는 범위(예: 팜플로나 근처 짧은 구간)는 빈 배열', () => {
    const found = forksFullyInStage(kmOf('cizur-menor'), kmOf('uterga'))
    expect(found).toEqual([])
  })

  it('루프형(splitTownId===mergeTownId, 예: fork-estella)도 그 지점이 구간 안에 있으면 잡힌다', () => {
    const km = kmOf('villatuerta')
    const found = forksFullyInStage(km - 0.1, km + 5)
    expect(found.some((f) => f.id === 'fork-estella')).toBe(true)
  })
})

describe('defaultVariant / selectedVariant', () => {
  const forkSaintJean = forks.find((f) => f.id === 'fork-saint-jean')!

  it('defaultVariant는 isMain:true인 variant(나폴레옹)를 반환한다', () => {
    expect(defaultVariant(forkSaintJean).id).toBe('napoleon')
  })

  it('selectedVariant(변형id 지정)는 그 variant를 반환한다', () => {
    expect(selectedVariant(forkSaintJean, 'valcarlos').id).toBe('valcarlos')
  })

  it('selectedVariant(존재하지 않는 id)는 기본값으로 폴백한다', () => {
    expect(selectedVariant(forkSaintJean, 'no-such-variant').id).toBe('napoleon')
  })

  it('selectedVariant(undefined)는 기본값', () => {
    expect(selectedVariant(forkSaintJean, undefined).id).toBe('napoleon')
  })
})

describe('isVariantClosedOn — 나폴레옹 루트 겨울 폐쇄(11-01~03-31, 연말 경계 넘김)', () => {
  const napoleon = forks.find((f) => f.id === 'fork-saint-jean')!.variants.find((v) => v.id === 'napoleon')!
  const valcarlos = forks.find((f) => f.id === 'fork-saint-jean')!.variants.find((v) => v.id === 'valcarlos')!

  it('12월(폐쇄 기간)이면 true', () => {
    expect(isVariantClosedOn(napoleon, '2026-12-15')).toBe(true)
  })

  it('1월(연말 경계 넘김, 폐쇄 기간)이면 true', () => {
    expect(isVariantClosedOn(napoleon, '2027-01-10')).toBe(true)
  })

  it('7월(개방 기간)이면 false', () => {
    expect(isVariantClosedOn(napoleon, '2026-07-15')).toBe(false)
  })

  it('경계 날짜(11/1, 3/31)는 폐쇄로 포함', () => {
    expect(isVariantClosedOn(napoleon, '2026-11-01')).toBe(true)
    expect(isVariantClosedOn(napoleon, '2027-03-31')).toBe(true)
  })

  it('closedFrom/closedTo가 없는 variant(발카를로스)는 항상 false', () => {
    expect(isVariantClosedOn(valcarlos, '2026-12-15')).toBe(false)
  })

  it('dateStr이 null이면 false(모르면 경고를 지어내지 않는다)', () => {
    expect(isVariantClosedOn(napoleon, null)).toBe(false)
  })
})

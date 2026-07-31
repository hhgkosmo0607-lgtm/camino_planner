import { describe, it, expect } from 'vitest'
import { encodePlan, decodePlan, withVariantChoice, withDayOverride, withTransportSkip } from './url'
import type { PlanInput, MobilityProfile } from './schema'

const foot: MobilityProfile = {
  mode: 'FOOT',
  maxKmPerDay: 40,
  needsSupportVehicle: false,
  needsCompanion: false,
  avoidSurfaces: [],
  bagTransferRequired: false,
}
const base: PlanInput = {
  startTownId: 'saint-jean-pied-de-port',
  mobility: foot,
  targetKmPerDay: 24,
  fitness: 'normal',
  restDays: 0,
  useBagTransfer: 'none',
  plannedTransport: [],
}
const decode = (qs: string) => decodePlan(new URLSearchParams(qs))

describe('url 인코딩/디코딩', () => {
  it('기본값 계획은 빈 쿼리스트링 (URL 짧게)', () => {
    expect(encodePlan(base)).toBe('')
  })

  it('라운드트립(encode 했다가 다시 decode 해서 원래 값이 그대로 나오는지 확인): 사리아 20km high 휴식2', () => {
    const input: PlanInput = {
      ...base,
      startTownId: 'sarria',
      targetKmPerDay: 20,
      fitness: 'high',
      restDays: 2,
    }
    const round = decode(encodePlan(input))
    expect(round.startTownId).toBe('sarria')
    expect(round.targetKmPerDay).toBe(20)
    expect(round.fitness).toBe('high')
    expect(round.restDays).toBe(2)
  })

  it('일수 모드 라운드트립', () => {
    const input: PlanInput = { ...base, targetKmPerDay: undefined, totalDays: 40 }
    const round = decode(encodePlan(input))
    expect(round.totalDays).toBe(40)
    expect(round.targetKmPerDay).toBeUndefined()
  })

  it('메세타 버스 라운드트립', () => {
    const input: PlanInput = {
      ...base,
      plannedTransport: [
        { fromTownId: 'burgos', toTownId: 'leon', mode: 'BUS', reasonKo: 'x', skippedKm: 180, costEur: null },
      ],
    }
    const round = decode(encodePlan(input))
    expect(round.plannedTransport).toHaveLength(1)
    expect(round.plannedTransport[0].fromTownId).toBe('burgos')
    expect(round.plannedTransport[0].toTownId).toBe('leon')
    expect(round.plannedTransport[0].skippedKm).toBeGreaterThan(0)
  })

  it('잘못된 값은 기본값으로 폴백', () => {
    const r = decode('start=없는마을&d=999&f=슈퍼맨&rest=-5&skip=xxx~yyy')
    expect(r.startTownId).toBe('saint-jean-pied-de-port')
    expect(r.targetKmPerDay).toBe(40) // 999 → 상한 40
    expect(r.fitness).toBe('normal')
    expect(r.restDays).toBe(0) // -5 → 하한 0
    expect(r.plannedTransport).toHaveLength(0) // 없는 마을 → 버림
  })

  it('출발일(sd) 라운드트립 + 잘못된 날짜는 무시', () => {
    const withDate: PlanInput = { ...base, startDate: '2026-09-01' }
    expect(decode(encodePlan(withDate)).startDate).toBe('2026-09-01')
    // 형식/존재하지 않는 날짜는 폴백(undefined)
    expect(decode('sd=2026-13-40').startDate).toBeUndefined()
    expect(decode('sd=nope').startDate).toBeUndefined()
  })

  it('빈 쿼리스트링은 기본 계획', () => {
    const r = decode('')
    expect(r.startTownId).toBe('saint-jean-pied-de-port')
    expect(r.targetKmPerDay).toBe(24)
    expect(r.fitness).toBe('normal')
  })

  it('갈림길 선택(v) 라운드트립 — 여러 fork 동시에', () => {
    const withVariants: PlanInput = {
      ...base,
      variantChoices: { 'fork-saint-jean': 'valcarlos', 'fork-triacastela': 'samos' },
    }
    const round = decode(encodePlan(withVariants))
    expect(round.variantChoices).toEqual({
      'fork-saint-jean': 'valcarlos',
      'fork-triacastela': 'samos',
    })
  })

  it('v가 없으면 variantChoices는 undefined', () => {
    expect(decode('').variantChoices).toBeUndefined()
  })

  it('형식이 깨진 v 항목(짝 안 맞음)은 그 항목만 버린다', () => {
    const r = decode('v=fork-saint-jean~valcarlos,깨진항목,fork-triacastela~samos')
    expect(r.variantChoices).toEqual({
      'fork-saint-jean': 'valcarlos',
      'fork-triacastela': 'samos',
    })
  })
})

describe('withVariantChoice — ForkPicker 링크 생성', () => {
  it('선택하지 않은 fork에 variant를 고르면 v에 추가된다', () => {
    const qs = withVariantChoice(new URLSearchParams('start=sarria'), 'fork-saint-jean', 'valcarlos', false)
    const p = new URLSearchParams(qs)
    expect(p.get('start')).toBe('sarria') // 기존 파라미터는 보존
    expect(p.get('v')).toBe('fork-saint-jean~valcarlos')
  })

  it('기본(isDefault=true)을 다시 고르면 v에서 그 fork가 빠진다', () => {
    const qs = withVariantChoice(
      new URLSearchParams('v=fork-saint-jean~valcarlos'),
      'fork-saint-jean',
      'napoleon',
      true,
    )
    const p = new URLSearchParams(qs)
    expect(p.has('v')).toBe(false)
  })

  it('다른 fork의 선택은 그대로 두고 이 fork만 바꾼다', () => {
    const qs = withVariantChoice(
      new URLSearchParams('v=fork-saint-jean~valcarlos,fork-triacastela~samos'),
      'fork-saint-jean',
      'napoleon',
      true,
    )
    const p = new URLSearchParams(qs)
    expect(p.get('v')).toBe('fork-triacastela~samos')
  })
})

describe('withDayOverride — F-21 Plan B 재계산 링크 생성', () => {
  it('도착지를 고르면 pb에 추가된다', () => {
    const qs = withDayOverride(new URLSearchParams('start=burgos'), 'burgos', 'hontanas')
    const p = new URLSearchParams(qs)
    expect(p.get('start')).toBe('burgos') // 기존 파라미터는 보존
    expect(p.get('pb')).toBe('burgos~hontanas')
  })

  it('toTownId를 null로 주면 그 fromTownId의 오버라이드가 지워진다(자동 계산으로 되돌리기)', () => {
    const qs = withDayOverride(new URLSearchParams('pb=burgos~hontanas'), 'burgos', null)
    const p = new URLSearchParams(qs)
    expect(p.has('pb')).toBe(false)
  })

  it('다른 날의 오버라이드는 그대로 두고 이 날만 바꾼다', () => {
    const qs = withDayOverride(new URLSearchParams('pb=burgos~hontanas,leon~astorga'), 'burgos', 'castrojeriz')
    const p = new URLSearchParams(qs)
    expect(p.get('pb')).toBe('burgos~castrojeriz,leon~astorga')
  })
})

describe('withTransportSkip — F-21 Plan B "이동수단" 적용', () => {
  it('skip이 없을 때 쌍을 추가한다', () => {
    const qs = withTransportSkip(new URLSearchParams(''), 'burgos', 'leon')
    expect(new URLSearchParams(qs).get('skip')).toBe('burgos~leon')
  })

  it('기존 skip 쌍은 보존하고 새 쌍을 덧붙인다', () => {
    const qs = withTransportSkip(new URLSearchParams('skip=sahagun~leon'), 'burgos', 'leon')
    const p = new URLSearchParams(qs)
    expect(p.get('skip')).toBe('sahagun~leon,burgos~leon')
  })

  it('이미 있는 쌍을 다시 적용해도 중복 추가되지 않는다', () => {
    const qs = withTransportSkip(new URLSearchParams('skip=burgos~leon'), 'burgos', 'leon')
    expect(new URLSearchParams(qs).get('skip')).toBe('burgos~leon')
  })
})

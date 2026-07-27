import { describe, it, expect } from 'vitest'
import { encodePlan, decodePlan } from './url'
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
})

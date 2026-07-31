/**
 * url.ts — 계획(PlanInput) ↔ URL 쿼리스트링 변환.
 *
 * ★ URL이 진실의 원천이다 (CLAUDE.md 규칙 8). localStorage/DB 없음.
 *   사용자가 계획을 링크로 공유하면 그게 그대로 유입 경로가 된다.
 *
 * 순수 함수. fetch/window 참조 없음 (정적 towns/transit 만 import). 잘못된 값은 기본값 폴백.
 *
 * 쿼리 예시: "start=leon&mode=km&d=24&f=normal&rest=1&skip=burgos~leon"
 */

import type { PlanInput, MobilityProfile, PlannedTransport, TransportMode } from './schema'
import { towns } from '../data/towns'
import { findTransitOptions } from './geo'

const MODE_KO: Record<TransportMode, string> = {
  BUS: '버스',
  TRAIN: '기차',
  TAXI: '택시',
  SUPPORT_VEHICLE: '지원 차량',
}

function fmtDurationKo(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}분`
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

const DEFAULT_START = 'saint-jean-pied-de-port'
const DEFAULT_DAILY = 24
const DEFAULT_DAYS = 34
const MIN_DAILY = 3
const MAX_DAILY = 40
const MIN_DAYS = 5
const MAX_DAYS = 90

// Phase 1 은 도보 고정. 이동 방식 6종 선택은 Phase 4~5 (F-25).
const FOOT: MobilityProfile = {
  mode: 'FOOT',
  maxKmPerDay: 40,
  needsSupportVehicle: false,
  needsCompanion: false,
  avoidSurfaces: [],
  bagTransferRequired: false,
}

const FITNESS = ['low', 'normal', 'high'] as const
type Fitness = (typeof FITNESS)[number]

const townExists = (id: string) => towns.some((t) => t.id === id)
const kmOf = (id: string) => towns.find((t) => t.id === id)?.km ?? 0

/** "YYYY-MM-DD" 형식이고 실제 존재하는 날짜인지. */
function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s + 'T00:00:00Z')
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  const n = raw == null ? NaN : parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

/** "burgos~leon,sahagun~leon" → PlannedTransport[]. 잘못된 마을/역순은 버린다. */
function parseSkips(raw: string | null): PlannedTransport[] {
  if (!raw) return []
  const out: PlannedTransport[] = []
  for (const leg of raw.split(',')) {
    const [from, to] = leg.split('~')
    if (!from || !to || !townExists(from) || !townExists(to)) continue
    const skippedKm = Math.round((kmOf(to) - kmOf(from)) * 10) / 10
    if (skippedKm <= 0) continue // 앞으로 가는 이동만

    // 조사해둔 실제 노선(data/transit.ts)이 있으면 그걸로 채운다(버스 우선).
    // 없으면 지어내지 않고 일반 문구 + costEur null 로 남긴다.
    const options = findTransitOptions(from, to)
    const opt = options.find((o) => o.mode === 'BUS') ?? options[0]
    out.push({
      fromTownId: from,
      toTownId: to,
      mode: opt?.mode ?? 'BUS',
      reasonKo: opt
        ? `${opt.operator} ${MODE_KO[opt.mode]} 약 ${fmtDurationKo(opt.durationMin)} · 메세타 건너뛰기`
        : '이동수단으로 건너뜀',
      skippedKm,
      costEur: opt ? Math.round((opt.costEurLow + opt.costEurHigh) / 2) : null,
    })
  }
  return out
}

/** "a~x,b~y" → {a: x, b: y}. 형식이 아니면(짝 안 맞음 등) 그 항목만 버린다 —
 * v(갈림길 선택)·pb(Plan B 재계산)가 같은 형식을 쓴다. 실제 id 존재 여부 검증은
 * 각 호출부(lib/planner/forks.ts, lib/planner/split.ts)가 기본값 폴백으로 처리한다. */
function parsePairMap(raw: string | null): Record<string, string> | undefined {
  if (!raw) return undefined
  const out: Record<string, string> = {}
  for (const pair of raw.split(',')) {
    const [a, b] = pair.split('~')
    if (!a || !b) continue
    out[a] = b
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function encodePairMap(map: Record<string, string> | undefined): string {
  if (!map) return ''
  return Object.entries(map)
    .map(([a, b]) => `${a}~${b}`)
    .join(',')
}

const parseVariantChoices = parsePairMap
const encodeVariantChoices = encodePairMap
const parseDayOverrides = parsePairMap
const encodeDayOverrides = encodePairMap

/**
 * 현재 쿼리 params에서 forkId의 선택만 variantId로 바꾼 새 쿼리스트링을 만든다.
 * isDefault(공식 표지 경로를 다시 고른 경우)면 그 fork를 v에서 아예 빼서 URL을 짧게 유지한다.
 * ForkPicker(components/ForkPicker.tsx)가 링크의 href를 만들 때 쓴다 — JS 없이도 동작해야
 * 하므로(규칙 7) 클릭 시점 계산이 아니라 서버 렌더 시점에 미리 href 문자열을 만든다.
 */
export function withVariantChoice(
  params: URLSearchParams,
  forkId: string,
  variantId: string,
  isDefault: boolean,
): string {
  const choices = parseVariantChoices(params.get('v')) ?? {}
  const next = { ...choices }
  if (isDefault) delete next[forkId]
  else next[forkId] = variantId
  const out = new URLSearchParams(params)
  const encoded = encodeVariantChoices(Object.keys(next).length > 0 ? next : undefined)
  if (encoded) out.set('v', encoded)
  else out.delete('v')
  return out.toString()
}

/**
 * F-21 Plan B 재계산. fromTownId 하루의 도착지를 toTownId로 강제하는 pb= 쿼리를
 * 만든다. toTownId가 null이면 그 fromTownId의 오버라이드를 지워 자동 계산으로
 * 되돌린다. ForkPicker의 withVariantChoice와 같은 서버 렌더 시점 href 생성 패턴.
 */
export function withDayOverride(
  params: URLSearchParams,
  fromTownId: string,
  toTownId: string | null,
): string {
  const overrides = parseDayOverrides(params.get('pb')) ?? {}
  const next = { ...overrides }
  if (toTownId) next[fromTownId] = toTownId
  else delete next[fromTownId]
  const out = new URLSearchParams(params)
  const encoded = encodeDayOverrides(Object.keys(next).length > 0 ? next : undefined)
  if (encoded) out.set('pb', encoded)
  else out.delete('pb')
  return out.toString()
}

/**
 * F-21 Plan B "이동수단" 대안 적용. skip= 목록에 fromTownId~toTownId 쌍을
 * 추가한다(이미 조사된 노선이 있는 구간만 planB.ts가 이 옵션을 내놓는다).
 * skip=은 이미 여러 쌍을 쉼표로 담을 수 있는 형식이라(parseSkips) 기존 형식을 그대로 쓴다.
 */
export function withTransportSkip(params: URLSearchParams, fromTownId: string, toTownId: string): string {
  const pairs = (params.get('skip') ?? '')
    .split(',')
    .map((p) => p.split('~'))
    .filter((p): p is [string, string] => p.length === 2 && !!p[0] && !!p[1])
  const already = pairs.some(([f, t]) => f === fromTownId && t === toTownId)
  const next = already ? pairs : [...pairs, [fromTownId, toTownId] as [string, string]]
  const out = new URLSearchParams(params)
  const encoded = next.map(([f, t]) => `${f}~${t}`).join(',')
  if (encoded) out.set('skip', encoded)
  else out.delete('skip')
  return out.toString()
}

/** URLSearchParams → PlanInput. 모든 필드는 잘못된 값이면 기본값으로 폴백. */
export function decodePlan(params: URLSearchParams): PlanInput {
  const startRaw = params.get('start')
  const startTownId = startRaw && townExists(startRaw) ? startRaw : DEFAULT_START

  const mode = params.get('mode') === 'days' ? 'days' : 'km'
  const fRaw = params.get('f')
  const fitness: Fitness = (FITNESS as readonly string[]).includes(fRaw ?? '')
    ? (fRaw as Fitness)
    : 'normal'
  const restDays = clampInt(params.get('rest'), 0, 10, 0)
  const plannedTransport = parseSkips(params.get('skip'))

  const base: PlanInput = {
    startTownId,
    mobility: FOOT,
    fitness,
    restDays,
    useBagTransfer: 'none',
    plannedTransport,
  }

  const variantChoices = parseVariantChoices(params.get('v'))
  if (variantChoices) base.variantChoices = variantChoices

  const dayOverrides = parseDayOverrides(params.get('pb'))
  if (dayOverrides) base.dayOverrides = dayOverrides

  const sd = params.get('sd')
  if (sd && isIsoDate(sd)) base.startDate = sd

  if (mode === 'days') {
    base.totalDays = clampInt(params.get('days'), MIN_DAYS, MAX_DAYS, DEFAULT_DAYS)
  } else {
    base.targetKmPerDay = clampInt(params.get('d'), MIN_DAILY, MAX_DAILY, DEFAULT_DAILY)
  }
  return base
}

/** PlanInput → 쿼리스트링. 기본값은 생략해 URL을 짧게 유지한다. */
export function encodePlan(input: PlanInput): string {
  const p = new URLSearchParams()
  if (input.startTownId !== DEFAULT_START) p.set('start', input.startTownId)

  if (input.totalDays != null) {
    p.set('mode', 'days')
    p.set('days', String(input.totalDays))
  } else if (input.targetKmPerDay != null && input.targetKmPerDay !== DEFAULT_DAILY) {
    p.set('d', String(input.targetKmPerDay))
  }

  if (input.fitness !== 'normal') p.set('f', input.fitness)
  if (input.restDays > 0) p.set('rest', String(input.restDays))
  if (input.startDate) p.set('sd', input.startDate)
  if (input.variantChoices) {
    const v = encodeVariantChoices(input.variantChoices)
    if (v) p.set('v', v)
  }
  if (input.dayOverrides) {
    const pb = encodeDayOverrides(input.dayOverrides)
    if (pb) p.set('pb', pb)
  }
  if (input.plannedTransport.length > 0) {
    p.set('skip', input.plannedTransport.map((t) => `${t.fromTownId}~${t.toTownId}`).join(','))
  }
  return p.toString()
}

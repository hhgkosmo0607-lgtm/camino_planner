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
  if (input.plannedTransport.length > 0) {
    p.set('skip', input.plannedTransport.map((t) => `${t.fromTownId}~${t.toTownId}`).join(','))
  }
  return p.toString()
}

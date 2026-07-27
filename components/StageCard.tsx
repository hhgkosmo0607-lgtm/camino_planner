/**
 * StageCard.tsx — 일자별(에타파) 구간 카드.
 *
 * CLAUDE.md:
 *  - 도착지 한글명(크게) + 원어명(작게). 원어 생략 금지 (규칙 5)
 *  - 경고 배지는 겁주기가 아니라 준비용. 노란색(flecha)은 쓰지 않는다(길 안내 전용)
 *  - 휴식일 / 계획된 이동수단은 다르게 표시
 *  - 수치 18px 이상, mono tabular-nums
 *
 * ※ Plan B 접힘(F-21)은 Phase 3. 여기선 카드 표시까지만.
 */

import type { Stage, StageWarning } from '@/lib/schema'
import { towns } from '@/data/towns'

const TRANSPORT_LABEL: Record<string, string> = {
  BUS: '버스',
  TRAIN: '기차',
  TAXI: '택시',
  SUPPORT_VEHICLE: '지원 차량',
}

const WARNING_META: Record<StageWarning, { ko: string; severity: 'danger' | 'warn' }> = {
  STEEP_DESCENT: { ko: '급내리막 · 무릎 주의', severity: 'danger' },
  STEEP_CLIMB: { ko: '급오르막', severity: 'danger' },
  LONG_DISTANCE: { ko: '긴 거리', severity: 'warn' },
  FEW_BEDS: { ko: '침대 적음', severity: 'warn' },
  NO_SERVICES: { ko: '물 · 식당 없는 구간', severity: 'warn' },
  EARLY_OVERLOAD: { ko: '초반 과부하', severity: 'warn' },
  CONSECUTIVE_HARD: { ko: '연속 고강도', severity: 'warn' },
}

const townName = (id: string) => towns.find((t) => t.id === id)
const fmt = (n: number) => n.toLocaleString('en-US')

function Badge({ warning }: { warning: StageWarning }) {
  const meta = WARNING_META[warning]
  const danger = meta.severity === 'danger'
  return (
    <span
      className={
        'inline-flex items-center rounded px-2 py-1 text-[13px] font-medium ' +
        (danger ? 'bg-vino/10 text-vino' : 'bg-stone/50 text-ink')
      }
    >
      {meta.ko}
    </span>
  )
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-lg font-semibold tabular-nums leading-none text-text">
        {value}
        {unit && <span className="ml-0.5 text-[13px] font-normal text-muted">{unit}</span>}
      </div>
      <div className="mt-1 text-[13px] text-muted">{label}</div>
    </div>
  )
}

export function StageCard({ stage }: { stage: Stage }) {
  const to = townName(stage.toTownId)
  const from = townName(stage.fromTownId)

  // ── 휴식일 ──
  if (stage.isRestDay) {
    return (
      <article className="rounded-lg border border-stone bg-white/60 px-4 py-4">
        <div className="flex items-center gap-3">
          <DayNo n={stage.dayNo} muted />
          <div>
            <div className="text-[17px] font-semibold text-text">
              휴식일 · {to?.nameKo}
            </div>
            <div className="text-[13px] text-muted">{to?.nameEs}에서 하루 쉼</div>
          </div>
        </div>
      </article>
    )
  }

  // ── 계획된 이동수단 ──
  if (stage.transport) {
    const t = stage.transport
    return (
      <article className="rounded-lg border border-dashed border-stone bg-white/40 px-4 py-4">
        <div className="flex items-start gap-3">
          <DayNo n={stage.dayNo} muted />
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-semibold text-text">
              {TRANSPORT_LABEL[t.mode] ?? t.mode} 이동 · {to?.nameKo}
              <span className="ml-1.5 text-[13px] font-normal text-muted">{to?.nameEs}</span>
            </div>
            <div className="mt-1 text-[14px] text-muted">
              {from?.nameKo} → {to?.nameKo} · {t.reasonKo}
            </div>
            <div className="mt-2 font-mono text-[14px] tabular-nums text-muted">
              걷지 않는 구간 {fmt(t.skippedKm)}km
              {t.costEur != null && ` · 약 €${t.costEur}`}
            </div>
          </div>
        </div>
      </article>
    )
  }

  // ── 일반 도보 구간 ──
  const estH = Math.floor(stage.estimatedMinutes / 60)
  const estM = stage.estimatedMinutes % 60
  return (
    <article className="rounded-lg border border-stone bg-white px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <DayNo n={stage.dayNo} />
          <div className="min-w-0">
            <div className="text-[17px] font-semibold leading-tight text-text">{to?.nameKo}</div>
            <div className="text-[13px] text-muted">{to?.nameEs}</div>
            <div className="mt-1 text-[13px] text-muted">{from?.nameKo} 출발</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold tabular-nums leading-none text-text">
            {stage.distanceKm.toFixed(1)}
            <span className="ml-0.5 text-[13px] font-normal text-muted">km</span>
          </div>
          {stage.suggestedStartTime && (
            <div className="mt-1 font-mono text-[13px] tabular-nums text-muted">
              출발 {stage.suggestedStartTime}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-6 border-t border-stone pt-3">
        <Metric label="오르막" value={`+${fmt(stage.ascent)}`} unit="m" />
        <Metric label="내리막" value={`−${fmt(stage.descent)}`} unit="m" />
        <Metric label="예상 소요" value={estH > 0 ? `${estH}시간 ${estM}분` : `${estM}분`} />
        {to && to.beds > 0 && <Metric label="침대" value={`약 ${fmt(to.beds)}`} />}
      </div>

      {stage.warnings.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.warnings.map((w) => (
            <Badge key={w} warning={w} />
          ))}
        </div>
      )}
    </article>
  )
}

function DayNo({ n, muted }: { n: number; muted?: boolean }) {
  return (
    <div
      className={
        'flex h-11 w-11 flex-none items-center justify-center rounded font-mono text-[15px] font-semibold tabular-nums ' +
        (muted ? 'bg-granite text-muted' : 'bg-ink text-white')
      }
      aria-label={`${n}일차`}
    >
      {String(n).padStart(2, '0')}
    </div>
  )
}

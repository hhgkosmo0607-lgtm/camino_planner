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

import type { Stage, StageWarning, WaypointKind, HazardType, CongestionInfo, CongestionLevel } from '@/lib/schema'
import { towns } from '@/data/towns'
import { forksFullyInStage } from '@/lib/planner/forks'
import { ForkPicker } from '@/components/ForkPicker'

const TRANSPORT_LABEL: Record<string, string> = {
  BUS: '버스',
  TRAIN: '기차',
  TAXI: '택시',
  SUPPORT_VEHICLE: '지원 차량',
}

const WAYPOINT_ICON: Partial<Record<WaypointKind, string>> = {
  START: '출발',
  ARRIVE: '도착',
  WATER: '식수',
  PHARMACY: '약국',
  ATM: 'ATM',
  BAG_DROP: '짐배송',
}

const HAZARD_ICON: Partial<Record<HazardType, string>> = {
  STEEP_DESCENT: '급내리막',
  NO_WATER: '물 없음',
  ROAD_WALKING: '차도 병행',
  WINTER_RISK: '겨울 결빙',
  EXPOSED: '그늘 없음',
}

const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  LOW: '여유',
  HURRY: '서두르세요',
  HIGH: '만실 가능성 높음',
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

/**
 * F-02 혼잡 추정. "정확도를 과장하지 않는다"(03 문서 F-02 원안) — 등급과 실제로
 * 반영된 근거만 보여준다. reasonsKo가 비어 있으면(=아무 요소도 안 걸림) 표시하지
 * 않는다(빈 카드로 겁주지 않기 위함).
 */
function CongestionNote({ c }: { c: CongestionInfo }) {
  if (c.reasonsKo.length === 0) return null
  const style =
    c.level === 'HIGH'
      ? 'border-vino/40 bg-vino/5 text-vino'
      : c.level === 'HURRY'
        ? 'border-stone bg-stone/20 text-ink'
        : 'border-moss/40 bg-moss/5 text-moss'
  return (
    <div className={`mt-3 rounded-md border px-3 py-2 text-[15px] leading-relaxed ${style}`}>
      <b>{CONGESTION_LABEL[c.level]}</b>
      <div className="mt-1 text-[13px] opacity-90">{c.reasonsKo.join(' · ')}</div>
    </div>
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

export function StageCard({
  stage,
  currentParams,
}: {
  stage: Stage
  currentParams: URLSearchParams
}) {
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
  const stageForks = from && to ? forksFullyInStage(from.km, to.km) : []
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

      {stage.congestion && <CongestionNote c={stage.congestion} />}

      {stage.warnings.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.warnings.map((w) => (
            <Badge key={w} warning={w} />
          ))}
        </div>
      )}

      {stageForks.map((fork) => (
        <ForkPicker
          key={fork.id}
          fork={fork}
          selectedVariantId={stage.variantId}
          dateStr={stage.date}
          currentParams={currentParams}
        />
      ))}

      {(stage.waypoints.length > 0 || stage.hazards.length > 0) && (
        <details className="mt-3 border-t border-stone pt-3">
          <summary className="min-h-11 cursor-pointer list-none text-[15px] font-medium text-ink underline-offset-2 marker:content-none hover:underline">
            일자별 상세 보기 (거점 {stage.waypoints.length}곳
            {stage.hazards.length > 0 ? ` · 주의 ${stage.hazards.length}곳` : ''})
          </summary>

          {stage.hazards.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {stage.hazards.map((h, i) => (
                <li key={i} className="rounded-md bg-vino/5 px-3 py-2 text-[15px] leading-relaxed text-text">
                  <span className="mr-1.5 font-medium text-vino">
                    [{HAZARD_ICON[h.type] ?? h.type}]
                  </span>
                  <span className="font-mono text-[13px] tabular-nums text-muted">
                    {h.fromKm.toFixed(1)}~{h.toKm.toFixed(1)}km
                  </span>{' '}
                  {h.noteKo}
                </li>
              ))}
            </ul>
          )}

          {stage.waypoints.length > 0 && (
            <ol className="mt-3 space-y-1.5">
              {stage.waypoints.map((w, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-[15px] text-text">
                  <span>
                    <span className="mr-1.5 text-[13px] text-muted">[{WAYPOINT_ICON[w.kind] ?? w.kind}]</span>
                    {w.labelKo}
                  </span>
                  <span className="flex-none font-mono text-[13px] tabular-nums text-muted">
                    {w.km.toFixed(1)}km
                  </span>
                </li>
              ))}
            </ol>
          )}
        </details>
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

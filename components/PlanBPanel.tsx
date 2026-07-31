/**
 * PlanBPanel.tsx — F-21 Plan B. "이 날이 어긋나면" 접힘 패널.
 *
 * ★ 별도 화면이 아니라 StageCard 안에 접혀 있다(CLAUDE.md F-21). <details>라서
 *   JS 없이도 펼쳐진다(규칙 7).
 * ★ 더 간다·되돌아간다·이동수단은 실제로 "적용" 링크가 있다 — 누르면 pb=/skip=
 *   쿼리가 바뀌어 이후 일정이 그 지점부터 다시 계산된다(규칙 8: URL이 유일한
 *   진짜 상태). 사립 예약은 일정을 바꾸지 않는 정보 제공 항목이라 적용 링크가 없다.
 * ★ ForkPicker와 같은 서버 렌더 시점 href 생성 패턴 — 클릭 시점 계산이 아니다.
 */

import type { Stage } from '@/lib/schema'
import { planBOptions, type PlanBOption } from '@/lib/planner/planB'
import { withDayOverride, withTransportSkip } from '@/lib/url'

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}분`
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

function applyHrefFor(o: PlanBOption, stage: Stage, currentParams: URLSearchParams): string | null {
  if ((o.kind === 'FURTHER' || o.kind === 'SHORTER') && o.townId) {
    return `/plan?${withDayOverride(currentParams, stage.fromTownId, o.townId)}`
  }
  if (o.kind === 'TRANSPORT') {
    return `/plan?${withTransportSkip(currentParams, stage.fromTownId, stage.toTownId)}`
  }
  return null // PRIVATE_BOOKING — 일정을 바꾸지 않는다
}

function OptionRow({ o, applyHref }: { o: PlanBOption; applyHref: string | null }) {
  const body = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
        <span className="text-[15px] font-medium text-text">{o.labelKo}</span>
        {o.totalDayKm != null && (
          <span className="font-mono text-[13px] tabular-nums text-muted">
            오늘 총 {o.totalDayKm}km
            {o.deltaKm != null && o.deltaKm !== 0 && ` (${o.deltaKm > 0 ? '+' : ''}${o.deltaKm}km)`}
          </span>
        )}
      </div>
      <div className="mt-1 text-[13px] text-muted">
        {o.noteKo}
        {o.beds != null && ` · 침대 약 ${o.beds}`}
        {o.estimatedMinutesTotal != null && ` · 약 ${fmtDuration(o.estimatedMinutesTotal)}`}
      </div>
      {o.warningKo && <div className="mt-1 text-[13px] font-medium text-vino">{o.warningKo}</div>}
      {o.kind === 'PRIVATE_BOOKING' && (
        <a href="/tools/phrases" className="mt-1 inline-block text-[13px] underline-offset-2 hover:underline">
          전화 카드 열기 →
        </a>
      )}
      {applyHref && <div className="mt-1.5 text-[13px] font-medium text-ink">이 대안 적용 →</div>}
    </>
  )

  if (applyHref) {
    return (
      <li>
        <a
          href={applyHref}
          className="block rounded-md border border-stone bg-sand-2/40 px-3 py-2 transition-colors hover:border-ink/50"
        >
          {body}
        </a>
      </li>
    )
  }
  return <li className="rounded-md border border-stone bg-sand-2/40 px-3 py-2">{body}</li>
}

export function PlanBPanel({ stage, currentParams }: { stage: Stage; currentParams: URLSearchParams }) {
  const options = planBOptions(stage.fromTownId, stage.toTownId)
  if (options.length === 0) return null

  const hasOverride = (currentParams.get('pb') ?? '')
    .split(',')
    .some((pair) => pair.startsWith(`${stage.fromTownId}~`))

  return (
    <details className="mt-3 border-t border-stone pt-3">
      <summary className="min-h-11 cursor-pointer list-none text-[15px] font-medium text-ink underline-offset-2 marker:content-none hover:underline">
        이 날이 어긋나면
      </summary>

      {hasOverride && (
        <div className="mt-2 rounded-md bg-stone/20 px-3 py-2 text-[13px] text-ink">
          이 날은 재계산된 상태입니다.{' '}
          <a
            href={`/plan?${withDayOverride(currentParams, stage.fromTownId, null)}`}
            className="font-medium underline-offset-2 hover:underline"
          >
            자동 계산으로 되돌리기
          </a>
        </div>
      )}

      <p className="mt-2 text-[13px] text-muted">
        더 간다·되돌아간다·이동수단은 적용하면 이 날의 도착지가 바뀌고, 이후 일정이 그 지점부터 다시
        계산됩니다. 사립 예약은 일정을 바꾸지 않는 정보 제공입니다.
      </p>
      <ul className="mt-2 space-y-1.5">
        {options.map((o, i) => (
          <OptionRow key={i} o={o} applyHref={applyHrefFor(o, stage, currentParams)} />
        ))}
      </ul>
    </details>
  )
}

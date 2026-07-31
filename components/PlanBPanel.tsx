/**
 * PlanBPanel.tsx — F-21 Plan B(축소판). "이 날이 어긋나면" 접힘 패널.
 *
 * ★ 별도 화면이 아니라 StageCard 안에 접혀 있다(CLAUDE.md F-21). <details>라서
 *   JS 없이도 펼쳐진다(규칙 7).
 * ★ 미리보기 전용이다. 선택해도 일정에 반영되지 않는다 — 실제로 반영해 이후
 *   구간을 다시 계산하는 것(03문서 "재계산")은 아직 없어서, 그렇다고 명시한다.
 */

import type { PlanBOption } from '@/lib/planner/planB'

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}분`
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

function OptionRow({ o }: { o: PlanBOption }) {
  return (
    <li className="rounded-md border border-stone bg-sand-2/40 px-3 py-2">
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
    </li>
  )
}

export function PlanBPanel({ options }: { options: PlanBOption[] }) {
  if (options.length === 0) return null
  return (
    <details className="mt-3 border-t border-stone pt-3">
      <summary className="min-h-11 cursor-pointer list-none text-[15px] font-medium text-ink underline-offset-2 marker:content-none hover:underline">
        이 날이 어긋나면
      </summary>
      <p className="mt-2 text-[13px] text-muted">
        미리보기입니다 — 아래 대안은 참고용 수치이며, 선택해도 이후 일정이 자동으로 다시 계산되지는 않습니다.
      </p>
      <ul className="mt-2 space-y-1.5">
        {options.map((o, i) => (
          <OptionRow key={i} o={o} />
        ))}
      </ul>
    </details>
  )
}

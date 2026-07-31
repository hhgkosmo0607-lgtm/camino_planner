'use client'

/**
 * BudgetSummary.tsx — F-23 예산 관리. 각 날짜 카드(DayChecklist)에 기록한 지출을
 * 이 기기에서 전부 모아 계획 예산(F-06)과 비교한다.
 *
 * ★ 규칙 8(2026-07-31 정정): 지출 기록은 이 기기의 localStorage에서만 읽는다.
 *   서버에 저장된 게 아니라서, 이 URL을 다른 사람과 공유해도 이 요약은 그
 *   사람 화면엔 안 뜬다 — 그 점을 화면에 밝힌다.
 * ★ "계획 예산"은 /tools/cost와 같은 계산(공립·외식 50%씩 가정)을 재사용한
 *   대략치다. 정확한 값은 /tools/cost에서 직접 조정해 보라고 안내한다.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadAllExpenses, clearAllLogs } from '@/lib/localLog'
import { summarizeExpenses, estimateTripCostManwon, EXPENSE_CATEGORY_LABEL, toManwon } from '@/lib/cost'
import type { ExpenseEntry } from '@/lib/cost'

export function BudgetSummary({ totalDays }: { totalDays: number }) {
  const [expenses, setExpenses] = useState<ExpenseEntry[] | null>(null)

  useEffect(() => {
    // DayChecklist와 같은 이유(하이드레이션 불일치 방지)로 마운트 후에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpenses(loadAllExpenses())
  }, [])

  if (expenses === null) return null // 마운트 전(서버 렌더)에는 아무것도 모른다 — 빈 화면 대신 아예 숨긴다

  if (expenses.length === 0) {
    return (
      <section className="rounded-lg border border-stone bg-white/60 px-4 py-3 text-[15px] text-muted">
        아래 각 날짜 카드의 &ldquo;오늘 체크리스트&rdquo;에서 지출을 기록하면 여기 누적됩니다(이 기기에만 저장,
        규칙 8).
      </section>
    )
  }

  const { totalEur, byCategory } = summarizeExpenses(expenses)
  const totalManwon = toManwon(totalEur)
  const planned = estimateTripCostManwon(totalDays, 50, 50, false)
  const pctOfLow = planned.total[0] > 0 ? Math.round((totalManwon / planned.total[0]) * 100) : 0

  return (
    <section className="rounded-lg border border-stone bg-white px-4 py-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg text-text">내 지출 기록</h2>
        <button
          type="button"
          onClick={() => {
            if (confirm('이 기기에 저장된 체크리스트·통증 메모·지출 기록을 전부 지울까요?')) {
              clearAllLogs()
              setExpenses([])
            }
          }}
          className="text-[13px] text-muted underline-offset-2 hover:underline"
        >
          기록 전체 지우기
        </button>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums text-text">
          €{totalEur.toFixed(0)}
        </span>
        <span className="text-[13px] text-muted">
          약 {totalManwon.toFixed(0)}만원 · 계획 예산(숙박·식사 절반씩 가정 대략치) 대비 {pctOfLow}%
        </span>
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
        {Object.entries(byCategory)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => (
            <li key={k}>
              {EXPENSE_CATEGORY_LABEL[k as keyof typeof EXPENSE_CATEGORY_LABEL]} €{v.toFixed(0)}
            </li>
          ))}
      </ul>

      <p className="mt-2 text-[13px] text-muted">
        정확한 계획 예산은{' '}
        <Link href="/tools/cost" className="underline-offset-2 hover:underline">
          비용 계산기
        </Link>
        에서 실제 조건으로 다시 계산해 보세요. 이 기록은 이 기기에만 저장되며 서버로 보내지 않습니다.
      </p>
    </section>
  )
}

'use client'

/**
 * DayChecklist.tsx — F-22 체크리스트 + F-23 지출 기록. StageCard 안 접힘.
 *
 * ★ "오늘 일정에서 자동으로 채워진다"(03문서 F-22) — 고정 항목 몇 개 + 이 Stage의
 *   실제 waypoints/hazards에서 뽑은 항목을 합쳐서 보여준다.
 * ★ 규칙 8(2026-07-31 정정): 여기서 체크·기록하는 모든 것은 이 기기의
 *   localStorage에만 남는다. 서버로 보내지 않고, 다른 기기·브라우저로 바꾸면
 *   사라진다 — 화면에 그대로 밝힌다.
 * ★ 통증 메모는 기록만 된다. "일정이 자동으로 조정된다"고 말하지 않는다
 *   (03문서 원안엔 있지만 구현 안 함 — F-21과 같은 이유, 과장 금지).
 */

import { useEffect, useState } from 'react'
import type { Stage } from '@/lib/schema'
import { loadDayLog, saveDayLog, stageKey, type DayLog } from '@/lib/localLog'
import { EXPENSE_CATEGORY_LABEL, type ExpenseCategory, type ExpenseEntry } from '@/lib/cost'

const AM_ITEMS: { id: string; labelKo: string }[] = [
  { id: 'am-tape', labelKo: '발에 테이핑·바셀린' },
  { id: 'am-laundry', labelKo: '어제 빨래 다 말랐나' },
  { id: 'am-battery', labelKo: '배터리·보조배터리 충전' },
  { id: 'am-credencial', labelKo: '크레덴시알(순례자 여권) 챙기기' },
]

const PM_ITEMS: { id: string; labelKo: string }[] = [
  { id: 'pm-feet', labelKo: '발 확인 — 물집·붉어짐' },
  { id: 'pm-laundry', labelKo: '빨래' },
  { id: 'pm-stamp', labelKo: '도장(세요) 받았나' },
  { id: 'pm-tomorrow', labelKo: '내일 숙소 확인 — 다음 날짜 카드 참고' },
]

const EMPTY_LOG: DayLog = { amChecked: [], pmChecked: [], painNote: '', expenses: [] }
const CATEGORIES: ExpenseCategory[] = ['LODGING', 'FOOD', 'TRANSPORT', 'GEAR', 'ETC']

function Checkbox({
  id,
  labelKo,
  checked,
  onToggle,
}: {
  id: string
  labelKo: string
  checked: boolean
  onToggle: (id: string) => void
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(id)}
        className="h-5 w-5 flex-none accent-ink"
      />
      <span className={checked ? 'text-muted line-through' : ''}>{labelKo}</span>
    </label>
  )
}

export function DayChecklist({ stage }: { stage: Stage }) {
  const key = stageKey(stage.fromTownId, stage.toTownId)
  const [log, setLog] = useState<DayLog>(EMPTY_LOG)
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('LODGING')
  const [note, setNote] = useState('')

  useEffect(() => {
    // 서버 렌더는 localStorage를 모르니 빈 상태로 그리고, 마운트 후에만 실제 값을
    // 읽는다 — 하이드레이션 불일치를 피하려는 의도적 2단계 렌더라 이 규칙을 끈다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLog(loadDayLog(key))
    setMounted(true)
  }, [key])

  function persist(next: DayLog) {
    setLog(next)
    saveDayLog(key, next)
  }

  function toggle(listKey: 'amChecked' | 'pmChecked', id: string) {
    const cur = log[listKey]
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    persist({ ...log, [listKey]: next })
  }

  function addExpense() {
    const n = parseFloat(amount)
    if (!Number.isFinite(n) || n <= 0) return
    const entry: ExpenseEntry = { id: `${Date.now()}`, category, amountEur: n, note }
    persist({ ...log, expenses: [...log.expenses, entry] })
    setAmount('')
    setNote('')
  }

  function removeExpense(id: string) {
    persist({ ...log, expenses: log.expenses.filter((e) => e.id !== id) })
  }

  const waterWp = stage.waypoints.find((w) => w.kind === 'WATER')
  const todayTotal = log.expenses.reduce((a, e) => a + e.amountEur, 0)

  // 마운트 전(서버 렌더 시점)에는 localStorage를 모른다 — 하이드레이션 불일치를 피하려고
  // 빈 상태로 렌더하고, 로드가 끝나면 실제 체크 상태로 바뀐다.
  const amChecked = mounted ? log.amChecked : []
  const pmChecked = mounted ? log.pmChecked : []

  return (
    <details className="mt-3 border-t border-stone pt-3">
      <summary className="min-h-11 cursor-pointer list-none text-[15px] font-medium text-ink underline-offset-2 marker:content-none hover:underline">
        오늘 체크리스트
      </summary>

      <p className="mt-2 text-[13px] text-muted">
        여기 체크·기록은 <b>이 기기·이 브라우저에만</b> 저장됩니다. 서버로 보내지 않으며, 다른 기기로 바꾸거나
        브라우저 데이터를 지우면 사라집니다.
      </p>

      <div className="mt-3">
        <div className="mb-1.5 text-[13px] font-medium tracking-wide text-muted">아침</div>
        <div className="space-y-0.5">
          {AM_ITEMS.map((it) => (
            <Checkbox
              key={it.id}
              id={it.id}
              labelKo={it.labelKo}
              checked={amChecked.includes(it.id)}
              onToggle={(id) => toggle('amChecked', id)}
            />
          ))}
          {waterWp && (
            <Checkbox
              id="am-water"
              labelKo={`물 채웠나 — 다음 식수 ${waterWp.km.toFixed(1)}km 지점(${waterWp.labelKo})`}
              checked={amChecked.includes('am-water')}
              onToggle={(id) => toggle('amChecked', id)}
            />
          )}
          {stage.hazards.length > 0 && (
            <Checkbox
              id="am-hazard"
              labelKo={`오늘 위험 구간 ${stage.hazards.length}곳 확인 — 아래 "일자별 상세 보기" 참고`}
              checked={amChecked.includes('am-hazard')}
              onToggle={(id) => toggle('amChecked', id)}
            />
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-[13px] font-medium tracking-wide text-muted">저녁</div>
        <div className="space-y-0.5">
          {PM_ITEMS.map((it) => (
            <Checkbox
              key={it.id}
              id={it.id}
              labelKo={it.labelKo}
              checked={pmChecked.includes(it.id)}
              onToggle={(id) => toggle('pmChecked', id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={`pain-${key}`} className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
          물집·통증 메모 <span className="font-normal">(기록만 됩니다 — 자동으로 일정이 바뀌지 않습니다)</span>
        </label>
        <textarea
          id={`pain-${key}`}
          value={mounted ? log.painNote : ''}
          onChange={(e) => persist({ ...log, painNote: e.target.value })}
          rows={2}
          className="w-full rounded-md border border-stone px-3 py-2 text-[15px]"
          placeholder="예: 오른발 뒤꿈치 물집"
        />
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[13px] font-medium tracking-wide text-muted">오늘 지출</span>
          {todayTotal > 0 && (
            <span className="font-mono text-[15px] font-semibold tabular-nums text-text">
              €{todayTotal.toFixed(0)}
            </span>
          )}
        </div>

        {mounted && log.expenses.length > 0 && (
          <ul className="mb-2 space-y-1">
            {log.expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 text-[15px] text-text">
                <span>
                  {EXPENSE_CATEGORY_LABEL[e.category]}
                  {e.note && ` · ${e.note}`}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-muted">€{e.amountEur}</span>
                  <button
                    type="button"
                    onClick={() => removeExpense(e.id)}
                    aria-label="삭제"
                    className="min-h-8 min-w-8 text-muted hover:text-vino"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="h-11 rounded-md border border-stone px-2 text-[15px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="€"
            className="h-11 w-24 rounded-md border border-stone px-3 text-[15px] tabular-nums"
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모(선택)"
            className="h-11 min-w-0 flex-1 rounded-md border border-stone px-3 text-[15px]"
          />
          <button
            type="button"
            onClick={addExpense}
            className="min-h-11 rounded-md bg-ink px-4 py-2 text-[15px] font-medium text-white"
          >
            추가
          </button>
        </div>
      </div>
    </details>
  )
}

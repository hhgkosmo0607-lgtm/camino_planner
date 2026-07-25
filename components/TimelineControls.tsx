'use client'

/** TimelineControls.tsx — 출발일 입력. URL 갱신, JS 꺼도 form GET. */

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

export function TimelineControls({ startDate }: { startDate: string }) {
  const router = useRouter()
  function apply(form: HTMLFormElement) {
    const data = new FormData(form)
    const p = new URLSearchParams()
    for (const [k, v] of data.entries()) {
      const s = String(v)
      if (s !== '') p.set(k, s)
    }
    router.replace(`/tools/timeline?${p.toString()}`, { scroll: false })
  }
  return (
    <form
      method="get"
      action="/tools/timeline"
      onChange={(e: FormEvent<HTMLFormElement>) => apply(e.currentTarget)}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        apply(e.currentTarget)
      }}
      className="no-print rounded-lg border border-stone bg-white p-4"
    >
      <label htmlFor="sd" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
        출발일
      </label>
      <input
        id="sd"
        type="date"
        name="sd"
        defaultValue={startDate}
        className="h-11 rounded-md border border-stone px-3 text-[17px] tabular-nums"
      />
      <noscript>
        <button type="submit" className="ml-2 min-h-11 rounded-md bg-ink px-4 py-2 text-[15px] font-medium text-white">
          적용
        </button>
      </noscript>
    </form>
  )
}

'use client'

/**
 * LuggageControls.tsx — 짐배송 비용 비교(F-05) 입력. URL 갱신(규칙 8), JS 꺼도 form GET 동작.
 */

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

interface Props {
  days: number
  hardDays: number
}

export function LuggageControls(props: Props) {
  const router = useRouter()
  function apply(form: HTMLFormElement) {
    const data = new FormData(form)
    const p = new URLSearchParams()
    for (const [k, v] of data.entries()) {
      const s = String(v)
      if (s !== '') p.set(k, s)
    }
    router.replace(`/tools/luggage?${p.toString()}`, { scroll: false })
  }
  const onChange = (e: FormEvent<HTMLFormElement>) => apply(e.currentTarget)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    apply(e.currentTarget)
  }

  return (
    <form
      method="get"
      action="/tools/luggage"
      onChange={onChange}
      onSubmit={onSubmit}
      className="space-y-5 rounded-lg border border-stone bg-white p-4"
    >
      <div>
        <label htmlFor="days" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
          도보 일수
        </label>
        <input
          id="days"
          type="number"
          name="days"
          min={1}
          max={90}
          defaultValue={props.days}
          className="h-11 w-24 rounded-md border border-stone px-3 text-[17px] tabular-nums"
        />
      </div>

      <div>
        <label htmlFor="hardDays" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
          그중 힘든 날(오르막·내리막이 큰 날) 며칠 정도로 볼지
        </label>
        <input
          id="hardDays"
          type="number"
          name="hardDays"
          min={0}
          max={props.days}
          defaultValue={props.hardDays}
          className="h-11 w-24 rounded-md border border-stone px-3 text-[17px] tabular-nums"
        />
        <p className="mt-1 text-[13px] text-muted">
          참고: 대표적인 큰 오르막은 피레네·폰세바돈·오 세브레이로 3곳. 급내리막까지 포함하면
          보통 5일 안팎으로 봅니다 — 직접 조정하세요.
        </p>
      </div>

      <noscript>
        <button type="submit" className="min-h-11 rounded-md bg-ink px-5 py-2 text-[15px] font-medium text-white">
          계산
        </button>
      </noscript>
    </form>
  )
}

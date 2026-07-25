'use client'

/**
 * CostControls.tsx — 비용 계산기 입력. URL 갱신(규칙 8), JS 꺼도 form GET 동작.
 */

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

interface Props {
  days: number
  pub: number // 공립 알베르게 비율 %
  eat: number // 외식 비율 %
  gear: boolean // 장비 신규 구입
}

export function CostControls(props: Props) {
  const router = useRouter()
  function apply(form: HTMLFormElement) {
    const data = new FormData(form)
    const p = new URLSearchParams()
    for (const [k, v] of data.entries()) {
      const s = String(v)
      if (s !== '') p.set(k, s)
    }
    router.replace(`/tools/cost?${p.toString()}`, { scroll: false })
  }
  const onChange = (e: FormEvent<HTMLFormElement>) => apply(e.currentTarget)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    apply(e.currentTarget)
  }

  return (
    <form
      method="get"
      action="/tools/cost"
      onChange={onChange}
      onSubmit={onSubmit}
      className="space-y-5 rounded-lg border border-stone bg-white p-4"
    >
      <div>
        <label htmlFor="days" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
          여행 일수
        </label>
        <input
          id="days"
          type="number"
          name="days"
          min={5}
          max={90}
          defaultValue={props.days}
          className="h-11 w-24 rounded-md border border-stone px-3 text-[17px] tabular-nums"
        />
      </div>

      <Slider
        id="pub"
        name="pub"
        label="공립 알베르게 비율"
        value={props.pub}
        left="전부 사립"
        right="전부 공립"
        suffix="%"
      />
      <Slider
        id="eat"
        name="eat"
        label="외식 비율"
        value={props.eat}
        left="직접 요리"
        right="자주 외식"
        suffix="%"
      />

      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px]">
        <input type="checkbox" name="gear" value="1" defaultChecked={props.gear} className="h-5 w-5 accent-ink" />
        등산화·배낭 등 장비를 새로 구입
      </label>

      <noscript>
        <button type="submit" className="min-h-11 rounded-md bg-ink px-5 py-2 text-[15px] font-medium text-white">
          계산
        </button>
      </noscript>
    </form>
  )
}

function Slider({
  id,
  name,
  label,
  value,
  left,
  right,
  suffix,
}: {
  id: string
  name: string
  label: string
  value: number
  left: string
  right: string
  suffix: string
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-medium tracking-wide text-muted">
          {label}
        </label>
        <span className="font-mono text-lg font-semibold tabular-nums text-text">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        name={name}
        min={0}
        max={100}
        step={10}
        defaultValue={value}
        className="h-11 w-full accent-ink"
      />
      <div className="flex justify-between text-[12px] text-muted">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  )
}

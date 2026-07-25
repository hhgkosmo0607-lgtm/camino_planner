'use client'

/**
 * PlanControls.tsx — 계획 입력 컨트롤.
 *
 * ★ URL이 진실의 원천 (규칙 8). 값이 바뀌면 router.replace 로 URL만 갱신하고,
 *   계산은 서버 컴포넌트(app/plan/page.tsx)가 새 searchParams로 다시 한다.
 *   여기서 계산하지 않는다 (규칙 7).
 * ★ JS를 꺼도 동작한다: <form method="get">라서 "적용" 버튼으로 제출하면
 *   같은 쿼리스트링으로 서버 렌더된다. JS가 있으면 onChange로 즉시 갱신.
 * ★ localStorage 쓰지 않는다.
 */

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

interface Props {
  startTownId: string
  mode: 'km' | 'days'
  dailyKm: number
  totalDays: number
  fitness: 'low' | 'normal' | 'high'
  restDays: number
  skipMeseta: boolean
  startDate?: string
}

const STARTS = [
  { id: 'saint-jean-pied-de-port', ko: '생장 전 구간', sub: '773km' },
  { id: 'leon', ko: '레온부터', sub: '308km' },
  { id: 'sarria', ko: '사리아 100km', sub: '114km' },
]
const FITNESS = [
  { id: 'low', ko: '천천히' },
  { id: 'normal', ko: '보통' },
  { id: 'high', ko: '빠르게' },
]

export function PlanControls(props: Props) {
  const router = useRouter()

  function submitForm(form: HTMLFormElement) {
    const data = new FormData(form)
    const params = new URLSearchParams()
    for (const [k, v] of data.entries()) {
      const s = String(v)
      if (s !== '') params.set(k, s)
    }
    router.replace(`/plan?${params.toString()}`, { scroll: false })
  }

  const onChange = (e: FormEvent<HTMLFormElement>) => submitForm(e.currentTarget)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submitForm(e.currentTarget)
  }

  return (
    <form
      method="get"
      action="/plan"
      onChange={onChange}
      onSubmit={onSubmit}
      className="space-y-5 rounded-lg border border-stone bg-white p-4"
    >
      {/* 출발지 (루트 칩 3개) */}
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium tracking-wide text-muted">출발지</legend>
        <div className="flex flex-wrap gap-2">
          {STARTS.map((s) => (
            <label
              key={s.id}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-stone px-4 py-2 text-[15px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input
                type="radio"
                name="start"
                value={s.id}
                defaultChecked={props.startTownId === s.id}
                className="sr-only"
              />
              <span>{s.ko}</span>
              <span className="font-mono text-[12px] tabular-nums opacity-65">{s.sub}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 입력 모드 */}
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium tracking-wide text-muted">정하는 방식</legend>
        <div className="flex gap-2">
          {[
            { id: 'km', ko: '하루 몇 km' },
            { id: 'days', ko: '며칠에 걸을까' },
          ].map((m) => (
            <label
              key={m.id}
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md border border-stone px-3 py-2 text-[15px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input
                type="radio"
                name="mode"
                value={m.id}
                defaultChecked={props.mode === m.id}
                className="sr-only"
              />
              {m.ko}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 하루 km 슬라이더 */}
      {props.mode === 'km' ? (
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor="d" className="text-[13px] font-medium tracking-wide text-muted">
              하루 목표 거리
            </label>
            <span className="font-mono text-xl font-semibold tabular-nums text-text">
              {props.dailyKm}
              <span className="ml-0.5 text-[13px] font-normal text-muted">km</span>
            </span>
          </div>
          <input
            id="d"
            type="range"
            name="d"
            min={14}
            max={32}
            step={1}
            defaultValue={props.dailyKm}
            className="h-11 w-full accent-ink"
          />
          <div className="flex justify-between font-mono text-[12px] tabular-nums text-muted">
            <span>천천히 14</span>
            <span>빠르게 32</span>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="days" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
            총 며칠 (휴식일 포함)
          </label>
          <input
            id="days"
            type="number"
            name="days"
            min={5}
            max={90}
            defaultValue={props.totalDays}
            className="h-11 w-28 rounded-md border border-stone px-3 text-[17px] tabular-nums"
          />
        </div>
      )}

      {/* 체력 */}
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium tracking-wide text-muted">체력</legend>
        <div className="flex gap-2">
          {FITNESS.map((f) => (
            <label
              key={f.id}
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md border border-stone px-3 py-2 text-[15px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input
                type="radio"
                name="f"
                value={f.id}
                defaultChecked={props.fitness === f.id}
                className="sr-only"
              />
              {f.ko}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 휴식일 + 메세타 버스 */}
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <label htmlFor="rest" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
            휴식일
          </label>
          <input
            id="rest"
            type="number"
            name="rest"
            min={0}
            max={10}
            defaultValue={props.restDays}
            className="h-11 w-20 rounded-md border border-stone px-3 text-[17px] tabular-nums"
          />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px]">
          <input
            type="checkbox"
            name="skip"
            value="burgos~leon"
            defaultChecked={props.skipMeseta}
            className="h-5 w-5 accent-ink"
          />
          메세타(부르고스→레온) 버스로 건너뛰기
        </label>
      </div>

      {/* 출발일 (선택) — 인쇄 일정표의 날짜 계산에 쓰인다 */}
      <div>
        <label htmlFor="sd" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
          출발일 <span className="font-normal">(선택)</span>
        </label>
        <input
          id="sd"
          type="date"
          name="sd"
          defaultValue={props.startDate ?? ''}
          className="h-11 rounded-md border border-stone px-3 text-[17px] tabular-nums"
        />
      </div>

      {/* JS 꺼짐 대비 제출 버튼 */}
      <noscript>
        <button
          type="submit"
          className="min-h-11 rounded-md bg-ink px-5 py-2 text-[15px] font-medium text-white"
        >
          적용
        </button>
      </noscript>
    </form>
  )
}

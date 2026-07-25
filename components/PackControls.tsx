'use client'

/**
 * PackControls.tsx — 배낭 무게 계산기 입력.
 * ★ 체중은 선택 사항(민감 정보 강제 금지, 규칙 8). 미입력이면 기본 7kg 기준.
 */

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

interface Props {
  weight: string // 빈 문자열 가능(선택)
  season: 'spring' | 'summer' | 'winter'
  transfer: boolean
}

const SEASONS = [
  { id: 'spring', ko: '봄·가을' },
  { id: 'summer', ko: '여름' },
  { id: 'winter', ko: '겨울' },
]

export function PackControls(props: Props) {
  const router = useRouter()
  function apply(form: HTMLFormElement) {
    const data = new FormData(form)
    const p = new URLSearchParams()
    for (const [k, v] of data.entries()) {
      const s = String(v)
      if (s !== '') p.set(k, s)
    }
    router.replace(`/tools/pack?${p.toString()}`, { scroll: false })
  }
  const onChange = (e: FormEvent<HTMLFormElement>) => apply(e.currentTarget)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    apply(e.currentTarget)
  }

  return (
    <form
      method="get"
      action="/tools/pack"
      onChange={onChange}
      onSubmit={onSubmit}
      className="space-y-5 rounded-lg border border-stone bg-white p-4"
    >
      <div>
        <label htmlFor="w" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
          체중 <span className="font-normal">(선택 — 안 넣어도 됩니다)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id="w"
            type="number"
            name="w"
            min={30}
            max={150}
            defaultValue={props.weight}
            placeholder="미입력 시 7kg 기준"
            className="h-11 w-44 rounded-md border border-stone px-3 text-[17px] tabular-nums"
          />
          <span className="text-[15px] text-muted">kg</span>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-medium tracking-wide text-muted">계절</legend>
        <div className="flex gap-2">
          {SEASONS.map((s) => (
            <label
              key={s.id}
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md border border-stone px-3 py-2 text-[15px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input
                type="radio"
                name="season"
                value={s.id}
                defaultChecked={props.season === s.id}
                className="sr-only"
              />
              {s.ko}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px]">
        <input
          type="checkbox"
          name="transfer"
          value="1"
          defaultChecked={props.transfer}
          className="h-5 w-5 accent-ink"
        />
        짐 배송 서비스를 이용 (주 배낭은 다음 마을로 보냄)
      </label>

      <noscript>
        <button type="submit" className="min-h-11 rounded-md bg-ink px-5 py-2 text-[15px] font-medium text-white">
          계산
        </button>
      </noscript>
    </form>
  )
}

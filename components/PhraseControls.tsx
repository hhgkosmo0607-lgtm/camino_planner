'use client'

/**
 * PhraseControls.tsx — F-04 예약 스크립트 생성기 입력.
 * ★ 상황에 따라 필요한 입력만 보인다(인원·시각·이름은 전부 선택 아님/선택 혼재).
 */

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { PHRASE_SITUATIONS, type PhraseSituationId } from '@/lib/phrasebook'

interface Props {
  situation: PhraseSituationId
  people: string
  hour: string
  name: string
}

export function PhraseControls(props: Props) {
  const router = useRouter()
  const current = PHRASE_SITUATIONS.find((s) => s.id === props.situation) ?? PHRASE_SITUATIONS[0]

  function apply(form: HTMLFormElement) {
    const data = new FormData(form)
    const p = new URLSearchParams()
    for (const [k, v] of data.entries()) {
      const s = String(v)
      if (s !== '') p.set(k, s)
    }
    router.replace(`/tools/phrases?${p.toString()}`, { scroll: false })
  }
  const onChange = (e: FormEvent<HTMLFormElement>) => apply(e.currentTarget)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    apply(e.currentTarget)
  }

  return (
    <form
      method="get"
      action="/tools/phrases"
      onChange={onChange}
      onSubmit={onSubmit}
      className="space-y-5 rounded-lg border border-stone bg-white p-4"
    >
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium tracking-wide text-muted">상황</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PHRASE_SITUATIONS.map((s) => (
            <label
              key={s.id}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-stone px-2 py-2 text-center text-[14px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input
                type="radio"
                name="situation"
                value={s.id}
                defaultChecked={props.situation === s.id}
                className="sr-only"
              />
              {s.labelKo}
            </label>
          ))}
        </div>
      </fieldset>

      {current.needsPeople && (
        <div>
          <label htmlFor="people" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
            인원
          </label>
          <input
            id="people"
            type="number"
            name="people"
            min={1}
            max={9}
            defaultValue={props.people}
            className="h-11 w-24 rounded-md border border-stone px-3 text-[17px] tabular-nums"
          />
          <span className="ml-2 text-[15px] text-muted">명</span>
        </div>
      )}

      {current.needsTime && (
        <div>
          <label htmlFor="hour" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
            도착 예정 시각 (24시간제)
          </label>
          <input
            id="hour"
            type="number"
            name="hour"
            min={0}
            max={23}
            defaultValue={props.hour}
            className="h-11 w-24 rounded-md border border-stone px-3 text-[17px] tabular-nums"
          />
          <span className="ml-2 text-[15px] text-muted">시</span>
        </div>
      )}

      {current.needsName && (
        <div>
          <label htmlFor="name" className="mb-1 block text-[13px] font-medium tracking-wide text-muted">
            이름 <span className="font-normal">(선택 — 안 넣어도 됩니다)</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            defaultValue={props.name}
            placeholder="예: Kim"
            className="h-11 w-56 rounded-md border border-stone px-3 text-[17px]"
          />
        </div>
      )}

      <noscript>
        <button type="submit" className="min-h-11 rounded-md bg-ink px-5 py-2 text-[15px] font-medium text-white">
          생성
        </button>
      </noscript>
    </form>
  )
}

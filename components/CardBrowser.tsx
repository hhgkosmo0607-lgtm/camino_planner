'use client'

/**
 * CardBrowser.tsx — F-12 보여주기 카드. 상대에게 화면을 보여주고, 상대가 버튼을
 * 누르면 한국어 결과가 뜬다(양방향, 03문서 3부 2장).
 *
 * ★ 흐름형 분기(B1/B7의 GOTO_CARD)는 아직 없다 — 지금은 카드마다 첫 스텝만 쓴다.
 * ★ steps가 비어 있으면(A축 일부 의료 카드) 이유(blockedReasonKo)만 보여준다 —
 *   지어내지 않는다(규칙 1·11).
 * ★ steps는 있는데 blockedReasonKo도 있으면(A축 대부분, 2026-08-03~) "자문
 *   검수 대기 중" 초안이라는 뜻 — 내용은 채웠지만 검수 전이라는 경고 배너를
 *   같이 보여준다. 완전히 막힌 것과 "초안, 검수 대기"를 화면에서도 구분한다.
 * ★ 서버로 아무것도 보내지 않는다. 탭 결과는 이 화면 안에서만 잠깐 보이는
 *   상태라 저장하지 않는다(개인 기록이 아니라서 localStorage 대상도 아니다).
 */

import { useState } from 'react'
import type { Card } from '@/lib/schema'

function CardView({ card }: { card: Card }) {
  const [resultKo, setResultKo] = useState<string | null>(null)

  if (card.steps.length === 0) {
    return <p className="text-[15px] text-muted">☁ {card.blockedReasonKo}</p>
  }

  const step = card.steps[0]
  return (
    <div>
      {card.blockedReasonKo && (
        <p className="mb-3 rounded-md bg-vino/10 px-3 py-2 text-[13px] font-medium text-vino">
          ⚠ {card.blockedReasonKo}
        </p>
      )}
      <p className="text-[22px] font-medium leading-snug text-text">{step.promptEs}</p>
      <p className="mt-1 text-[13px] text-muted">{step.promptKo}</p>
      <p className="mt-3 text-[13px] text-muted">↓ Por favor, señale su respuesta</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {step.options.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setResultKo(o.labelKo)}
            aria-pressed={resultKo === o.labelKo}
            className={
              'min-h-11 rounded-md border px-3 py-2 text-[15px] transition-colors ' +
              (resultKo === o.labelKo ? 'border-ink bg-ink text-white' : 'border-ink text-text hover:bg-ink/5')
            }
          >
            {o.labelEs}
          </button>
        ))}
      </div>
      {resultKo && (
        <div className="mt-3 rounded-md bg-moss/10 px-3 py-2 text-[17px] font-medium text-moss">{resultKo}</div>
      )}
    </div>
  )
}

export function CardBrowser({ cards }: { cards: Card[] }) {
  return (
    <div className="space-y-2">
      {cards.map((c) => (
        <details key={c.id} className="rounded-lg border border-stone bg-white px-4 py-3">
          <summary className="min-h-11 cursor-pointer list-none text-[15px] font-medium text-ink marker:content-none">
            <span className="mr-2 inline-block rounded bg-granite px-1.5 py-0.5 text-[12px] font-medium text-muted">
              {c.id}
            </span>
            {c.titleKo}
          </summary>
          <div className="mt-3 border-t border-stone pt-3">
            <CardView card={c} />
          </div>
        </details>
      ))}
    </div>
  )
}

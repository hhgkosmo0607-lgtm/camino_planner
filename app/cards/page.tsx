/**
 * app/cards/page.tsx — 보여주기 카드 (F-12 구조만, 2026-07-31).
 *
 * ★ CLAUDE.md 메뉴 명칭표: "카드"는 번역하지 않고 그대로 쓰는 독립 메뉴다.
 * ★ B(숙소 9)·C(이동·기타 6) 15장은 실제 내용까지 채웠다. A(부상 8)는 규칙 11
 *   (의료 자문 검수 전 금지)에 걸려 카드 껍데기만 있고 내용은 비어 있다 —
 *   화면에도 그대로 밝힌다(규칙 1).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { CardBrowser } from '@/components/CardBrowser'
import { cards } from '@/data/cards'
import type { CardCategory } from '@/lib/schema'

export const metadata: Metadata = {
  title: '보여주기 카드 · 화면 하나로 대화 없이 통하는 카미노 회화',
  description:
    '알베르게·이동 중 자주 겪는 상황을 화면 하나로 해결합니다. 상대가 버튼을 짚으면 한국어로 답이 뜹니다.',
  alternates: { canonical: '/cards' },
}

const CATEGORY_LABEL: Record<CardCategory, string> = {
  BED: '숙소',
  INJURY: '부상',
  TRANSPORT_ETC: '이동·기타',
}

const CATEGORY_ORDER: CardCategory[] = ['BED', 'INJURY', 'TRANSPORT_ETC']

export default function CardsPage() {
  const readyCount = cards.filter((c) => c.steps.length > 0).length

  return (
    <main className="min-h-screen bg-granite pb-16">
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">카드</h1>
          <p className="mt-1 text-[17px] text-white/70">
            화면을 상대에게 보여주면, 상대가 버튼을 짚어 한국어로 답이 뜹니다. 번역기보다 빠릅니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-lg border border-stone bg-white/60 px-4 py-3 text-[15px] text-muted">
          전체 23장 중 {readyCount}장을 지금 쓸 수 있습니다. 부상(A) 카드는 정형외과·스포츠의학 자문 검수 전까지
          내용을 비워뒀습니다 — 구조만 먼저 만들었습니다.
        </section>

        {CATEGORY_ORDER.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 font-display text-lg text-text">{CATEGORY_LABEL[cat]}</h2>
            <CardBrowser cards={cards.filter((c) => c.category === cat)} />
          </section>
        ))}

        <div className="text-[15px] text-muted">
          <Link href="/tools/phrases" className="mr-4 underline-offset-2 hover:underline">
            예약 문장 생성기 →
          </Link>
          <Link href="/plan" className="underline-offset-2 hover:underline">
            일정으로 돌아가기 →
          </Link>
        </div>
      </div>
    </main>
  )
}

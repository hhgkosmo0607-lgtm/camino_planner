/**
 * app/tools/phrases/page.tsx — 전화·WhatsApp 예약 스크립트 생성기 (F-04, 무료 도구).
 *
 * ★ 언어 장벽 때문에 예약 가능한 사립 숙소를 두고 선착순 공립에 줄 서는 문제를 직접 해결.
 * ★ 서버 렌더(규칙 7) + 상태는 URL 쿼리스트링(규칙 8). 계산은 lib/phrasebook.ts(순수 함수).
 * ★ 규칙 11: 약국·응급 문장은 "도움·추천 요청"까지만 — 처치·약은 지정하지 않는다.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ToolNav } from '@/components/ToolNav'
import { Track } from '@/components/Track'
import { CopyButton } from '@/components/CopyButton'
import { PhraseControls } from '@/components/PhraseControls'
import { buildPhrase, PHRASE_SITUATIONS, type PhraseSituationId } from '@/lib/phrasebook'

export const metadata: Metadata = {
  title: '카미노 스페인어 예약 문장 생성기 · 전화·WhatsApp',
  description:
    '알베르게 전화·WhatsApp 예약, 약국·빈대·응급 상황에 쓸 스페인어 문장을 한글 발음·뜻과 함께 바로 만듭니다.',
  alternates: { canonical: '/tools/phrases' },
}

type SP = Promise<Record<string, string | string[] | undefined>>

function isSituation(v: string | undefined): v is PhraseSituationId {
  return PHRASE_SITUATIONS.some((s) => s.id === v)
}

export default async function PhrasesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const situation: PhraseSituationId = isSituation(sp.situation as string) ? (sp.situation as PhraseSituationId) : 'albergue_call'

  const peopleRaw = typeof sp.people === 'string' ? parseInt(sp.people, 10) : NaN
  const people = Number.isFinite(peopleRaw) ? peopleRaw : 2

  const hourRaw = typeof sp.hour === 'string' ? parseInt(sp.hour, 10) : NaN
  const hour = Number.isFinite(hourRaw) ? hourRaw : 15

  const name = typeof sp.name === 'string' ? sp.name : ''

  const lines = buildPhrase(situation, { people, hour, name })
  const copyText = lines.map((l) => l.es).join(' ')

  return (
    <main className="min-h-screen bg-granite pb-16">
      <Track event="tool_used" data={{ tool: 'phrases' }} />
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">예약 문장 생성기</h1>
          <p className="mt-1 text-[17px] text-white/70">
            전화 한 통이면 되는데 스페인어를 몰라서 못 거는 문제, 여기서 풉니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <ToolNav current="/tools/phrases" />
        <PhraseControls
          situation={situation}
          people={String(people)}
          hour={String(hour)}
          name={name}
        />

        <section className="rounded-lg border border-stone bg-white px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-text">문장</h2>
            <CopyButton text={copyText} />
          </div>
          <ol className="space-y-3">
            {lines.map((l, i) => (
              <li key={i} className="border-t border-stone pt-3 first:border-t-0 first:pt-0">
                <div className="text-[18px] font-medium leading-relaxed text-text">{l.es}</div>
                <div className="mt-0.5 font-mono text-[15px] tabular-nums text-muted">{l.ko}</div>
                <div className="mt-0.5 text-[15px] text-muted">{l.meaning}</div>
              </li>
            ))}
          </ol>
        </section>

        {(situation === 'pharmacy' || situation === 'emergency' || situation === 'bedbug') && (
          <section className="rounded-lg border border-stone bg-white/60 px-4 py-3 text-[15px] leading-relaxed text-muted">
            이 문장은 도움·추천을 요청하는 데까지만 안내합니다. 처치·복용 방법은 현지 약사·의료진의
            안내를 따르세요.
          </section>
        )}

        <div className="text-[15px] text-muted">
          <Link href="/tools/access" className="mr-4 underline-offset-2 hover:underline">
            접근 교통 →
          </Link>
          <Link href="/plan" className="underline-offset-2 hover:underline">
            일정 만들기 →
          </Link>
        </div>
      </div>
    </main>
  )
}

/**
 * app/tools/timeline/page.tsx — 준비 타임라인 (무료 도구, F-08).
 *
 * 출발일 입력 → D-90 역산 체크리스트. 각 항목에 관련 페이지 링크. 인쇄 가능.
 * ★ 의료 정보는 넣지 않는다(규칙 11): 상비약은 "준비" 리마인더만, 약품명·처치법 없음.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { TimelineControls } from '@/components/TimelineControls'
import { ToolNav } from '@/components/ToolNav'
import { PrintButton } from '@/components/PrintButton'

export const metadata: Metadata = {
  title: '카미노 준비 타임라인 · 출발일 D-90 역산 체크리스트',
  description:
    '출발일만 넣으면 D-90부터 D-1까지 순례길 준비 체크리스트를 날짜와 함께 만들어 줍니다. 인쇄 가능, 가입 없이 바로.',
  alternates: { canonical: '/tools/timeline' },
}

type SP = Promise<Record<string, string | string[] | undefined>>

function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s + 'T00:00:00Z')
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

interface Item {
  ko: string
  href?: string
}
const MILESTONES: { d: number; items: Item[] }[] = [
  { d: 90, items: [{ ko: '어느 길을 며칠에 걸을지 결정', href: '/plan' }, { ko: '항공권 예약' }, { ko: '여권 유효기간 확인 (잔여 6개월 이상)' }] },
  { d: 60, items: [{ ko: '순례자 여권(크레덴시알) 준비' }, { ko: '여행자 보험 가입', href: '/tools/cost' }, { ko: '등산화 구입 후 길들이기 시작' }] },
  { d: 30, items: [{ ko: '배낭·침낭 준비', href: '/tools/pack' }, { ko: '체력 훈련 시작' }, { ko: '개인 상비약 준비' }] },
  { d: 14, items: [{ ko: '배낭 무게 최종 점검', href: '/tools/pack' }, { ko: '유심·eSIM 준비' }, { ko: '유로 환전', href: '/tools/cost' }] },
  { d: 7, items: [{ ko: '첫날 숙소 예약' }, { ko: '공항 이동편 확인' }, { ko: '가족 비상 연락 체계' }] },
  { d: 1, items: [{ ko: '짐 최종 점검' }] },
]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
function dateMinus(startDate: string, days: number): string {
  const d = new Date(startDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${d.getUTCDate()} (${WEEKDAYS[d.getUTCDay()]})`
}

export default async function TimelinePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const sd = typeof sp.sd === 'string' && isIsoDate(sp.sd) ? sp.sd : ''

  return (
    <main className="min-h-screen bg-granite pb-16">
      <div className="no-print bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">준비 타임라인</h1>
          <p className="mt-1 text-[15px] text-white/70">
            출발일만 넣으면 언제 뭘 해야 하는지 날짜로 정리해 드립니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="no-print space-y-4">
          <ToolNav current="/tools/timeline" />
          <TimelineControls startDate={sd} />
        </div>

        {sd && (
          <div className="print-sheet flex items-baseline justify-between">
            <h2 className="font-display text-lg text-text">
              출발 {dateMinus(sd, 0)} 기준
            </h2>
            <PrintButton />
          </div>
        )}

        <ol className="space-y-3">
          {MILESTONES.map((m) => (
            <li key={m.d} className="print-row rounded-lg border border-stone bg-white px-4 py-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-lg font-semibold tabular-nums text-text">D-{m.d}</span>
                {sd && (
                  <span className="font-mono text-[14px] tabular-nums text-muted">
                    {dateMinus(sd, m.d)}
                  </span>
                )}
              </div>
              <ul className="mt-2 space-y-1.5">
                {m.items.map((it) => (
                  <li key={it.ko} className="flex items-start gap-2 text-[15px] text-text">
                    <span aria-hidden className="mt-0.5 text-muted">☐</span>
                    {it.href ? (
                      <Link href={it.href} className="underline-offset-2 hover:underline">
                        {it.ko}
                      </Link>
                    ) : (
                      <span>{it.ko}</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="text-[13px] text-muted">
          ※ 크레덴시알은 국내 협회에서도 받을 수 있지만 생장 현지 발급이 일반적입니다. 개인 상비약의
          구체적 품목은 의료 전문가와 상담하세요 — 본 서비스는 의료 정보를 제공하지 않습니다.
        </p>

        <div className="no-print text-[15px] text-muted">
          <Link href="/tools/cost" className="mr-4 underline-offset-2 hover:underline">
            비용 계산기 →
          </Link>
          <Link href="/plan" className="underline-offset-2 hover:underline">
            일정 만들기 →
          </Link>
        </div>
      </div>
    </main>
  )
}

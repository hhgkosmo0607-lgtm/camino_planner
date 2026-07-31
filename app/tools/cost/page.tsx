/**
 * app/tools/cost/page.tsx — 카미노 비용 계산기 (무료 도구).
 *
 * ★ 단일 숫자가 아니라 범위로 낸다("약 380만~450만 원"). 불확실성을 정직하게 전달.
 * ★ 서버에서 계산(규칙 7), 상태는 URL(규칙 8). 가입·이메일 없이 즉시 사용.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { CostControls } from '@/components/CostControls'
import { ToolNav } from '@/components/ToolNav'
import { Track } from '@/components/Track'
import { estimateTripCostManwon, EUR_KRW } from '@/lib/cost'

export const metadata: Metadata = {
  title: '카미노 순례길 비용 계산기 · 항공·숙박·식비 예산',
  description:
    '일수와 숙소 유형, 외식 비율로 산티아고 순례길 총비용을 범위로 계산합니다. 가입 없이 바로, 결과는 링크로 공유.',
  alternates: { canonical: '/tools/cost' },
}

type SP = Promise<Record<string, string | string[] | undefined>>
const num = (v: string | string[] | undefined, d: number, lo: number, hi: number) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : NaN
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d
}

const man = (n: number) => `${n.toLocaleString('ko-KR')}만`

export default async function CostPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const days = num(sp.days, 34, 5, 90)
  const pub = num(sp.pub, 50, 0, 100)
  const eat = num(sp.eat, 50, 0, 100)
  const gear = sp.gear === '1'
  const { total, rows } = estimateTripCostManwon(days, pub, eat, gear)

  return (
    <main className="min-h-screen bg-granite pb-16">
      <Track event="tool_used" data={{ tool: 'cost' }} />
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">카미노 비용 계산기</h1>
          <p className="mt-1 text-[17px] text-white/70">
            항공·숙박·식비·장비를 범위로 추정합니다. 가입 없이 바로.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <ToolNav current="/tools/cost" />
        <CostControls days={days} pub={pub} eat={eat} gear={gear} />

        {/* 결과 */}
        <section className="rounded-lg border border-stone bg-white px-5 py-6 text-center">
          <div className="text-[13px] font-medium tracking-wide text-muted">예상 총비용</div>
          <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-text">
            약 {man(total[0])} ~ {man(total[1])} 원
          </div>
          <div className="mt-1 text-[13px] text-muted">{days}일 기준 · 항공 포함</div>
        </section>

        <section className="rounded-lg border border-stone bg-white px-4 py-4">
          <h2 className="mb-3 font-display text-lg text-text">항목별</h2>
          <table className="w-full text-[17px]">
            <tbody>
              {rows.map((r) => (
                <tr key={r.ko} className="border-b border-stone last:border-0">
                  <td className="py-2 text-text">{r.ko}</td>
                  <td className="py-2 text-right font-mono tabular-nums text-muted">
                    {man(r.low)} ~ {man(r.high)} 원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[13px] text-muted">
            ※ 환율(약 {EUR_KRW.toLocaleString('ko-KR')}원/유로)과 개인 소비에 따라 달라집니다. 참고용 범위입니다.
          </p>
        </section>

        <div className="text-[15px] text-muted">
          <Link href="/tools/pack" className="mr-4 underline-offset-2 hover:underline">
            배낭 무게 계산기 →
          </Link>
          <Link href="/plan" className="underline-offset-2 hover:underline">
            일정 만들기 →
          </Link>
        </div>
      </div>
    </main>
  )
}

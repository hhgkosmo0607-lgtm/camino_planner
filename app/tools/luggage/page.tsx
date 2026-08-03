/**
 * app/tools/luggage/page.tsx — 짐배송 비용 비교 (F-05, 무료 도구).
 *
 * ★ "공립 알베르게는 짐 배송을 받지 않는다"(CLAUDE.md 숙소 표) — 배송을 쓰면 그날은
 *   예약 가능한 사립로 숙소가 강제로 바뀐다. 그 숙박비 차액 + 배송비를 더해 총 추가
 *   비용을 범위로 낸다(cost.ts와 같은 패턴: 단일 숫자 대신 범위).
 * ★ 03 문서 F-05 원안의 "부상 위험 점수 62→41→28"은 구현하지 않았다 — 지금 위험
 *   점수 엔진(lib/planner/risk.ts)은 배낭 무게를 반영하지 않고, 반영하려면 의학
 *   근거 없는 새 가중치를 또 만들어야 해서(규칙 11 정신 위반) 보류. 대신 배낭
 *   무게가 무릎·발 부담에 영향을 준다는, 이미 배낭 계산기(F-07)에도 쓴 정성적
 *   설명만 안내한다.
 * ★ 배송비 €5~7/구간은 실제 서비스(Correos·Jacotrans 등) 공개 요금 조사치.
 * ★ 서버에서 계산(규칙 7), 상태는 URL(규칙 8).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { LuggageControls } from '@/components/LuggageControls'
import { ToolNav } from '@/components/ToolNav'
import { Track } from '@/components/Track'
import { RelatedLinks } from '@/components/RelatedLinks'

export const metadata: Metadata = {
  title: '카미노 짐배송 비용 비교 · 배송비 vs 숙박비 차액',
  description:
    '짐배송을 쓰면 그날 숙소가 예약 가능한 사립으로 바뀝니다. 배송비와 숙박비 차액을 더한 총 추가 비용을 범위로 계산합니다.',
  alternates: { canonical: '/tools/luggage' },
}

type SP = Promise<Record<string, string | string[] | undefined>>
const num = (v: string | string[] | undefined, d: number, lo: number, hi: number) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : NaN
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d
}

// 환율은 대략치다(변동). 결과를 범위로 내므로 정밀 환율을 주장하지 않는다.
const EUR_KRW = 1450
const toManwon = (eur: number) => Math.round((eur * EUR_KRW) / 10000)

// 배송비(EUR/구간): Correos·Jacotrans 등 공개 요금 조사치, 비수기엔 더 비싸질 수 있음.
const DELIVERY_EUR: [number, number] = [5, 7]
// 숙박비(EUR/일): 공립 8~10, 사립 12~25 (cost.ts와 같은 조사치)
const PUBLIC_EUR: [number, number] = [8, 10]
const PRIVATE_EUR: [number, number] = [12, 25]

interface Scenario {
  id: 'none' | 'hard' | 'all'
  ko: string
  days: number
}

function computeScenario(s: Scenario) {
  const deliveryLow = s.days * DELIVERY_EUR[0]
  const deliveryHigh = s.days * DELIVERY_EUR[1]
  const lodgeDiffLow = s.days * (PRIVATE_EUR[0] - PUBLIC_EUR[0])
  const lodgeDiffHigh = s.days * (PRIVATE_EUR[1] - PUBLIC_EUR[1])
  return {
    deliveryLow,
    deliveryHigh,
    lodgeDiffLow,
    lodgeDiffHigh,
    totalLow: deliveryLow + Math.max(0, lodgeDiffLow),
    totalHigh: deliveryHigh + Math.max(0, lodgeDiffHigh),
  }
}

const man = (eur: number) => `${toManwon(eur).toLocaleString('ko-KR')}만`

export default async function LuggagePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const days = num(sp.days, 34, 1, 90)
  const hardDays = num(sp.hardDays, Math.min(5, days), 0, days)

  const scenarios: Scenario[] = [
    { id: 'none', ko: '배송 안 함', days: 0 },
    { id: 'hard', ko: '힘든 날만', days: hardDays },
    { id: 'all', ko: '매일', days },
  ]
  const results = scenarios.map((s) => ({ s, r: computeScenario(s) }))

  return (
    <main className="min-h-screen bg-granite pb-16">
      <Track event="tool_used" data={{ tool: 'luggage' }} />
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">짐배송 비용 비교</h1>
          <p className="mt-1 text-[17px] text-white/70">
            공립 알베르게는 짐 배송을 받지 않습니다. 배송을 쓰면 그날은 예약 가능한 사립으로
            숙소가 바뀌어 숙박비도 함께 오릅니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <ToolNav current="/tools/luggage" />
        <LuggageControls days={days} hardDays={hardDays} />

        <section className="overflow-x-auto rounded-lg border border-stone bg-white px-4 py-4">
          <table className="w-full min-w-[480px] text-[16px]">
            <thead>
              <tr className="border-b border-stone text-left text-[13px] font-medium tracking-wide text-muted">
                <th className="py-2 font-medium">항목</th>
                {results.map(({ s }) => (
                  <th key={s.id} className="py-2 text-right font-medium">
                    {s.ko}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone">
                <td className="py-2 text-text">배송비</td>
                {results.map(({ s, r }) => (
                  <td key={s.id} className="py-2 text-right font-mono tabular-nums text-muted">
                    {s.days === 0 ? '0' : `${man(r.deliveryLow)} ~ ${man(r.deliveryHigh)}`}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-stone">
                <td className="py-2 text-text">숙박비 차액</td>
                {results.map(({ s, r }) => (
                  <td key={s.id} className="py-2 text-right font-mono tabular-nums text-muted">
                    {s.days === 0 ? '0' : `+${man(r.lodgeDiffLow)} ~ +${man(r.lodgeDiffHigh)}`}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-stone font-semibold">
                <td className="py-2 text-text">총 추가 비용</td>
                {results.map(({ s, r }) => (
                  <td key={s.id} className="py-2 text-right font-mono tabular-nums text-text">
                    {s.days === 0 ? '0원' : `약 ${man(r.totalLow)} ~ ${man(r.totalHigh)}원`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-text">공립 숙박 가능</td>
                <td className="py-2 text-right text-muted">전부</td>
                <td className="py-2 text-right text-muted">그 외 날은 가능</td>
                <td className="py-2 text-right text-muted">불가</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-[13px] text-muted">
            ※ 배송비 €{DELIVERY_EUR[0]}~{DELIVERY_EUR[1]}/구간, 숙박비 공립 €{PUBLIC_EUR[0]}~
            {PUBLIC_EUR[1]}·사립 €{PRIVATE_EUR[0]}~{PRIVATE_EUR[1]}는 공개 요금 조사치이며 계절·
            업체에 따라 달라집니다. 환율(약 {EUR_KRW.toLocaleString('ko-KR')}원/유로) 변동도
            반영되지 않은 참고용 범위입니다.
          </p>
        </section>

        <section className="rounded-lg border border-stone bg-white/60 px-4 py-3 text-[15px] leading-relaxed text-text">
          짐 없이 걸으면 무릎·발 부담이 줄어듭니다(
          <Link href="/tools/pack" className="underline-offset-2 hover:underline">
            배낭 무게 계산기
          </Link>
          에서도 안내하는 내용입니다). 다만 이게 부상 위험을 수치로 얼마나 낮추는지는 아직 의학
          근거로 검증하지 않아 숫자로 보여드리지 않습니다(CLAUDE.md 규칙 11).
        </section>

        <RelatedLinks
          items={[
            { href: '/tools/pack', labelKo: '배낭 무게 계산기' },
            { href: '/plan', labelKo: '일정 만들기' },
          ]}
        />
      </div>
    </main>
  )
}

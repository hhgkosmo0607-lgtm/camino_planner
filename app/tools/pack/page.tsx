/**
 * app/tools/pack/page.tsx — 배낭 무게 계산기 (무료 도구).
 *
 * ★ 권장 상한 = 체중 × 10% (보통 6~7kg). 체중 미입력 시 7kg 기준(민감 정보 강제 안 함).
 * ★ 서버 계산(규칙 7), 상태 URL(규칙 8).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { PackControls } from '@/components/PackControls'
import { ToolNav } from '@/components/ToolNav'

export const metadata: Metadata = {
  title: '카미노 배낭 무게 계산기 · 체중 10% 기준 짐 목록',
  description:
    '체중과 계절로 순례길 배낭 권장 무게(체중의 10%)와 품목별 목록을 계산합니다. 초과 시 감량 우선순위까지. 가입 없이 바로.',
  alternates: { canonical: '/tools/pack' },
}

type SP = Promise<Record<string, string | string[] | undefined>>
type Season = 'spring' | 'summer' | 'winter'

interface Item {
  ko: string
  kg: number
  trimNote?: string // 감량 우선순위 설명
}

// 계절별 품목 권장 무게(kg). 참고용 표준치.
function itemsFor(season: Season): Item[] {
  const base: Item[] = [
    { ko: '배낭 본체', kg: 1.2 },
    { ko: '침낭', kg: season === 'summer' ? 0.4 : season === 'winter' ? 1.1 : 0.7, trimNote: '계절용 경량 침낭' },
    { ko: '의류(상하의·속옷·양말)', kg: season === 'summer' ? 1.2 : season === 'winter' ? 2.3 : 1.5, trimNote: '빨아 입어 벌 수 줄이기' },
    { ko: '방수·방풍', kg: season === 'winter' ? 0.6 : 0.4 },
    { ko: '세면·위생', kg: 0.5 },
    { ko: '물 1L', kg: 1.0, trimNote: '마을마다 식수 보충 → 항상 가득 안 채우기' },
    { ko: '샌들(숙소용)', kg: 0.3 },
    { ko: '전자기기(보조배터리·충전기)', kg: 0.5, trimNote: '보조배터리 용량 줄이기' },
    { ko: '상비약·기타', kg: 0.4 },
  ]
  if (season === 'winter') base.push({ ko: '방한(장갑·비니·경량패딩)', kg: 0.4 })
  return base
}

const round1 = (n: number) => Math.round(n * 10) / 10

export default async function PackPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const wRaw = typeof sp.w === 'string' ? parseInt(sp.w, 10) : NaN
  const hasWeight = Number.isFinite(wRaw) && wRaw >= 30 && wRaw <= 150
  const weight = hasWeight ? wRaw : null
  const season: Season = sp.season === 'summer' || sp.season === 'winter' ? sp.season : 'spring'
  const transfer = sp.transfer === '1'

  const cap = hasWeight ? round1(weight! * 0.1) : 7.0
  const items = itemsFor(season)
  const total = round1(items.reduce((a, it) => a + it.kg, 0))
  const over = round1(total - cap)

  return (
    <main className="min-h-screen bg-granite pb-16">
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">배낭 무게 계산기</h1>
          <p className="mt-1 text-[15px] text-white/70">
            물집·무릎 부담의 큰 원인은 과한 짐입니다. 체중의 10%가 기준입니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <ToolNav current="/tools/pack" />
        <PackControls weight={hasWeight ? String(weight) : ''} season={season} transfer={transfer} />

        {/* 권장 상한 */}
        <section className="rounded-lg border border-stone bg-white px-5 py-6 text-center">
          <div className="text-[13px] font-medium tracking-wide text-muted">권장 배낭 무게 상한</div>
          <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-text">
            {cap.toFixed(1)}
            <span className="ml-1 text-[15px] font-normal text-muted">kg</span>
          </div>
          <div className="mt-1 text-[13px] text-muted">
            {hasWeight ? `체중 ${weight}kg의 10%` : '체중 미입력 → 7kg 기준(권장 평균)'}
          </div>
        </section>

        {/* 품목 목록 */}
        <section className="rounded-lg border border-stone bg-white px-4 py-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg text-text">권장 품목</h2>
            <span className="font-mono text-[15px] tabular-nums text-muted">
              합계 {total.toFixed(1)}kg
            </span>
          </div>
          <table className="w-full text-[15px]">
            <tbody>
              {items.map((it) => (
                <tr key={it.ko} className="border-b border-stone last:border-0">
                  <td className="py-2 text-text">{it.ko}</td>
                  <td className="py-2 text-right font-mono tabular-nums text-muted">
                    {it.kg.toFixed(1)}kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 판단 */}
        {transfer ? (
          <section className="rounded-lg border border-moss/40 bg-moss/5 px-4 py-4 text-[15px] leading-relaxed text-text">
            <b className="text-moss">짐 배송을 이용하면 매일 메는 무게가 크게 줄어듭니다.</b> 주
            배낭은 다음 마을로 보내고, 물·간식·비옷·귀중품만 든 데이파크(약 3kg)만 메세요. 단,{' '}
            <b>공립 알베르게는 배송 수령이 안 되는 경우가 많으니</b> 그날 숙소가 배송을 받는지 미리
            확인하세요.
          </section>
        ) : over > 0 ? (
          <section className="rounded-lg border border-vino/40 bg-vino/5 px-4 py-4 text-[15px] leading-relaxed text-text">
            <b className="text-vino">권장 상한보다 약 {over.toFixed(1)}kg 무겁습니다.</b> 아래
            순서로 줄여 보세요:
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {items
                .filter((it) => it.trimNote)
                .map((it) => (
                  <li key={it.ko}>
                    <b>{it.ko}</b> — {it.trimNote}
                  </li>
                ))}
            </ol>
          </section>
        ) : (
          <section className="rounded-lg border border-moss/40 bg-moss/5 px-4 py-4 text-[15px] leading-relaxed text-text">
            <b className="text-moss">권장 상한 안에 들어옵니다.</b> 무리 없는 무게입니다. 물은 마을마다
            보충하며 항상 가득 채우지 않는 것만 지키세요.
          </section>
        )}

        <div className="text-[15px] text-muted">
          <Link href="/tools/timeline" className="mr-4 underline-offset-2 hover:underline">
            준비 타임라인 →
          </Link>
          <Link href="/plan" className="underline-offset-2 hover:underline">
            일정 만들기 →
          </Link>
        </div>
      </div>
    </main>
  )
}

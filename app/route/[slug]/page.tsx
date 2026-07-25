/**
 * app/route/[slug]/page.tsx — 루트 3개 SEO 페이지 (정적 생성).
 * Phase 1은 프랑스 길 하나 + 출발점 3가지(전 구간/레온/사리아).
 *
 * schema.org TouristTrip JSON-LD 포함. 하단 일정 계산기 CTA.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ROUTES, getRoute, getTown, remainingKm, TOTAL_KM, SANTIAGO_ID } from '@/lib/geo'
import { towns } from '@/data/towns'
import { Elevation } from '@/components/Elevation'
import { CalculatorCTA } from '@/components/CalculatorCTA'

export function generateStaticParams() {
  return ROUTES.map((r) => ({ slug: r.slug }))
}

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const r = getRoute(slug)
  if (!r) return {}
  const start = getTown(r.startTownId)!
  const dist = remainingKm(start)
  const title = `${r.nameKo} · 산티아고 순례길 ${dist}km ${r.standardDays}일 일정`
  const description = `${r.nameEs} — ${r.summaryKo} 총 ${dist}km, 표준 ${r.standardDays}일. 기간별 추천 일정과 전체 고도 단면을 확인하세요.`
  return { title, description, alternates: { canonical: `/route/${r.slug}` } }
}

export default async function RoutePage({ params }: { params: Params }) {
  const { slug } = await params
  const r = getRoute(slug)
  if (!r) notFound()
  const start = getTown(r.startTownId)!
  const dist = remainingKm(start)

  // 주요 통과 도시 (큰 마을만) + 시작/끝
  const majors = towns.filter(
    (t) => t.km >= start.km && (t.beds >= 200 || t.id === r.startTownId || t.id === SANTIAGO_ID),
  )

  // 기간별 추천 일정 3개 (하루 목표 거리별 → /plan 링크)
  const recos = [
    { ko: '여유롭게', d: 20 },
    { ko: '표준', d: 25 },
    { ko: '빠르게', d: 30 },
  ].map((x) => ({
    ...x,
    days: Math.ceil(dist / x.d),
    href: `/plan?start=${r.startTownId}&d=${x.d}`,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: `${r.nameKo} (${r.nameEs})`,
    description: r.summaryKo,
    touristType: '순례자',
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: majors.length,
      itemListElement: majors.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${t.nameKo} (${t.nameEs})`,
      })),
    },
  }

  return (
    <main className="min-h-screen bg-granite pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-ink px-5 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-3 text-[13px] text-white/60">순례길 루트</nav>
          <h1 className="font-display text-3xl font-bold">{r.nameKo}</h1>
          <p className="mt-1 text-[17px] text-white/75">{r.nameEs}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/80">{r.summaryKo}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[15px] tabular-nums text-white/85">
            <span>총 {dist}km</span>
            <span>표준 {r.standardDays}일</span>
            <span>{start.nameKo} → 산티아고</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* 고도 단면 */}
        <section>
          <h2 className="mb-2 font-display text-lg text-text">전체 고도 단면</h2>
          <div className="rounded-lg border border-stone bg-white p-3">
            <Elevation fromTownId={r.startTownId} toTownId={SANTIAGO_ID} height={150} />
            <div className="mt-2 flex justify-between font-mono text-[12px] tabular-nums text-muted">
              <span>{start.nameKo}</span>
              <span>산티아고 ({TOTAL_KM.toFixed(0)}km)</span>
            </div>
          </div>
        </section>

        {/* 추천 일정 3개 */}
        <section>
          <h2 className="mb-3 font-display text-lg text-text">기간별 추천 일정</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {recos.map((x) => (
              <a
                key={x.d}
                href={x.href}
                className="rounded-lg border border-stone bg-white px-4 py-4 text-center"
              >
                <div className="text-[15px] font-semibold text-text">{x.ko}</div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-text">
                  {x.days}
                  <span className="ml-0.5 text-[13px] font-normal text-muted">일</span>
                </div>
                <div className="font-mono text-[13px] tabular-nums text-muted">하루 {x.d}km</div>
              </a>
            ))}
          </div>
        </section>

        {/* 주요 통과 도시 */}
        <section className="rounded-lg border border-stone bg-white px-4 py-4">
          <h2 className="mb-3 font-display text-lg text-text">주요 통과 도시</h2>
          <ul className="flex flex-wrap gap-2">
            {majors.map((t) => (
              <li key={t.id}>
                <a
                  href={`/town/${t.id}`}
                  className="inline-flex rounded border border-stone px-3 py-1.5 text-[15px] text-text underline-offset-2 hover:underline"
                >
                  {t.nameKo}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <CalculatorCTA href={`/plan?start=${r.startTownId}`} />
      </div>
    </main>
  )
}

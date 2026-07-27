/**
 * app/town/[slug]/page.tsx — 마을 82곳 SEO 페이지 (정적 생성).
 *
 * ★ 서버 렌더, JS 꺼도 본문 보임(규칙 7). generateStaticParams로 사전 생성.
 * ★ 숙소 정보가 없으면 "정보 확인 중"으로 표시. 절대 지어내지 않는다(규칙 1).
 * ★ 마을·구간·루트가 서로 내부 링크로 연결된다.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { towns } from '@/data/towns'
import { getTown, townNeighbors, remainingKm, SERVICE_LABEL } from '@/lib/geo'
import { CalculatorCTA } from '@/components/CalculatorCTA'
import { Track } from '@/components/Track'

export function generateStaticParams() {
  return towns.map((t) => ({ slug: t.id }))
}

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const t = getTown(slug)
  if (!t) return {}
  const title = `${t.nameKo} 순례길 마을 정보 · 산티아고까지 ${remainingKm(t)}km`
  const description = `${t.nameKo}(${t.nameEs}) 해발 ${t.elevation}m, 산티아고까지 ${remainingKm(t)}km. 서비스와 숙소 정보, 이 마을을 지나는 순례 일정을 확인하세요.`
  return { title, description, alternates: { canonical: `/town/${t.id}` } }
}

const km1 = (n: number) => n.toFixed(1)

export default async function TownPage({ params }: { params: Params }) {
  const { slug } = await params
  const t = getTown(slug)
  if (!t) notFound()
  const { prev, next } = townNeighbors(slug)

  const planHref = `/plan?start=${t.id}`

  return (
    <main className="min-h-screen bg-granite pb-16">
      <Track event="town_page_viewed" data={{ slug: t.id }} />
      <div className="bg-ink px-5 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-3 text-[13px] text-white/60">
            <Link href="/route/camino-frances" className="underline-offset-2 hover:underline">
              프랑스 길
            </Link>{' '}
            · 마을
          </nav>
          <h1 className="font-display text-3xl font-bold">{t.nameKo}</h1>
          <p className="mt-1 text-[17px] text-white/75">{t.nameEs}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[15px] tabular-nums text-white/85">
            <span>산티아고까지 {remainingKm(t)}km</span>
            <span>생장 기준 {km1(t.km)}km</span>
            <span>해발 {t.elevation}m</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* 서비스 */}
        <section className="rounded-lg border border-stone bg-white px-4 py-4">
          <h2 className="mb-3 font-display text-lg text-text">마을 시설</h2>
          {t.services.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {t.services.map((s) => (
                <li key={s} className="rounded border border-stone px-3 py-1.5 text-[15px] text-text">
                  {SERVICE_LABEL[s]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-muted">확인된 시설 정보가 없습니다.</p>
          )}
        </section>

        {/* 숙소 — 데이터 없으면 정보 확인 중 (규칙 1) */}
        <section className="rounded-lg border border-stone bg-white px-4 py-4">
          <h2 className="mb-2 font-display text-lg text-text">
            알베르게 <span className="text-[13px] text-muted">Albergue</span>
          </h2>
          <p className="text-[15px] text-muted">
            {t.beds > 0
              ? `이 마을에는 약 ${t.beds}개의 침대가 있는 것으로 파악됩니다. 개별 알베르게의 요금·예약·개방 기간은 정보 확인 중입니다.`
              : '확인된 숙소 정보가 없습니다.'}
          </p>
          <p className="mt-2 text-[13px] text-muted">
            ※ 실측 검증 전까지 요금·전화번호·예약 가능 여부를 추정으로 채우지 않습니다.
          </p>
        </section>

        {/* 이전/다음 마을 */}
        <section className="grid grid-cols-2 gap-3">
          {prev ? (
            <a href={`/town/${prev.id}`} className="rounded-lg border border-stone bg-white px-4 py-3">
              <div className="text-[13px] text-muted">← 이전 마을</div>
              <div className="mt-0.5 text-[15px] font-semibold text-text">{prev.nameKo}</div>
              <div className="font-mono text-[13px] tabular-nums text-muted">
                {km1(t.km - prev.km)}km 전
              </div>
            </a>
          ) : (
            <div />
          )}
          {next ? (
            <a href={`/town/${next.id}`} className="rounded-lg border border-stone bg-white px-4 py-3 text-right">
              <div className="text-[13px] text-muted">다음 마을 →</div>
              <div className="mt-0.5 text-[15px] font-semibold text-text">{next.nameKo}</div>
              <div className="font-mono text-[13px] tabular-nums text-muted">
                {km1(next.km - t.km)}km 뒤
              </div>
            </a>
          ) : (
            <div />
          )}
        </section>

        {/* 이 마을에서 묵는 일정 */}
        <a
          href={planHref}
          className="block rounded-lg border border-ink bg-white px-4 py-3 text-[15px] font-medium text-ink"
        >
          {t.nameKo}에서 출발·경유하는 일정 보기 →
        </a>

        {/* 인접 구간 링크 */}
        <section className="text-[14px] text-muted">
          {prev && (
            <a href={`/stage/${prev.id}-to-${t.id}`} className="mr-4 underline-offset-2 hover:underline">
              {prev.nameKo} → {t.nameKo} 구간
            </a>
          )}
          {next && (
            <a href={`/stage/${t.id}-to-${next.id}`} className="underline-offset-2 hover:underline">
              {t.nameKo} → {next.nameKo} 구간
            </a>
          )}
        </section>

        <CalculatorCTA href={planHref} />
      </div>
    </main>
  )
}

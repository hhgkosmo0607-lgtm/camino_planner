/**
 * app/stage/[slug]/page.tsx — 구간(에타파) 81개 SEO 페이지 (정적 생성).
 * slug 형식: "saint-jean-pied-de-port-to-roncesvalles"
 *
 * ★ 고도는 profiles(SegmentProfile)에서 읽는다 — towns.elevation 차이로 계산하지 않는다(규칙 3).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { towns } from '@/data/towns'
import { getStage, allStages, estimatedMinutes, difficultyKo, SERVICE_LABEL } from '@/lib/geo'
import { Elevation } from '@/components/Elevation'
import { CalculatorCTA } from '@/components/CalculatorCTA'

export function generateStaticParams() {
  return allStages().map((s) => ({ slug: s.slug }))
}

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const s = getStage(slug)
  if (!s) return {}
  const title = `${s.from.nameKo} → ${s.to.nameKo} 구간 · ${s.profile.distanceKm}km`
  const description = `${s.from.nameKo}(${s.from.nameEs})에서 ${s.to.nameKo}(${s.to.nameEs})까지 ${s.profile.distanceKm}km, 누적 상승 ${s.profile.ascent}m·하강 ${s.profile.descent}m. 난이도와 통과 마을, 예상 소요 시간을 확인하세요.`
  return { title, description, alternates: { canonical: `/stage/${s.slug}` } }
}

export default async function StagePage({ params }: { params: Params }) {
  const { slug } = await params
  const s = getStage(slug)
  if (!s) notFound()

  const { from, to, profile } = s
  const mins = estimatedMinutes(profile.distanceKm, profile.ascent, profile.descent)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  // 구간이 지나는 마을 (from~to km 범위)
  const passed = towns.filter((t) => t.km >= from.km && t.km <= to.km)
  const planHref = `/plan?start=${from.id}`

  return (
    <main className="min-h-screen bg-granite pb-16">
      <div className="bg-ink px-5 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-3 text-[13px] text-white/60">
            <Link href="/route/camino-frances" className="underline-offset-2 hover:underline">
              프랑스 길
            </Link>{' '}
            · 구간
          </nav>
          <h1 className="font-display text-2xl font-bold leading-snug">
            {from.nameKo} → {to.nameKo}
          </h1>
          <p className="mt-1 text-[15px] text-white/70">
            {from.nameEs} → {to.nameEs}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[15px] tabular-nums text-white/85">
            <span>{profile.distanceKm}km</span>
            <span>오르막 +{profile.ascent}m</span>
            <span>내리막 −{profile.descent}m</span>
            <span>난이도 {difficultyKo(profile, profile.distanceKm)}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* 고도 단면 */}
        <section>
          <h2 className="mb-2 font-display text-lg text-text">고도 단면</h2>
          <div className="rounded-lg border border-stone bg-white p-3">
            <Elevation fromTownId={from.id} toTownId={to.id} height={140} />
            <div className="mt-2 flex justify-between font-mono text-[12px] tabular-nums text-muted">
              <span>{from.nameKo} {from.elevation}m</span>
              <span>최고 {profile.maxElevation}m</span>
              <span>{to.nameKo} {to.elevation}m</span>
            </div>
          </div>
        </section>

        {/* 요약 */}
        <section className="grid grid-cols-3 gap-3">
          <Stat value={String(profile.distanceKm)} unit="km" label="거리" />
          <Stat value={h > 0 ? `${h}시간 ${m}분` : `${m}분`} label="예상 소요" />
          <Stat value={difficultyKo(profile, profile.distanceKm)} label="난이도" />
        </section>

        {/* 통과 마을 */}
        <section className="rounded-lg border border-stone bg-white px-4 py-4">
          <h2 className="mb-3 font-display text-lg text-text">지나는 마을</h2>
          <ul className="space-y-2">
            {passed.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 border-b border-stone pb-2 last:border-0 last:pb-0">
                <a href={`/town/${t.id}`} className="min-w-0">
                  <span className="text-[15px] font-medium text-text underline-offset-2 hover:underline">
                    {t.nameKo}
                  </span>{' '}
                  <span className="text-[13px] text-muted">{t.nameEs}</span>
                </a>
                <span className="flex-none font-mono text-[12px] tabular-nums text-muted">
                  {t.services.map((sv) => SERVICE_LABEL[sv]).join(' · ') || '—'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <a
          href={planHref}
          className="block rounded-lg border border-ink bg-white px-4 py-3 text-[15px] font-medium text-ink"
        >
          이 구간이 포함된 일정 보기 →
        </a>

        <CalculatorCTA href={planHref} />
      </div>
    </main>
  )
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div className="rounded-lg border border-stone bg-white px-3 py-3 text-center">
      <div className="font-mono text-lg font-semibold tabular-nums leading-tight text-text">
        {value}
        {unit && <span className="ml-0.5 text-[13px] font-normal text-muted">{unit}</span>}
      </div>
      <div className="mt-1 text-[13px] text-muted">{label}</div>
    </div>
  )
}

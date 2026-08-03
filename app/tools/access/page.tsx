/**
 * app/tools/access/page.tsx — 접근 교통 (F-24, 무료 도구).
 *
 * ★ 인천 → 생장피드포르 경로 4개(data/access.ts). 서버 렌더(규칙 7), 상태 없음(입력이 없는 참고 페이지).
 * ★ data/access.ts는 전부 source: 'GUIDEBOOK'(가이드북·예매 사이트 출처, 개인 실측 아님) — 화면에도 그대로 밝힌다(규칙 1).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ToolNav } from '@/components/ToolNav'
import { Track } from '@/components/Track'
import { RelatedLinks } from '@/components/RelatedLinks'
import { accessRoutes } from '@/data/access'
import type { AccessLeg, AccessTransportKind } from '@/lib/schema'

export const metadata: Metadata = {
  title: '인천에서 생장피드포르 가는 법 · 접근 교통 4가지',
  description:
    '카미노 프랑스 길 출발지 생장피드포르까지, 파리·비아리츠·팜플로나 경유 경로를 소요시간·요금과 함께 비교합니다.',
  alternates: { canonical: '/tools/access' },
}

const KIND_LABEL: Record<AccessTransportKind, string> = {
  FLIGHT: '비행기',
  TRAIN: '기차',
  BUS: '버스',
  SHUTTLE: '셔틀',
  TAXI: '택시',
  METRO: '지하철',
}

const TRAIT_LABEL: Record<string, string> = {
  FAST: '가장 빠름',
  CHEAP: '저렴함',
  SIMPLE: '경로 단순',
  POPULAR: '가장 대중적',
}

function fmtDuration(min: number | null): string {
  if (min == null) return '미확인'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}분`
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

function fmtCost(eur: number | null): string {
  return eur == null ? '미확인' : `€${eur}`
}

function LegRow({ leg }: { leg: AccessLeg }) {
  return (
    <li className="border-t border-stone py-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="text-[17px] font-semibold text-text">
          <span className="mr-2 inline-block rounded bg-granite px-2 py-0.5 text-[13px] font-medium text-muted">
            {KIND_LABEL[leg.kind]}
          </span>
          {leg.fromName} → {leg.toName}
        </div>
        <div className="font-mono text-[15px] tabular-nums text-muted">
          {fmtDuration(leg.durationMin)} · {fmtCost(leg.costEur)}
        </div>
      </div>
      <div className="mt-1 text-[15px] text-muted">
        {leg.operator && <span>{leg.operator}</span>}
        {leg.frequencyNote && <span>{leg.operator ? ' · ' : ''}{leg.frequencyNote}</span>}
      </div>
      {leg.cautionKo && <p className="mt-1.5 text-[15px] leading-relaxed text-text">{leg.cautionKo}</p>}
    </li>
  )
}

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-granite pb-16">
      <Track event="tool_used" data={{ tool: 'access' }} />
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">접근 교통</h1>
          <p className="mt-1 text-[17px] text-white/70">
            생장피드포르에는 공항이 없습니다. 인천에서 출발지까지 가는 4가지 경로입니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <ToolNav current="/tools/access" />

        <section className="rounded-lg border border-stone bg-white/60 px-4 py-3 text-[15px] text-muted">
          출처: 공개 예매 사이트·가이드북(직접 실측 아님). 2026년 7월 확인 기준이며, 항공·기차 요금과
          시간표는 계절에 따라 바뀝니다. 예약 전 최신 정보를 다시 확인하세요.
        </section>

        <div className="space-y-4">
          {accessRoutes.map((route) => (
            <article key={route.id} className="rounded-lg border border-stone bg-white px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-display text-lg text-text">{route.nameKo}</h2>
                <div className="text-right">
                  <div className="font-mono text-2xl font-semibold tabular-nums leading-none text-text">
                    약 {route.totalHours}
                    <span className="ml-0.5 text-[13px] font-normal text-muted">시간</span>
                  </div>
                  <div className="mt-1 font-mono text-[13px] tabular-nums text-muted">
                    약 {(route.estimatedCostKrw / 10000).toFixed(0)}만원
                  </div>
                </div>
              </div>

              {route.traits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {route.traits.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-stone px-2.5 py-0.5 text-[13px] text-muted"
                    >
                      {TRAIT_LABEL[t]}
                    </span>
                  ))}
                </div>
              )}

              <ul className="mt-3">
                {route.legs.map((leg) => (
                  <LegRow key={leg.order} leg={leg} />
                ))}
              </ul>

              <Link
                href={`/plan?ar=${route.id}`}
                className="mt-3 inline-block text-[15px] underline-offset-2 hover:underline"
              >
                이 경로로 일정 만들기 →
              </Link>
            </article>
          ))}
        </div>

        <p className="text-[13px] text-muted">
          ※ &ldquo;약 OO만원&rdquo;에는 인천↔유럽 항공권 추정치가 포함돼 있어 실제 검색가와 다를 수 있습니다.
          유럽 내 기차·버스 요금(€ 표시)은 예매 사이트 기준입니다.
        </p>

        <RelatedLinks
          items={[
            { href: '/tools/timeline', labelKo: '준비 타임라인' },
            { href: '/plan', labelKo: '일정 만들기' },
          ]}
        />
      </div>
    </main>
  )
}

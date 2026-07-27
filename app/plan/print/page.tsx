/**
 * app/plan/print/page.tsx — 인쇄용 일정표 (P4).
 *
 * ★ 부가 기능이 아니다. 60대 이상 순례자에게 닿는 유일한 경로이고,
 *   실제로는 "자녀가 뽑아서 부모에게 주는" 용도로 쓰인다 (CLAUDE.md 규칙 9).
 * ★ /plan 과 같은 searchParams 를 받아 서버에서 계산(규칙 7·8).
 * ★ 의료 정보는 넣지 않는다 (규칙 11). 응급 전화번호·기본 회화만.
 */

import type { Metadata } from 'next'
import { buildPlan } from '@/lib/planner/split'
import { decodePlan } from '@/lib/url'
import { towns } from '@/data/towns'
import { brand } from '@/config/brand'
import { PrintButton } from '@/components/PrintButton'

export const metadata: Metadata = {
  title: '인쇄용 일정표',
  robots: { index: false, follow: false },
}

type SP = Promise<Record<string, string | string[] | undefined>>

function toParams(sp: Record<string, string | string[] | undefined>): URLSearchParams {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') p.set(k, v)
    else if (Array.isArray(v) && v[0]) p.set(k, v[0])
  }
  return p
}

const town = (id: string) => towns.find((t) => t.id === id)
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function dateFor(startDate: string | undefined, dayNo: number): string {
  if (!startDate) return '—'
  const d = new Date(startDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + (dayNo - 1))
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} (${WEEKDAYS[d.getUTCDay()]})`
}

const PHRASES: [string, string][] = [
  ['빈 침대 있나요?', '¿Hay camas libres?'],
  ['순례자입니다', 'Soy peregrino / peregrina'],
  ['얼마예요?', '¿Cuánto cuesta?'],
  ['크레덴시알에 도장 주세요', '¿Me puede sellar la credencial?'],
  ['감사합니다 · 좋은 길 되세요', 'Gracias · Buen Camino'],
]

export default async function PrintPage({ searchParams }: { searchParams: SP }) {
  const input = decodePlan(toParams(await searchParams))
  const plan = buildPlan(input)
  const startTown = town(input.startTownId)
  const startLabel = dateFor(input.startDate, 1)
  const endLabel = dateFor(input.startDate, plan.totalDays)

  return (
    <main className="print-sheet mx-auto max-w-[820px] bg-white px-8 py-8 text-black">
      {/* 상단 요약 */}
      <div className="flex items-end justify-between border-b-2 border-black pb-3">
        <div>
          <h1 className="font-display text-xl font-bold">
            산티아고 순례길 일정표
          </h1>
          <p className="mt-1 text-[13px]">
            {startTown?.nameKo} ({startTown?.nameEs}) → 산티아고 데 콤포스텔라
          </p>
        </div>
        <div className="text-right font-mono text-[13px] tabular-nums">
          <div>총 {plan.totalDays}일 · 걸은 거리 {plan.walkedKm.toFixed(0)}km</div>
          {input.startDate && (
            <div>{startLabel} ~ {endLabel}</div>
          )}
        </div>
      </div>

      {/* 일정 표 */}
      <table className="mt-4 w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1 pr-2">일자</th>
            <th className="py-1 pr-2">날짜</th>
            <th className="py-1 pr-2">출발 → 도착</th>
            <th className="py-1 pr-2 text-right">거리</th>
            <th className="py-1 pr-2 text-right">오르막</th>
            <th className="py-1 text-right">침대</th>
          </tr>
        </thead>
        <tbody>
          {plan.stages.map((s) => {
            const from = town(s.fromTownId)
            const to = town(s.toTownId)
            const isRest = s.isRestDay
            const isTransport = !!s.transport
            return (
              <tr key={s.dayNo} className="print-row border-b border-stone align-top">
                <td className="py-1.5 pr-2 font-mono tabular-nums">{s.dayNo}</td>
                <td className="py-1.5 pr-2 font-mono tabular-nums whitespace-nowrap">
                  {dateFor(input.startDate, s.dayNo)}
                </td>
                <td className="py-1.5 pr-2">
                  {isRest ? (
                    <span>휴식일 · {to?.nameKo}</span>
                  ) : (
                    <span>
                      {from?.nameKo} → <b>{to?.nameKo}</b>{' '}
                      <span className="text-[11px] text-neutral-600">
                        {to?.nameEs}
                        {isTransport && ' · 버스'}
                      </span>
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
                  {isRest ? '휴식' : `${s.distanceKm.toFixed(1)}km`}
                </td>
                <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
                  {isRest || isTransport ? '—' : `+${s.ascent}m`}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums">
                  {to && to.beds > 0 ? to.beds : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* 하단: 응급 연락처 + 기본 회화 */}
      <div className="mt-5 grid grid-cols-2 gap-6 border-t border-black pt-3 text-[12px]">
        <div>
          <div className="font-bold">긴급 전화</div>
          <div className="mt-1 font-mono tabular-nums">112 — 스페인 전역 통합 긴급 (경찰·구급·소방)</div>
          <div className="mt-2 text-[11px] text-neutral-600">
            길 안전 판단은 생장 순례자 사무소·현지 안내를 따르세요.
          </div>
        </div>
        <div>
          <div className="font-bold">기본 스페인어</div>
          <ul className="mt-1 space-y-0.5">
            {PHRASES.map(([ko, es]) => (
              <li key={es}>
                {ko} — <span className="italic">{es}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-stone pt-3">
        <span className="text-[11px] text-neutral-500">
          {brand.nameKo} · 경로 © OpenStreetMap (ODbL) · 고도 © EU-DEM (Copernicus)
        </span>
        <PrintButton event="plan_printed" />
      </div>
    </main>
  )
}

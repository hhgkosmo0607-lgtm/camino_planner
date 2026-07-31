/**
 * AccessDay0.tsx — F-24 접근 교통을 일정의 "Day 0"으로 통합.
 *
 * ★ 서버 컴포넌트. 링크(<a>)만으로 동작 — JS를 꺼도 선택이 된다(규칙 7·8).
 *   클릭하면 /plan에 ar= 쿼리스트링만 바뀐 새 URL로 이동 → 서버가 다시 렌더.
 * ★ data/access.ts는 전부 source: 'GUIDEBOOK'(개인 실측 아님) — 화면에도 밝힌다(규칙 1).
 * ★ ForkPicker와 같은 태도: 4개 경로 중 어느 쪽도 권하지 않는다.
 */

import type { AccessLeg, AccessRoute, AccessTransportKind } from '@/lib/schema'

const KIND_LABEL: Record<AccessTransportKind, string> = {
  FLIGHT: '비행기',
  TRAIN: '기차',
  BUS: '버스',
  SHUTTLE: '셔틀',
  TAXI: '택시',
  METRO: '지하철',
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

function href(currentParams: URLSearchParams, routeId: string | null): string {
  const p = new URLSearchParams(currentParams)
  if (routeId) p.set('ar', routeId)
  else p.delete('ar')
  return `/plan?${p.toString()}`
}

function LegRow({ leg }: { leg: AccessLeg }) {
  return (
    <li className="border-t border-stone py-2.5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <div className="text-[15px] font-medium text-text">
          <span className="mr-1.5 inline-block rounded bg-granite px-1.5 py-0.5 text-[12px] font-medium text-muted">
            {KIND_LABEL[leg.kind]}
          </span>
          {leg.fromName} → {leg.toName}
        </div>
        <div className="font-mono text-[13px] tabular-nums text-muted">
          {fmtDuration(leg.durationMin)} · {fmtCost(leg.costEur)}
        </div>
      </div>
      {leg.cautionKo && <p className="mt-1 text-[13px] leading-relaxed text-muted">{leg.cautionKo}</p>}
    </li>
  )
}

export function AccessDay0({
  routes,
  selectedRouteId,
  currentParams,
}: {
  routes: AccessRoute[]
  selectedRouteId: string | null
  currentParams: URLSearchParams
}) {
  if (routes.length === 0) return null
  const selected = routes.find((r) => r.id === selectedRouteId) ?? null

  return (
    <article className="rounded-lg border border-dashed border-stone bg-white/60 px-4 py-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 flex-none items-center justify-center rounded bg-granite font-mono text-[15px] font-semibold tabular-nums text-muted"
          aria-label="0일차"
        >
          00
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-semibold text-text">Day 0 · 출발지까지 이동</div>
          <div className="text-[13px] text-muted">
            생장피드포르에는 공항이 없습니다. 인천에서 가는 경로 {routes.length}가지 중 하나를 골라보세요(선택하지
            않아도 일정 계산에는 영향이 없습니다).
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {routes.map((r) => {
          const isSelected = r.id === selected?.id
          return (
            <a
              key={r.id}
              href={href(currentParams, isSelected ? null : r.id)}
              aria-current={isSelected ? 'true' : undefined}
              className={
                'block rounded-md border px-3 py-2 text-[15px] transition-colors ' +
                (isSelected ? 'border-ink bg-white' : 'border-stone bg-white/60 hover:border-ink/50')
              }
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-text">
                  {isSelected && <span className="mr-1 text-ink">●</span>}
                  {r.nameKo}
                </span>
                <span className="flex-none font-mono text-[13px] tabular-nums text-muted">
                  약 {r.totalHours}시간 · 약 {(r.estimatedCostKrw / 10000).toFixed(0)}만원
                </span>
              </div>

              {isSelected && (
                <ul className="mt-2.5">
                  {r.legs.map((leg) => (
                    <LegRow key={leg.order} leg={leg} />
                  ))}
                </ul>
              )}
            </a>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px] text-muted">
        <span>출처: 공개 예매 사이트·가이드북(2026년 7월 확인). 예약 전 최신 정보를 다시 확인하세요.</span>
        <a href="/tools/access" className="flex-none underline-offset-2 hover:underline">
          전체 비교 →
        </a>
      </div>
    </article>
  )
}

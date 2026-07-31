/**
 * ForkPicker.tsx — 갈림길(F-19) 선택.
 *
 * ★ 서버 컴포넌트. 링크(<a>)만으로 동작 — JS를 꺼도 선택이 된다(규칙 7·8).
 *   클릭하면 /plan에 v= 쿼리스트링만 바뀐 새 URL로 이동 → 서버가 다시 계산.
 * ★ "어느 쪽도 권하지 않는다" — 거리·특징·주의만 보여주고 판단은 사용자가 한다
 *   (CLAUDE.md "이동수단은 Plan B가 아니다" 절과 같은 태도).
 * ★ 노란색(flecha)은 길 안내 전용이라 여기서 강조색으로 쓰지 않는다.
 */

import type { RouteFork } from '@/lib/schema'
import { defaultVariant, isVariantClosedOn } from '@/lib/planner/forks'
import { withVariantChoice } from '@/lib/url'

interface Props {
  fork: RouteFork
  selectedVariantId: string | null // Stage.variantId. null이면 기본(공식 표지) 경로
  dateStr: string | null // Stage.date — 계절 폐쇄 판정용. 모르면 null(경고 생략)
  currentParams: URLSearchParams
}

export function ForkPicker({ fork, selectedVariantId, dateStr, currentParams }: Props) {
  const def = defaultVariant(fork)
  const selectedId = selectedVariantId ?? def.id

  return (
    <div className="mt-3 rounded-md border border-stone bg-sand-2/50 px-3 py-2.5">
      <div className="mb-2 text-[13px] font-medium tracking-wide text-muted">
        갈림길 — 이 구간에 선택지가 있습니다
      </div>
      <div className="space-y-2">
        {fork.variants.map((v) => {
          const isSelected = v.id === selectedId
          const closed = isVariantClosedOn(v, dateStr)
          const href = `/plan?${withVariantChoice(currentParams, fork.id, v.id, v.id === def.id)}`
          return (
            <a
              key={v.id}
              href={href}
              aria-current={isSelected ? 'true' : undefined}
              className={
                'block rounded-md border px-3 py-2 text-[15px] leading-relaxed transition-colors ' +
                (isSelected ? 'border-ink bg-white' : 'border-stone bg-white/60 hover:border-ink/50')
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-text">
                  {isSelected && <span className="mr-1 text-ink">●</span>}
                  {v.nameKo} <span className="text-[13px] font-normal text-muted">{v.nameEs}</span>
                </span>
                {v.distanceKm !== null && (
                  <span className="flex-none font-mono text-[13px] tabular-nums text-muted">
                    {v.distanceKm}km
                  </span>
                )}
              </div>

              {closed && (
                <div className="mt-1 text-[13px] font-medium text-vino">
                  겨울철({v.closedFrom}~{v.closedTo}) 폐쇄 기간입니다 — 다른 경로를 고려하세요. 당일
                  안전 판단은 현지 순례자 사무소를 따르세요.
                </div>
              )}
              {v.cautionKo && <div className="mt-1 text-[13px] text-muted">{v.cautionKo}</div>}
              {v.highlightsKo.length > 0 && (
                <div className="mt-1 text-[13px] text-muted">{v.highlightsKo.join(' · ')}</div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}

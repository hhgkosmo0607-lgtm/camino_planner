/**
 * RiskGauge.tsx — 부상 위험 점수(0~100) 시각화 + 판단 문구.
 *
 * ★ CLAUDE.md 규칙 3: riskDataQuality 가 'ESTIMATED' 인 동안은 점수를 숫자로
 *   노출하지 않는다. 그 경우 게이지·숫자를 숨기고 안내 문구만 보여준다.
 * ★ 노란색(flecha)은 길 안내 전용이라 게이지에 쓰지 않는다.
 *   위험도는 moss(안전)→ink(보통)→vino(위험)로 표현한다.
 */

import type { Plan } from '@/lib/schema'

interface RiskGaugeProps {
  score: number
  quality: Plan['riskDataQuality']
  advice: string
}

function band(score: number): { color: string; ko: string } {
  if (score < 30) return { color: 'var(--moss)', ko: '낮음' }
  if (score < 50) return { color: 'var(--ink)', ko: '보통' }
  if (score < 65) return { color: 'var(--vino)', ko: '다소 높음' }
  return { color: 'var(--vino)', ko: '높음' }
}

export function RiskGauge({ score, quality, advice }: RiskGaugeProps) {
  // 추정 데이터면 점수를 숨긴다 (규칙 3)
  if (quality === 'ESTIMATED') {
    return (
      <section className="rounded-lg border border-stone bg-white/60 px-4 py-4">
        <div className="text-[13px] font-medium tracking-wide text-muted">부상 위험 판단</div>
        <p className="mt-2 text-[15px] leading-relaxed text-text">{advice}</p>
        <p className="mt-2 text-[13px] text-muted">
          아직 실측 고도로 검증되지 않아 점수는 표시하지 않습니다.
        </p>
      </section>
    )
  }

  const b = band(score)
  const clamped = Math.min(100, Math.max(0, score))
  return (
    <section className="rounded-lg border border-stone bg-white px-4 py-4">
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] font-medium tracking-wide text-muted">부상 위험 점수</div>
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-3xl font-semibold tabular-nums leading-none"
            style={{ color: b.color }}
          >
            {Math.round(clamped)}
          </span>
          <span className="text-[13px] text-muted">/ 100 · {b.ko}</span>
        </div>
      </div>

      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-granite"
        role="meter"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`부상 위험 점수 ${Math.round(clamped)}점 (100점 만점, 낮을수록 안전)`}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${clamped}%`, background: b.color }}
        />
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-text">{advice}</p>
    </section>
  )
}

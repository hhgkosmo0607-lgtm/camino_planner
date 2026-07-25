/**
 * Mojon.tsx — 이정표(모호온) 헤더. 시그니처 컴포넌트.
 * 길가 돌기둥 이정표를 옮긴 것. 산티아고까지 남은 거리를 크게 보여준다.
 *
 * CLAUDE.md 규칙:
 *  - 남은 거리는 스페인식 소수점 표기 (114.235 → "114,235")
 *  - 수치는 mono + tabular-nums, 18px 이상 (여기선 32px+)
 *  - 노란색(flecha)은 길 안내·진행 표시에만 (여기 진행률 바가 그 용도)
 *  - 이 컴포넌트는 임의로 바꾸지 않는다
 */

import { Shell } from './Shell'

interface MojonProps {
  remainingKm: number
  walkedKm: number
  totalKm: number
  totalDays: number
  /** 상단 브랜드/제목 (선택) */
  title?: string
}

/** 숫자를 스페인식(소수점=쉼표, 천단위 없음)으로. 114.235 → "114,235" */
function spanishDecimal(km: number, digits = 3): string {
  return km.toFixed(digits).replace('.', ',')
}

export function Mojon({ remainingKm, walkedKm, totalKm, totalDays, title }: MojonProps) {
  const pct = totalKm > 0 ? Math.min(100, Math.max(0, (walkedKm / totalKm) * 100)) : 0
  return (
    <header className="bg-ink px-5 py-5 text-white">
      {title && (
        <div className="mx-auto mb-4 flex max-w-3xl items-center gap-2.5">
          <Shell size={24} className="text-flecha" />
          <span className="font-display text-lg tracking-wide">{title}</span>
        </div>
      )}

      <div className="mx-auto flex max-w-3xl items-end justify-between gap-3 rounded border-2 border-flecha/50 px-4 py-3">
        <div>
          <div className="mb-0.5 text-[11px] tracking-[0.28em] text-white/60">SANTIAGO</div>
          <div className="leading-none">
            <span className="font-mono text-4xl font-semibold tabular-nums text-flecha">
              {spanishDecimal(remainingKm)}
            </span>
            <span className="ml-1.5 text-sm text-white/65">km 남음</span>
          </div>
        </div>
        <div className="text-right text-[13px] leading-relaxed text-white/70">
          걸은 거리{' '}
          <b className="font-mono font-medium tabular-nums text-white">
            {spanishDecimal(walkedKm, 1)}
          </b>{' '}
          km
          <br />
          전체{' '}
          <b className="font-mono font-medium tabular-nums text-white">
            {spanishDecimal(totalKm, 1)}
          </b>{' '}
          km · <b className="font-mono font-medium tabular-nums text-white">{totalDays}</b>일
        </div>
      </div>

      {/* 진행률 바 — flecha(길 안내/진행) 용도 */}
      <div className="mx-auto mt-3 h-1 max-w-3xl overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full bg-flecha"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`전체 ${spanishDecimal(totalKm, 1)}km 중 ${Math.round(pct)}% 진행`}
        />
      </div>
    </header>
  )
}

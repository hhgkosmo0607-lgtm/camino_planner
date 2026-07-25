/**
 * Elevation.tsx — 고도 단면 SVG.
 *
 * 구간 내 마을들의 해발고도를 폴리라인으로 그리고, 아래를 반투명 채운다.
 * marks(km 배열)에 flecha 세로선(하루 도착지 등 길 안내 표시).
 *
 * ⚠️ 이건 '시각화'다. 마을 사이 실제 고개(예: 레포에데르 1,450m)는 마을
 *    고도만으로 그리면 숨는다 — 상세 고도열은 배포에 포함되지 않기 때문(data/geometry는
 *    gitignore). 오르막·내리막 '판단'은 이 그림이 아니라 profiles.ts(SegmentProfile)의
 *    ascent/descent 로 한다 (CLAUDE.md 규칙 3). 그림은 형태 감만 준다.
 */

import { towns } from '@/data/towns'

interface ElevationProps {
  fromTownId: string
  toTownId: string
  /** 세로선을 그을 km 위치들(출발지 기준 누적 km). */
  marks?: number[]
  height?: number
  className?: string
}

export function Elevation({
  fromTownId,
  toTownId,
  marks = [],
  height = 130,
  className,
}: ElevationProps) {
  const fromKm = towns.find((t) => t.id === fromTownId)?.km
  const toKm = towns.find((t) => t.id === toTownId)?.km
  if (fromKm === undefined || toKm === undefined) return null

  const lo = Math.min(fromKm, toKm)
  const hi = Math.max(fromKm, toKm)
  const slice = towns.filter((t) => t.km >= lo && t.km <= hi)
  if (slice.length < 2) return null

  const kmA = slice[0].km
  const kmB = slice[slice.length - 1].km
  const span = Math.max(kmB - kmA, 0.1)
  const els = slice.map((t) => t.elevation)
  const elLo = Math.min(...els) - 60
  const elHi = Math.max(...els) + 60
  const W = 1000
  const H = height

  const x = (km: number) => ((km - kmA) / span) * W
  const y = (el: number) => H - ((el - elLo) / (elHi - elLo)) * (H - 18) - 8

  const pts = slice.map((t) => `${x(t.km).toFixed(1)},${y(t.elevation).toFixed(1)}`).join(' ')
  const area = `0,${H} ${pts} ${W},${H}`

  const label = `${slice[0].nameKo}부터 ${slice[slice.length - 1].nameKo}까지 고도 단면`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className={className}
      style={{ width: '100%', height, display: 'block' }}
    >
      <polygon points={area} fill="var(--ink)" fillOpacity={0.12} />
      <polyline
        points={pts}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
      />
      {marks.map((km, i) => (
        <line
          key={i}
          x1={x(km)}
          y1={0}
          x2={x(km)}
          y2={H}
          stroke="var(--flecha)"
          strokeWidth={2}
          strokeOpacity={0.75}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

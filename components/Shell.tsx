/**
 * Shell.tsx — 산티아고 조가비(콘차) 표식.
 * 공식 표지의 방사형 부채꼴을 SVG 선으로 그린다. 순례자 상징.
 */

interface ShellProps {
  size?: number
  /** CSS 색상. 기본은 currentColor(부모 색 상속). */
  color?: string
  rays?: number
  className?: string
}

export function Shell({ size = 24, color = 'currentColor', rays = 9, className }: ShellProps) {
  const lines = Array.from({ length: rays }, (_, i) => {
    const angle = Math.PI + (Math.PI * (i + 0.5)) / rays
    const x2 = 32 + Math.cos(angle) * 26
    const y2 = 48 + Math.sin(angle) * 26
    return <line key={i} x1={32} y1={48} x2={x2} y2={y2} />
  })
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
    >
      <g stroke={color} strokeWidth={5} strokeLinecap="round">
        {lines}
      </g>
    </svg>
  )
}

/**
 * ToolNav.tsx — 무료 도구 3종 + 일정 계산기 상호 링크.
 * 각 도구가 서로, 그리고 /plan 과 연결된다 (P6 요건).
 */

import Link from 'next/link'

const ITEMS = [
  { href: '/plan', ko: '일정' },
  { href: '/tools/cost', ko: '비용' },
  { href: '/tools/pack', ko: '배낭 무게' },
  { href: '/tools/timeline', ko: '준비 타임라인' },
]

export function ToolNav({ current }: { current?: string }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {ITEMS.map((it) => {
        const active = it.href === current
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? 'page' : undefined}
            className={
              'inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[15px] ' +
              (active
                ? 'border-ink bg-ink text-white'
                : 'border-stone bg-white text-text')
            }
          >
            {it.ko}
          </Link>
        )
      })}
    </nav>
  )
}

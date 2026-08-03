/**
 * RelatedLinks.tsx — 도구 페이지 하단 "다음으로 가볼 곳" 링크.
 * ★ 예전엔 페이지마다 밑줄 텍스트 링크를 따로 적었다(6곳 동일 패턴 중복) —
 *   pill 스타일로 통일해 다른 카드류 UI(ToolGrid 등)와 톤을 맞췄다.
 */

import Link from 'next/link'

export function RelatedLinks({ items }: { items: { href: string; labelKo: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="min-h-11 inline-flex items-center rounded-full border border-stone bg-white px-4 text-[14px] text-text hover:border-ink"
        >
          {it.labelKo} →
        </Link>
      ))}
    </div>
  )
}

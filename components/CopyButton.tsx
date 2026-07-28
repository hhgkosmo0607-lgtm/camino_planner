'use client'

/**
 * CopyButton.tsx — 임의 텍스트 클립보드 복사(범용).
 * F-04 예약 문장 복사(WhatsApp에 바로 붙여넣기) 용도로 처음 만들어짐 — ShareButton과
 * 패턴은 같지만 URL이 아니라 임의 텍스트를 받는다.
 */

import { useState } from 'react'
import { track } from '@vercel/analytics'

export function CopyButton({ text, label = '문장 복사' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      track('phrase_copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="min-h-11 rounded-md border border-ink px-5 py-2 text-[15px] font-medium text-ink"
    >
      {copied ? '복사됐어요' : label}
    </button>
  )
}

'use client'

/**
 * ShareButton.tsx — 현재 계획 링크(URL) 복사.
 * URL이 계획 전체를 담으므로(규칙 8) 링크 하나면 공유가 끝난다.
 */

import { useState } from 'react'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
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
      {copied ? '링크가 복사됐어요' : '이 계획 링크 복사'}
    </button>
  )
}

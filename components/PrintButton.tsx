'use client'

/** PrintButton.tsx — 브라우저 인쇄 대화상자를 연다. 인쇄물에는 안 나온다(.no-print). */
import { track } from '@vercel/analytics'

export function PrintButton({ event }: { event?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (event) track(event)
        window.print()
      }}
      className="no-print min-h-11 rounded-md bg-ink px-5 py-2 text-[15px] font-medium text-white"
    >
      인쇄하기
    </button>
  )
}

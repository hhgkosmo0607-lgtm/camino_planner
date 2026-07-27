'use client'

/**
 * EmailCapture.tsx — "출국 D-90 체크리스트 받기" (선택, P7).
 * ★ 이메일만 받는다. 동의 없이는 전송 버튼이 비활성화된다.
 * ★ 이 컴포넌트가 없어도(RESEND_API_KEY 미설정 시 렌더 자체를 안 함) 계산 결과는 완전히 동작한다(규칙 8).
 */

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      })
      const data: { error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error ?? '등록에 실패했습니다.')
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.')
    }
  }

  if (status === 'done') {
    return (
      <section className="rounded-lg border border-moss/40 bg-moss/5 px-4 py-4 text-[15px] text-text">
        등록됐어요. 출국 D-90 체크리스트를 이메일로 보내드릴게요.
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-stone bg-white px-4 py-4">
      <h2 className="font-display text-lg text-text">
        출국 D-90 체크리스트 받기 <span className="text-[13px] font-normal text-muted">(선택)</span>
      </h2>
      <p className="mt-1 text-[17px] text-muted">
        이메일만 입력하면 준비 체크리스트를 보내드립니다. 입력하지 않아도 위 계산 결과는 그대로
        이용할 수 있어요.
      </p>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
        <input
          type="email"
          required
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 flex-1 rounded-md border border-stone px-3 text-[17px]"
        />
        <button
          type="submit"
          disabled={!consent || status === 'loading'}
          className="min-h-11 rounded-md bg-ink px-5 py-2 text-[15px] font-medium text-white disabled:opacity-40"
        >
          {status === 'loading' ? '보내는 중…' : '받기'}
        </button>
      </form>
      <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-[13px] text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="h-5 w-5 accent-ink"
        />
        <span>
          이메일 수집·이용에 동의합니다. 체크리스트 발송 용도로만 쓰며, 자세한 내용은{' '}
          <Link href="/privacy" className="underline underline-offset-2">
            개인정보 처리방침
          </Link>
          을 확인하세요.
        </span>
      </label>
      {status === 'error' && <p className="mt-2 text-[13px] text-vino">{error}</p>}
    </section>
  )
}

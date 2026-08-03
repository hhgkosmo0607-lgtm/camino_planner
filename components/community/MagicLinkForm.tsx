'use client'

/**
 * MagicLinkForm.tsx — 커뮤니티 로그인(이메일 매직링크, 비밀번호 없음).
 * ★ 옵트인 부가 기능이라 여기서만 가입을 요구한다 — 계산기 등 핵심 기능은
 *   이 로그인과 무관하다(규칙 8).
 * ★ 최소 연령 고지: 실제 나이 검증은 하지 않는다(과도한 스코프) — 동의
 *   체크박스로 고지만 한다.
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) {
      setStatus('error')
      setErrorMsg('커뮤니티 기능이 아직 설정되지 않았습니다.')
      return
    }
    setStatus('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/community` },
    })
    if (error) {
      setStatus('error')
      setErrorMsg('로그인 메일 발송에 실패했습니다. 이메일 주소를 확인해 주세요.')
      return
    }
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <p className="rounded-md bg-moss/10 px-4 py-3 text-[15px] text-moss">
        {email}로 로그인 링크를 보냈습니다. 메일함(스팸함도)을 확인해 주세요.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="community-email" className="block text-[15px] font-medium text-text">
          이메일
        </label>
        <input
          id="community-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full min-h-11 rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
          placeholder="you@example.com"
        />
        <p className="mt-1 text-[13px] text-muted">비밀번호가 없습니다. 메일로 온 링크를 눌러 로그인합니다.</p>
      </div>

      <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[14px] text-text">
        <input
          type="checkbox"
          required
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-none accent-ink"
        />
        <span>
          만 14세 이상이며, 다른 순례자와의 소통에는 개인정보 노출·오프라인 만남 등 위험이 따를 수 있음을
          이해했습니다. 위협을 느끼면 즉시 신고·차단할 수 있습니다.
        </span>
      </label>

      {status === 'error' && <p className="text-[14px] text-vino">{errorMsg}</p>}

      <button
        type="submit"
        disabled={!agreed || status === 'sending'}
        className="min-h-11 rounded-md border border-ink bg-ink px-5 text-[15px] font-medium text-white disabled:opacity-40"
      >
        {status === 'sending' ? '보내는 중…' : '로그인 링크 받기'}
      </button>
    </form>
  )
}

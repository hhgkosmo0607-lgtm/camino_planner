'use client'

/**
 * BlockButton.tsx — 차단(필수 안전 기능). 차단하면 상대의 글·댓글이 내
 * 화면에서 즉시 안 보인다(RLS `posts_select_not_blocked`/`replies_select_not_blocked`).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function BlockButton({ userId, blockedProfileId }: { userId: string; blockedProfileId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  if (userId === blockedProfileId) return null

  const handleBlock = async () => {
    const supabase = createClient()
    if (!supabase) return
    setStatus('saving')
    const { error } = await supabase
      .from('blocks')
      .insert({ blocker_profile_id: userId, blocked_profile_id: blockedProfileId })
    if (error) {
      setStatus('error')
      return
    }
    setStatus('idle')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleBlock}
      disabled={status === 'saving'}
      className="min-h-11 rounded-md border border-stone px-3 text-[13px] text-muted disabled:opacity-40"
    >
      {status === 'error' ? '차단 실패' : '차단'}
    </button>
  )
}

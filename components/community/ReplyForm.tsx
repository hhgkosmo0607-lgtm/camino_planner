'use client'

/** ReplyForm.tsx — 댓글 작성. */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ReplyForm({ postId, userId }: { postId: string; userId: string }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) return
    setStatus('saving')
    const { error } = await supabase.from('replies').insert({ post_id: postId, profile_id: userId, body })
    if (error) {
      setStatus('error')
      return
    }
    setBody('')
    setStatus('idle')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="reply-body" className="block text-[15px] font-medium text-text">
        댓글
      </label>
      <textarea
        id="reply-body"
        required
        maxLength={2000}
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
      />
      {status === 'error' && <p className="text-[14px] text-vino">등록에 실패했습니다.</p>}
      <button
        type="submit"
        disabled={status === 'saving'}
        className="min-h-11 rounded-md border border-ink bg-ink px-4 text-[15px] font-medium text-white disabled:opacity-40"
      >
        {status === 'saving' ? '등록 중…' : '댓글 등록'}
      </button>
    </form>
  )
}

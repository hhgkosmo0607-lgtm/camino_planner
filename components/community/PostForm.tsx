'use client'

/**
 * PostForm.tsx — 게시판 글쓰기. 텍스트만(사진·첨부 없음, 03문서 W2 반전 범위 제한).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PostForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) return
    setStatus('saving')
    const { data, error } = await supabase
      .from('posts')
      .insert({ profile_id: userId, title, body })
      .select('id')
      .single()
    if (error || !data) {
      setStatus('error')
      return
    }
    router.push(`/community/${data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="post-title" className="block text-[15px] font-medium text-text">
          제목
        </label>
        <input
          id="post-title"
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full min-h-11 rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
        />
      </div>
      <div>
        <label htmlFor="post-body" className="block text-[15px] font-medium text-text">
          내용
        </label>
        <textarea
          id="post-body"
          required
          maxLength={4000}
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
        />
      </div>
      {status === 'error' && <p className="text-[14px] text-vino">등록에 실패했습니다. 다시 시도해 주세요.</p>}
      <button
        type="submit"
        disabled={status === 'saving'}
        className="min-h-11 rounded-md border border-ink bg-ink px-5 text-[15px] font-medium text-white disabled:opacity-40"
      >
        {status === 'saving' ? '등록 중…' : '등록'}
      </button>
    </form>
  )
}

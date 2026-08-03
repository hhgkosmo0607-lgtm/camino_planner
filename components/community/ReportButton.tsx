'use client'

/**
 * ReportButton.tsx — 신고(필수 안전 기능, 03문서 "이 기능의 존재 이유보다
 * 우선한다"). 신고 내용은 신고자 본인과 관리자만 본다(RLS).
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReportTargetType } from '@/lib/schema'

export function ReportButton({
  userId,
  targetType,
  targetId,
}: {
  userId: string
  targetType: ReportTargetType
  targetId: string
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  if (status === 'done') {
    return <p className="text-[13px] text-muted">신고가 접수됐습니다.</p>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-md border border-vino px-3 text-[13px] font-medium text-vino"
      >
        ⚑ 신고
      </button>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) return
    setStatus('saving')
    const { error } = await supabase.from('reports').insert({
      reporter_profile_id: userId,
      target_type: targetType,
      target_id: targetId,
      reason,
    })
    setStatus(error ? 'error' : 'done')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md border border-vino/40 bg-vino/5 p-3">
      <label htmlFor={`report-reason-${targetId}`} className="block text-[13px] font-medium text-vino">
        신고 사유
      </label>
      <textarea
        id={`report-reason-${targetId}`}
        required
        rows={2}
        maxLength={1000}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-md border border-stone bg-white px-2 py-1.5 text-[14px] text-text"
      />
      {status === 'error' && <p className="text-[13px] text-vino">접수에 실패했습니다.</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="min-h-11 rounded-md border border-vino bg-vino px-3 text-[13px] font-medium text-white disabled:opacity-40"
        >
          신고 접수
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 rounded-md border border-stone px-3 text-[13px] text-muted"
        >
          취소
        </button>
      </div>
    </form>
  )
}

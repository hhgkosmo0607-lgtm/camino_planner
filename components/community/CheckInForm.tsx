'use client'

/**
 * CheckInForm.tsx — "오늘 이 마을에 있어요" 체크인.
 * ★ 정확한 GPS 좌표가 아니라 towns.ts의 마을 단위 신호만 남긴다(F-28 스펙
 *   "정확한 GPS 좌표가 아니라 '같은 구간을 걷는다' 정도만 노출").
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { towns } from '@/data/towns'

export function CheckInForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [townId, setTownId] = useState(towns[0]?.id ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) return
    setStatus('saving')
    const { error } = await supabase.from('checkins').insert({ profile_id: userId, town_id: townId })
    if (error) {
      setStatus('error')
      return
    }
    setStatus('idle')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="checkin-town" className="block text-[15px] font-medium text-text">
          지금 있는 마을
        </label>
        <select
          id="checkin-town"
          value={townId}
          onChange={(e) => setTownId(e.target.value)}
          className="mt-1 min-h-11 rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
        >
          {towns.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameKo} ({t.nameEs})
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={status === 'saving'}
        className="min-h-11 rounded-md border border-ink bg-ink px-4 text-[15px] font-medium text-white disabled:opacity-40"
      >
        {status === 'saving' ? '체크인 중…' : '여기 도착했어요'}
      </button>
      {status === 'error' && <p className="w-full text-[14px] text-vino">체크인에 실패했습니다.</p>}
    </form>
  )
}

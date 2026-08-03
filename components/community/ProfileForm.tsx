'use client'

/**
 * ProfileForm.tsx — 커뮤니티 프로필 만들기·수정.
 * ★ 실명·전화번호 입력란이 없다 — 닉네임만 받는다(F-28 스펙, 규칙 위반 방지를
 *   위해 UI 단에서부터 아예 실명 입력을 안 받는다).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { CommunityProfile, TravelMode } from '@/lib/schema'

const TRAVEL_MODE_LABEL: Record<TravelMode, string> = {
  FOOT: '도보',
  BIKE: '자전거',
  E_BIKE: '전기자전거',
  HANDBIKE: '전동 핸드바이크',
  WHEELCHAIR: '휠체어·조엘레트',
  HORSE: '말',
}

export function ProfileForm({ userId, initial }: { userId: string; initial: CommunityProfile | null }) {
  const router = useRouter()
  const [nickname, setNickname] = useState(initial?.nickname ?? '')
  const [travelMode, setTravelMode] = useState<TravelMode | ''>(initial?.travelMode ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) return
    setStatus('saving')
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      nickname,
      travel_mode: travelMode || null,
      start_date: startDate || null,
    })
    if (error) {
      setStatus('error')
      return
    }
    setStatus('idle')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nickname" className="block text-[15px] font-medium text-text">
          닉네임 (실명 아님)
        </label>
        <input
          id="nickname"
          required
          maxLength={30}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mt-1 w-full min-h-11 rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
        />
      </div>

      <div>
        <label htmlFor="travel-mode" className="block text-[15px] font-medium text-text">
          이동 방식 (선택)
        </label>
        <select
          id="travel-mode"
          value={travelMode}
          onChange={(e) => setTravelMode(e.target.value as TravelMode | '')}
          className="mt-1 w-full min-h-11 rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
        >
          <option value="">선택 안 함</option>
          {(Object.keys(TRAVEL_MODE_LABEL) as TravelMode[]).map((m) => (
            <option key={m} value={m}>
              {TRAVEL_MODE_LABEL[m]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="start-date" className="block text-[15px] font-medium text-text">
          출발일 (선택)
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 w-full min-h-11 rounded-md border border-stone bg-white px-3 py-2 text-[15px] text-text"
        />
      </div>

      {status === 'error' && <p className="text-[14px] text-vino">저장에 실패했습니다. 다시 시도해 주세요.</p>}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="min-h-11 rounded-md border border-ink bg-ink px-5 text-[15px] font-medium text-white disabled:opacity-40"
      >
        {status === 'saving' ? '저장 중…' : '저장'}
      </button>
    </form>
  )
}

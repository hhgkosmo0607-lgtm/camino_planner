'use client'

/** DeleteCheckInButton.tsx — 프로필 화면에서 내 체크인 기록 지우기. */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function DeleteCheckInButton({ checkInId }: { checkInId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleDelete = async () => {
    const supabase = createClient()
    if (!supabase) return
    setSaving(true)
    await supabase.from('checkins').delete().eq('id', checkInId)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={saving}
      className="min-h-11 rounded-md border border-stone px-3 text-[13px] text-muted disabled:opacity-40"
    >
      지우기
    </button>
  )
}

'use client'

/** UnblockButton.tsx — 프로필 화면의 차단 목록에서 차단 해제. */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function UnblockButton({ blockId }: { blockId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleUnblock = async () => {
    const supabase = createClient()
    if (!supabase) return
    setSaving(true)
    await supabase.from('blocks').delete().eq('id', blockId)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleUnblock}
      disabled={saving}
      className="min-h-11 rounded-md border border-stone px-3 text-[13px] text-muted disabled:opacity-40"
    >
      차단 해제
    </button>
  )
}

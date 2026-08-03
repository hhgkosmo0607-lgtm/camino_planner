'use client'

/** SignOutButton.tsx — 커뮤니티 로그아웃. */

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/community')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="min-h-11 rounded-md border border-stone px-4 text-[15px] text-muted"
    >
      로그아웃
    </button>
  )
}

/** app/community/login/page.tsx — 이메일 매직링크 로그인. */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isCommunityConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { MagicLinkForm } from '@/components/community/MagicLinkForm'

export const metadata: Metadata = {
  title: '커뮤니티 로그인 · 카미노 플래너',
  robots: { index: false },
}

export default async function CommunityLoginPage() {
  if (!isCommunityConfigured()) redirect('/community')
  const supabase = await createClient()
  if (!supabase) redirect('/community')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/community')

  return (
    <main className="min-h-screen bg-granite px-4 py-10">
      <div className="mx-auto max-w-md rounded-lg border border-stone bg-white px-5 py-6">
        <h1 className="font-display text-xl font-bold text-ink">커뮤니티 로그인</h1>
        <p className="mt-1 text-[15px] text-muted">계산기 등 다른 기능은 로그인 없이 그대로 쓸 수 있습니다.</p>
        <div className="mt-5">
          <MagicLinkForm />
        </div>
        <Link href="/community" className="mt-4 inline-block text-[14px] text-muted underline-offset-2 hover:underline">
          ← 커뮤니티로 돌아가기
        </Link>
      </div>
    </main>
  )
}

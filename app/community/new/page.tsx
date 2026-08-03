/** app/community/new/page.tsx — 게시판 글쓰기 (로그인 필요). */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isCommunityConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/community'
import { PostForm } from '@/components/community/PostForm'

export const metadata: Metadata = {
  title: '글쓰기 · 커뮤니티',
  robots: { index: false },
}

export default async function NewPostPage() {
  if (!isCommunityConfigured()) redirect('/community')
  const supabase = await createClient()
  if (!supabase) redirect('/community')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/community/login')

  const profile = await getMyProfile(supabase, user.id)
  if (!profile) redirect('/community/profile')

  return (
    <main className="min-h-screen bg-granite px-4 py-10">
      <div className="mx-auto max-w-xl rounded-lg border border-stone bg-white px-5 py-6">
        <h1 className="font-display text-xl font-bold text-ink">글쓰기</h1>
        <div className="mt-5">
          <PostForm userId={user.id} />
        </div>
      </div>
    </main>
  )
}

/** app/community/[postId]/page.tsx — 글 상세 + 댓글 + 신고·차단. */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isCommunityConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { getPostWithReplies } from '@/lib/community'
import { ReplyForm } from '@/components/community/ReplyForm'
import { ReportButton } from '@/components/community/ReportButton'
import { BlockButton } from '@/components/community/BlockButton'

export const metadata: Metadata = { robots: { index: false } }

function timeAgoKo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  if (!isCommunityConfigured()) redirect('/community')
  const supabase = await createClient()
  if (!supabase) redirect('/community')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await getPostWithReplies(supabase, postId)
  if (!result) notFound()
  const { post, replies } = result

  return (
    <main className="min-h-screen bg-granite px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <Link href="/community" className="text-[14px] text-muted underline-offset-2 hover:underline">
          ← 목록으로
        </Link>

        <article className="rounded-lg border border-stone bg-white px-5 py-6">
          <h1 className="font-display text-xl font-bold text-ink">{post.item.title}</h1>
          <p className="mt-1 text-[13px] text-muted">
            {post.nickname} · {timeAgoKo(post.item.createdAt)}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-text">{post.item.body}</p>

          {user && (
            <div className="mt-4 flex gap-2">
              <ReportButton userId={user.id} targetType="POST" targetId={post.item.id} />
              <BlockButton userId={user.id} blockedProfileId={post.item.profileId} />
            </div>
          )}
        </article>

        <section>
          <h2 className="text-[16px] font-medium text-ink">댓글 {replies.length}</h2>
          <ul className="mt-3 space-y-3">
            {replies.map(({ item, nickname }) => (
              <li key={item.id} className="rounded-md border border-stone bg-white px-4 py-3">
                <p className="text-[13px] text-muted">
                  {nickname} · {timeAgoKo(item.createdAt)}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[15px] text-text">{item.body}</p>
                {user && (
                  <div className="mt-2 flex gap-2">
                    <ReportButton userId={user.id} targetType="REPLY" targetId={item.id} />
                    <BlockButton userId={user.id} blockedProfileId={item.profileId} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            {user ? (
              <ReplyForm postId={post.item.id} userId={user.id} />
            ) : (
              <p className="text-[14px] text-muted">
                <Link href="/community/login" className="underline-offset-2 hover:underline">
                  로그인
                </Link>
                하면 댓글을 남길 수 있습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

/**
 * app/community/page.tsx — 커뮤니티 첫 화면. 게시판 목록 + 최근 체크인 디렉토리.
 *
 * ★ F-28(동행 매칭)의 첫걸음 — 실제 1:1 매칭은 아직 없다("추후", 03문서 2235행).
 * ★ 로그인 없이도 게시판·체크인 디렉토리는 열람할 수 있다. 글쓰기·체크인·
 *   신고·차단만 로그인이 필요하다(옵트인, 규칙 8).
 * ★ 이 프로젝트 사상 처음으로 서버 DB(Supabase)를 쓰는 화면이다 — 계산기 등
 *   핵심 기능은 이 화면과 완전히 무관하게 그대로 동작한다.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { isCommunityConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { listPosts, listRecentCheckIns } from '@/lib/community'
import { CheckInList } from '@/components/community/CheckInList'
import { PostList } from '@/components/community/PostList'
import { ToolNav } from '@/components/ToolNav'

export const metadata: Metadata = {
  title: '커뮤니티 · 카미노 순례자끼리 체크인·게시판',
  description: '같은 구간을 걷는 순례자들의 체크인 디렉토리와 게시판. 로그인은 이 기능을 쓰고 싶을 때만.',
  alternates: { canonical: '/community' },
}

export default async function CommunityPage() {
  if (!isCommunityConfigured()) {
    return (
      <main className="min-h-screen bg-granite px-4 py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-stone bg-white px-5 py-6 text-center">
          <p className="text-[17px] text-text">커뮤니티 기능이 아직 설정되지 않았습니다.</p>
          <Link href="/" className="mt-3 inline-block text-[15px] text-ink underline-offset-2 hover:underline">
            홈으로
          </Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  if (!supabase) return null // isCommunityConfigured()와 같은 조건이라 실질적으로 도달 안 함

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [posts, checkIns] = await Promise.all([listPosts(supabase), listRecentCheckIns(supabase)])

  return (
    <main className="min-h-screen bg-granite pb-16">
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">커뮤니티</h1>
          <p className="mt-1 text-[17px] text-white/70">같은 길을 걷는 순례자들의 체크인과 게시판.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <ToolNav current="/community" />

        <section className="rounded-lg border border-stone bg-white/60 px-4 py-3 text-[15px] text-muted">
          여기서 하는 로그인·글쓰기·체크인은 이 커뮤니티 기능에만 쓰입니다 — 일정 계산 등 다른 기능은 로그인
          없이 그대로 이용할 수 있습니다. 실명·전화번호는 요구하지 않습니다. 아직 실시간 1:1 매칭은 없고,
          체크인·게시판까지만 있습니다.
        </section>

        <div>
          {user ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/community/new"
                className="min-h-11 inline-flex items-center rounded-md border border-ink bg-ink px-4 text-[15px] font-medium text-white"
              >
                글쓰기
              </Link>
              <Link
                href="/community/profile"
                className="min-h-11 inline-flex items-center rounded-md border border-stone px-4 text-[15px] text-text"
              >
                내 프로필 · 체크인
              </Link>
            </div>
          ) : (
            <Link
              href="/community/login"
              className="min-h-11 inline-flex items-center rounded-md border border-ink bg-ink px-4 text-[15px] font-medium text-white"
            >
              로그인하고 참여하기
            </Link>
          )}
        </div>

        <section>
          <h2 className="text-[18px] font-medium text-ink">최근 체크인</h2>
          <p className="mt-1 text-[13px] text-muted">최근 2주. 정확한 위치가 아니라 마을 단위입니다.</p>
          <div className="mt-3">
            <CheckInList checkIns={checkIns} />
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-ink">게시판</h2>
          <div className="mt-3">
            <PostList posts={posts} />
          </div>
        </section>
      </div>
    </main>
  )
}

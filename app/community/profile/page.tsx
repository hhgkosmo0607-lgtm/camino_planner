/** app/community/profile/page.tsx — 내 프로필·체크인·차단 목록 관리 (로그인 필요). */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isCommunityConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile, getMyCheckIns, getMyBlocks } from '@/lib/community'
import { ProfileForm } from '@/components/community/ProfileForm'
import { CheckInForm } from '@/components/community/CheckInForm'
import { DeleteCheckInButton } from '@/components/community/DeleteCheckInButton'
import { UnblockButton } from '@/components/community/UnblockButton'
import { SignOutButton } from '@/components/community/SignOutButton'
import { towns } from '@/data/towns'

export const metadata: Metadata = { robots: { index: false } }

const townById = new Map(towns.map((t) => [t.id, t]))

export default async function CommunityProfilePage() {
  if (!isCommunityConfigured()) redirect('/community')
  const supabase = await createClient()
  if (!supabase) redirect('/community')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/community/login')

  const [profile, checkIns, blocks] = await Promise.all([
    getMyProfile(supabase, user.id),
    getMyCheckIns(supabase, user.id),
    getMyBlocks(supabase, user.id),
  ])

  return (
    <main className="min-h-screen bg-granite px-4 py-10">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-ink">내 프로필</h1>
          <SignOutButton />
        </div>

        {!profile && (
          <p className="rounded-md bg-flecha/10 px-4 py-3 text-[15px] text-text">
            아직 닉네임을 정하지 않았습니다. 아래에서 먼저 설정해 주세요 — 글쓰기·체크인 전에 필요합니다.
          </p>
        )}

        <section className="rounded-lg border border-stone bg-white px-5 py-6">
          <h2 className="text-[16px] font-medium text-ink">닉네임·이동 방식</h2>
          <div className="mt-4">
            <ProfileForm userId={user.id} initial={profile} />
          </div>
        </section>

        {profile && (
          <>
            <section className="rounded-lg border border-stone bg-white px-5 py-6">
              <h2 className="text-[16px] font-medium text-ink">체크인</h2>
              <div className="mt-4">
                <CheckInForm userId={user.id} />
              </div>
              <ul className="mt-4 space-y-2">
                {checkIns.map((c) => {
                  const town = townById.get(c.townId)
                  return (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-md border border-stone px-3 py-2 text-[14px] text-text"
                    >
                      <span>{town ? `${town.nameKo} (${town.nameEs})` : c.townId}</span>
                      <DeleteCheckInButton checkInId={c.id} />
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="rounded-lg border border-stone bg-white px-5 py-6">
              <h2 className="text-[16px] font-medium text-ink">차단 목록</h2>
              {blocks.length === 0 ? (
                <p className="mt-2 text-[14px] text-muted">차단한 사용자가 없습니다.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {blocks.map((b) => (
                    <li
                      key={b.blockId}
                      className="flex items-center justify-between rounded-md border border-stone px-3 py-2 text-[14px] text-text"
                    >
                      <span>{b.nickname}</span>
                      <UnblockButton blockId={b.blockId} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

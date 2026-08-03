import 'server-only'

// lib/community.ts — 커뮤니티(F-28 첫걸음) 서버 조회 헬퍼.
// ★ lib/planner/ 밖에 둔다 — DB 왕복(비동기 I/O)이라 순수 함수가 아니다(규칙 6).
// ★ 글쓰기·체크인·신고·차단 등 "쓰기"는 각 클라이언트 컴포넌트가 브라우저용
//   supabase 클라이언트로 직접 한다 — 이 파일은 읽기 전용 조합만 맡는다.
// ★ Supabase의 FK 조인 타입 추론에 기대지 않고, profiles를 별도로 조회해
//   JS에서 합친다 — supabase/types.ts가 아직 Relationships를 정의하지 않은
//   수기 타입이라 조인 타입이 느슨해질 수 있어서다.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'
import type { CommunityPost, CommunityReply, CheckIn, CommunityProfile } from './schema'

type Client = SupabaseClient<Database>

function toProfile(row: Database['public']['Tables']['profiles']['Row']): CommunityProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    travelMode: (row.travel_mode as CommunityProfile['travelMode']) ?? null,
    startDate: row.start_date,
    createdAt: row.created_at,
  }
}

function toPost(row: Database['public']['Tables']['posts']['Row']): CommunityPost {
  return { id: row.id, profileId: row.profile_id, title: row.title, body: row.body, createdAt: row.created_at }
}

function toReply(row: Database['public']['Tables']['replies']['Row']): CommunityReply {
  return { id: row.id, postId: row.post_id, profileId: row.profile_id, body: row.body, createdAt: row.created_at }
}

function toCheckIn(row: Database['public']['Tables']['checkins']['Row']): CheckIn {
  return { id: row.id, profileId: row.profile_id, townId: row.town_id, checkedInAt: row.checked_in_at }
}

async function nicknamesFor(supabase: Client, profileIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(profileIds)]
  if (uniqueIds.length === 0) return new Map()
  const { data } = await supabase.from('profiles').select('id, nickname').in('id', uniqueIds)
  return new Map((data ?? []).map((p) => [p.id, p.nickname]))
}

export interface WithNickname<T> {
  item: T
  nickname: string
}

const UNKNOWN_NICKNAME = '탈퇴한 사용자'

export async function listPosts(supabase: Client, limit = 50): Promise<WithNickname<CommunityPost>[]> {
  const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(limit)
  const posts = data ?? []
  const nicknames = await nicknamesFor(
    supabase,
    posts.map((p) => p.profile_id),
  )
  return posts.map((p) => ({ item: toPost(p), nickname: nicknames.get(p.profile_id) ?? UNKNOWN_NICKNAME }))
}

export async function getPostWithReplies(
  supabase: Client,
  postId: string,
): Promise<{ post: WithNickname<CommunityPost>; replies: WithNickname<CommunityReply>[] } | null> {
  const { data: postRow } = await supabase.from('posts').select('*').eq('id', postId).maybeSingle()
  if (!postRow) return null
  const { data: replyRows } = await supabase
    .from('replies')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  const replies = replyRows ?? []
  const nicknames = await nicknamesFor(supabase, [postRow.profile_id, ...replies.map((r) => r.profile_id)])
  return {
    post: { item: toPost(postRow), nickname: nicknames.get(postRow.profile_id) ?? UNKNOWN_NICKNAME },
    replies: replies.map((r) => ({ item: toReply(r), nickname: nicknames.get(r.profile_id) ?? UNKNOWN_NICKNAME })),
  }
}

// 최근 며칠 체크인 — "오늘 이 마을에 있어요" 디렉토리(F-28 스펙, GPS 좌표가
// 아니라 마을 단위 신호만).
export async function listRecentCheckIns(supabase: Client, days = 14): Promise<WithNickname<CheckIn>[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .gte('checked_in_at', since)
    .order('checked_in_at', { ascending: false })
    .limit(100)
  const checkins = data ?? []
  const nicknames = await nicknamesFor(
    supabase,
    checkins.map((c) => c.profile_id),
  )
  return checkins.map((c) => ({ item: toCheckIn(c), nickname: nicknames.get(c.profile_id) ?? UNKNOWN_NICKNAME }))
}

export async function getMyProfile(supabase: Client, userId: string): Promise<CommunityProfile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data ? toProfile(data) : null
}

export async function getMyCheckIns(supabase: Client, userId: string): Promise<CheckIn[]> {
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('profile_id', userId)
    .order('checked_in_at', { ascending: false })
  return (data ?? []).map(toCheckIn)
}

export interface BlockedProfileRow {
  blockId: string
  blockedProfileId: string
  nickname: string
}

export async function getMyBlocks(supabase: Client, userId: string): Promise<BlockedProfileRow[]> {
  const { data } = await supabase.from('blocks').select('*').eq('blocker_profile_id', userId)
  const blocks = data ?? []
  const nicknames = await nicknamesFor(
    supabase,
    blocks.map((b) => b.blocked_profile_id),
  )
  return blocks.map((b) => ({
    blockId: b.id,
    blockedProfileId: b.blocked_profile_id,
    nickname: nicknames.get(b.blocked_profile_id) ?? UNKNOWN_NICKNAME,
  }))
}

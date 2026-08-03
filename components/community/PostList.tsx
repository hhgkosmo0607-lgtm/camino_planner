/**
 * PostList.tsx — 게시판 목록. 서버에서 그대로 렌더된다(JS 없이도 목록·링크는
 * 보인다, 규칙 7). 상호작용(글쓰기·댓글)만 별도 클라이언트 컴포넌트가 맡는다.
 */

import Link from 'next/link'
import type { CommunityPost } from '@/lib/schema'
import type { WithNickname } from '@/lib/community'

function timeAgoKo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export function PostList({ posts }: { posts: WithNickname<CommunityPost>[] }) {
  if (posts.length === 0) {
    return <p className="text-[15px] text-muted">아직 글이 없습니다. 첫 글을 남겨보세요.</p>
  }
  return (
    <ul className="divide-y divide-stone rounded-lg border border-stone bg-white">
      {posts.map(({ item, nickname }) => (
        <li key={item.id}>
          <Link href={`/community/${item.id}`} className="block min-h-11 px-4 py-3 hover:bg-sand-2">
            <p className="text-[16px] font-medium text-text">{item.title}</p>
            <p className="mt-0.5 text-[13px] text-muted">
              {nickname} · {timeAgoKo(item.createdAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

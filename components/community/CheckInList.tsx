/**
 * CheckInList.tsx — 최근 체크인 디렉토리("오늘 이 마을에 있어요"). 마을 단위
 * 신호만 보여준다 — 정확한 GPS 좌표·실시간 위치는 없다(F-28 스펙).
 */

import type { CheckIn } from '@/lib/schema'
import type { WithNickname } from '@/lib/community'
import { towns } from '@/data/towns'

const townById = new Map(towns.map((t) => [t.id, t]))

function timeAgoKo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export function CheckInList({ checkIns }: { checkIns: WithNickname<CheckIn>[] }) {
  if (checkIns.length === 0) {
    return <p className="text-[15px] text-muted">최근 2주 안에 체크인한 순례자가 아직 없습니다.</p>
  }
  return (
    <ul className="space-y-1.5">
      {checkIns.map(({ item, nickname }) => {
        const town = townById.get(item.townId)
        return (
          <li
            key={item.id}
            className="flex min-h-11 items-center justify-between rounded-md border border-stone bg-white px-3 py-2 text-[14px]"
          >
            <span className="text-text">
              <span className="font-medium">{nickname}</span> ·{' '}
              {town ? `${town.nameKo} (${town.nameEs})` : item.townId}
            </span>
            <span className="text-muted">{timeAgoKo(item.checkedInAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}

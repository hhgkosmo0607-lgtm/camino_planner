'use client'

/**
 * FogMap.tsx — F-15 안개 지도(축소판). "여기 도착했어요"를 누르면 그 스팟이 열린다.
 *
 * ★ 실시간 GPS로 자동 개방하지 않는다 — 웹 트랙엔 라이브 내비게이션 지도 자체가
 *   없다(06문서 "지도·내비게이션 백엔드"는 Phase 3+ 착수 전). 대신 사용자가 직접
 *   "도착했어요"를 눌러 여는 방식이라 정직하다(자동 위치판정을 흉내내지 않는다).
 * ★ 규칙 8: 개방 기록은 이 기기의 localStorage에만 남는다. 서버로 안 보낸다.
 * ★ storyKo는 전부 source: 'GUIDEBOOK'(가이드북 출처) — 03문서 원안의 "실측 1인칭
 *   이야기"가 아니다. 화면에도 그대로 밝힌다(규칙 1).
 */

import { useEffect, useState } from 'react'
import type { Landmark } from '@/lib/schema'
import { loadFogState, revealLandmark, type FogState } from '@/lib/localLog'

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const mm = d.getMonth() + 1
  const dd = d.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${mi}`
}

export function FogMap({ landmarks }: { landmarks: Landmark[] }) {
  const [fog, setFog] = useState<FogState>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 서버 렌더는 localStorage를 모르니 빈 상태로 그리고, 마운트 후에만 실제 값을
    // 읽는다 — 하이드레이션 불일치를 피하려는 의도적 2단계 렌더.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFog(loadFogState())
    setMounted(true)
  }, [])

  const revealedCount = mounted ? Object.keys(fog).length : 0

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[13px] font-medium tracking-wide text-muted">
          이 기기에서 연 스팟 (서버로 보내지 않음)
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums text-text">
          {revealedCount}
          <span className="text-[13px] font-normal text-muted"> / {landmarks.length}</span>
        </span>
      </div>

      <ul className="space-y-2">
        {landmarks.map((l) => {
          const revealedAt = mounted ? fog[l.id] : undefined
          return (
            <li key={l.id} className="rounded-lg border border-stone bg-white px-4 py-3">
              {revealedAt ? (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="text-[17px] font-semibold text-text">
                      {l.order}. {l.nameKo} <span className="text-[13px] font-normal text-muted">{l.nameEs}</span>
                    </span>
                    <span className="font-mono text-[13px] tabular-nums text-muted">{fmtDateTime(revealedAt)}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-text">{l.storyKo}</p>
                  {l.source !== 'FIELD' && (
                    <p className="mt-1.5 text-[12px] text-muted">
                      가이드북 출처 요약입니다 — 실측 1인칭 이야기는 아직 없습니다.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] text-muted">
                    ☁ {l.order}. {l.nameKo}{' '}
                    <span className="font-mono text-[13px] tabular-nums">· km {l.km.toFixed(1)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFog(revealLandmark(l.id))}
                    className="min-h-11 flex-none rounded-md border border-ink px-3 py-1.5 text-[13px] font-medium text-ink"
                  >
                    여기 도착했어요
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

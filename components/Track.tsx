'use client'

/**
 * Track.tsx — 서버 컴포넌트 페이지에서 조회성 이벤트를 보낼 때 쓰는 투명 트래커.
 * 계산·렌더는 서버가 하고(규칙 7), 이 컴포넌트는 결과가 바뀔 때 track()만 호출한다.
 */

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

type EventData = Record<string, string | number | boolean>

export function Track({ event, data }: { event: string; data?: EventData }) {
  const key = data ? JSON.stringify(data) : ''

  useEffect(() => {
    track(event, data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key])

  return null
}

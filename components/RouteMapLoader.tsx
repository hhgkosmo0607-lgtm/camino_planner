'use client'

/**
 * RouteMapLoader.tsx — RouteMap을 ssr:false로 동적 로드하는 얇은 래퍼.
 *
 * ★ next/dynamic의 `{ ssr: false }`는 서버 컴포넌트 안에서 직접 못 쓴다(Next.js
 *   제약) — 그래서 이 클라이언트 컴포넌트를 한 겹 두고, 서버 컴포넌트(app/plan/
 *   page.tsx)는 이 래퍼만 평범하게 import 한다. RouteMap 자체(maplibre-gl 로드)는
 *   브라우저에서만 실행돼야 하므로(캔버스/WebGL) 서버 렌더 자체를 건너뛴다.
 */

import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('@/components/RouteMap').then((m) => m.RouteMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-lg border border-stone bg-granite text-[15px] text-muted">
      지도를 불러오는 중…
    </div>
  ),
})

export function RouteMapLoader(props: { highlightTownIds?: string[]; height?: number }) {
  return <RouteMap {...props} />
}

/**
 * app/fog/page.tsx — 안개 지도 (F-15 축소판).
 *
 * ★ 라이브 지도(MapLibre 등)는 아직 없다(06문서 "지도·내비게이션 백엔드"는
 *   Phase 3+ 착수 전) — 그래서 시각적 "안개" 그래픽이 아니라 19곳 목록으로
 *   보여준다. 경로·화살표·알베르게 표시는 이 페이지와 무관하게 /plan·/town·
 *   /stage에서 항상 그대로 보인다 — 안개가 뭔가를 가리는 게 아니다.
 * ★ data/landmarks.ts는 전부 source: 'GUIDEBOOK' — 화면에도 그대로 밝힌다(규칙 1).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FogMap } from '@/components/FogMap'
import { landmarks } from '@/data/landmarks'

export const metadata: Metadata = {
  title: '안개 지도 · 카미노 프랑스 길 상징적 장소 19곳',
  description:
    '생장피드포르부터 산티아고까지, 걸으면서 도착한 곳을 직접 열어보는 안개 지도. 각 장소의 역사·유래를 함께 볼 수 있습니다.',
  alternates: { canonical: '/fog' },
}

export default function FogPage() {
  return (
    <main className="min-h-screen bg-granite pb-16">
      <div className="bg-ink px-5 py-7 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold">안개 지도</h1>
          <p className="mt-1 text-[17px] text-white/70">
            생장피드포르부터 산티아고까지 상징적인 장소 19곳. 도착한 곳을 직접 열어보세요.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-lg border border-stone bg-white/60 px-4 py-3 text-[15px] text-muted">
          경로·화살표·알베르게 표시는 이 페이지와 상관없이 일정 화면에서 항상 그대로 보입니다. 여기 열고 닫는
          건 &ldquo;이야기&rdquo;뿐입니다. 개방 기록은 이 기기에만 저장되고 서버로 보내지 않습니다.
        </section>

        <FogMap landmarks={landmarks} />

        <div className="text-[15px] text-muted">
          <Link href="/plan" className="underline-offset-2 hover:underline">
            일정으로 돌아가기 →
          </Link>
        </div>
      </div>
    </main>
  )
}

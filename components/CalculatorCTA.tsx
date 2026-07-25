/**
 * CalculatorCTA.tsx — 모든 SEO 페이지 하단의 일정 계산기 유도.
 * 검색으로 들어온 사용자를 핵심 기능(/plan)으로 보낸다.
 */

import { brand } from '@/config/brand'

export function CalculatorCTA({ href = '/plan' }: { href?: string }) {
  return (
    <section className="mt-10 rounded-lg border border-ink bg-ink px-5 py-6 text-white">
      <h2 className="font-display text-lg">부상 없는 완주를 위한 일정을 만들어 보세요</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-white/75">
        출발지와 하루 목표 거리만 정하면, 오르막·내리막을 반영해 무리 없는 구간으로 나눠 드립니다.
        가입도 결제도 없습니다.
      </p>
      <a
        href={href}
        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-white px-5 py-2 text-[15px] font-semibold text-ink"
      >
        {brand.nameKo} 일정 계산기 열기
      </a>
    </section>
  )
}

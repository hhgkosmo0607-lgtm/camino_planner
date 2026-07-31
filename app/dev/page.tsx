/**
 * app/dev/page.tsx — 컴포넌트 렌더 확인용 개발 페이지 (P2 완료 조건).
 *
 * 실제 데이터(towns/profiles)로 buildPlan 을 돌려 시그니처 컴포넌트를 전부 렌더한다.
 * 서버 컴포넌트 — useEffect/클라이언트 상태 없이 서버에서 계산해 렌더한다(SEO 규칙 7).
 * 배포용 페이지가 아니므로 검색엔진에서 제외한다.
 */

import type { Metadata } from 'next'
import { Mojon } from '@/components/Mojon'
import { Elevation } from '@/components/Elevation'
import { StageCard } from '@/components/StageCard'
import { RiskGauge } from '@/components/RiskGauge'
import { Shell } from '@/components/Shell'
import { buildPlan } from '@/lib/planner/split'
import { towns } from '@/data/towns'
import type { PlanInput, MobilityProfile } from '@/lib/schema'

const townKm = (id: string): number => towns.find((t) => t.id === id)?.km ?? 0

export const metadata: Metadata = {
  title: '컴포넌트 미리보기 (dev)',
  robots: { index: false, follow: false },
}

const foot: MobilityProfile = {
  mode: 'FOOT',
  maxKmPerDay: 40,
  needsSupportVehicle: false,
  needsCompanion: false,
  avoidSurfaces: [],
  bagTransferRequired: false,
}

const input: PlanInput = {
  startTownId: 'saint-jean-pied-de-port',
  mobility: foot,
  targetKmPerDay: 24,
  fitness: 'normal',
  restDays: 1,
  useBagTransfer: 'none',
  plannedTransport: [
    {
      fromTownId: 'burgos',
      toTownId: 'leon',
      mode: 'BUS',
      reasonKo: '메세타 건너뛰기',
      skippedKm: 180,
      costEur: 25,
    },
  ],
}

export default function DevPage() {
  const plan = buildPlan(input)
  const walkMarks = plan.stages
    .filter((s) => !s.isRestDay && !s.transport)
    .map((s) => townKm(s.toTownId))

  return (
    <main className="min-h-screen bg-granite pb-16">
      <Mojon
        title="카미노 플래너"
        remainingKm={plan.totalKm}
        walkedKm={0}
        totalKm={plan.totalKm}
        totalDays={plan.totalDays}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-2 text-muted">
          <Shell size={18} className="text-flecha" />
          <span className="text-[13px] tracking-wide">컴포넌트 미리보기 · 생장 출발 24km/일</span>
        </div>

        <RiskGauge
          score={plan.injuryRiskScore}
          quality={plan.riskDataQuality}
          advice={plan.advice}
        />

        <section>
          <h2 className="mb-2 font-display text-lg text-text">전체 고도 단면</h2>
          <div className="rounded-lg border border-stone bg-white p-3">
            <Elevation
              fromTownId="saint-jean-pied-de-port"
              toTownId="santiago-de-compostela"
              marks={walkMarks}
              height={150}
            />
            <div className="mt-2 flex justify-between font-mono text-[13px] tabular-nums text-muted">
              <span>생장 (0km)</span>
              <span>산티아고 (773km)</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-text">
            에타파 <span className="text-[13px] text-muted">Etapa · {plan.totalDays}일</span>
          </h2>
          <div className="space-y-2.5">
            {plan.stages.map((s) => (
              <StageCard key={s.dayNo} stage={s} currentParams={new URLSearchParams()} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

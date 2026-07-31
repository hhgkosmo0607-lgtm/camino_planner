/**
 * app/plan/page.tsx — 일정 계산기.
 *
 * ★ 서버 컴포넌트에서 계산한다 (규칙 7). searchParams(URL)가 진실의 원천(규칙 8).
 *   JS를 꺼도 결과가 보인다. 계산 로직은 lib/planner, 상태는 URL에만 있다.
 * ★ riskDataQuality === 'ESTIMATED' 이면 injuryRiskScore를 숫자로 표시하지 않는다(규칙 3).
 */

import type { Metadata } from 'next'
import { Mojon } from '@/components/Mojon'
import { Elevation } from '@/components/Elevation'
import { StageCard } from '@/components/StageCard'
import { RiskGauge } from '@/components/RiskGauge'
import { PlanControls } from '@/components/PlanControls'
import { ShareButton } from '@/components/ShareButton'
import { Track } from '@/components/Track'
import { EmailCapture } from '@/components/EmailCapture'
import { AccessDay0 } from '@/components/AccessDay0'
import { BudgetSummary } from '@/components/BudgetSummary'
import { buildPlan } from '@/lib/planner/split'
import { decodePlan } from '@/lib/url'
import { accessRoutesTo, findAccessRoute } from '@/lib/geo'
import { towns } from '@/data/towns'
import { brand } from '@/config/brand'

type SP = Promise<Record<string, string | string[] | undefined>>

function toParams(sp: Record<string, string | string[] | undefined>): URLSearchParams {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') p.set(k, v)
    else if (Array.isArray(v) && v[0]) p.set(k, v[0])
  }
  return p
}

const townKo = (id: string) => towns.find((t) => t.id === id)?.nameKo ?? id
const townKm = (id: string) => towns.find((t) => t.id === id)?.km ?? 0

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const input = decodePlan(toParams(await searchParams))
  const plan = buildPlan(input)
  const startKo = townKo(input.startTownId)
  const title = `산티아고 순례길 ${plan.totalDays}일 일정 — ${startKo}에서 산티아고까지 ${plan.walkedKm.toFixed(0)}km`
  const description = `${startKo} 출발, 걸은 거리 ${plan.walkedKm.toFixed(0)}km. 부상 없는 완주를 목표로 구간을 나눈 일정입니다.`
  return {
    title,
    description,
    openGraph: { title, description },
  }
}

export default async function PlanPage({ searchParams }: { searchParams: SP }) {
  const params = toParams(await searchParams)
  const input = decodePlan(params)
  const plan = buildPlan(input)

  const mode: 'km' | 'days' = input.totalDays != null ? 'days' : 'km'
  const walking = plan.stages.filter((s) => !s.isRestDay && !s.transport)
  const avgKm = walking.length > 0 ? plan.walkedKm / walking.length : 0
  const skip: '' | 'sahagun~leon' | 'burgos~leon' = input.plannedTransport.some(
    (t) => t.fromTownId === 'burgos' && t.toTownId === 'leon',
  )
    ? 'burgos~leon'
    : input.plannedTransport.some((t) => t.fromTownId === 'sahagun' && t.toTownId === 'leon')
      ? 'sahagun~leon'
      : ''
  const marks = walking.map((s) => townKm(s.toTownId))
  const startKm = townKm(input.startTownId)

  // F-24 Day 0 — 접근 교통 경로는 현재 생장피드포르행만 조사돼 있다(data/access.ts).
  // 다른 출발지(레온·사리아)를 고른 경우엔 해당 없어 렌더하지 않는다.
  const accessRoutes = accessRoutesTo(input.startTownId)
  const arParam = params.get('ar')
  const selectedAccessRouteId = arParam && findAccessRoute(arParam) ? arParam : null

  return (
    <main className="min-h-screen bg-granite pb-16">
      <Track
        event="plan_calculated"
        data={{
          route: input.startTownId,
          targetKm: input.targetKmPerDay ?? 0,
          fitness: input.fitness,
          ...(plan.riskDataQuality !== 'ESTIMATED' ? { riskScore: Math.round(plan.injuryRiskScore) } : {}),
        }}
      />
      <Mojon
        title={brand.nameKo}
        remainingKm={plan.walkedKm}
        walkedKm={0}
        totalKm={plan.totalKm}
        totalDays={plan.totalDays}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <PlanControls
          startTownId={input.startTownId}
          mode={mode}
          dailyKm={input.targetKmPerDay ?? 24}
          totalDays={input.totalDays ?? 34}
          fitness={input.fitness}
          restDays={input.restDays}
          skip={skip}
          startDate={input.startDate}
        />

        {/* 요약 */}
        <section className="grid grid-cols-3 gap-3">
          <Stat value={String(plan.totalDays)} label="총 일수" />
          <Stat value={plan.walkedKm.toFixed(0)} unit="km" label="걸은 거리" />
          <Stat value={avgKm.toFixed(1)} unit="km" label="하루 평균" />
        </section>

        <RiskGauge score={plan.injuryRiskScore} quality={plan.riskDataQuality} advice={plan.advice} />

        {/* 콤포스텔라 요건 */}
        <CompostelaNotice
          eligible={plan.compostelaEligible}
          walkedKm={plan.walkedKm}
          doubleStamp={plan.doubleStampPerDay}
        />

        <BudgetSummary totalDays={plan.totalDays} />

        <div className="text-[15px] text-muted">
          <a href="/fog" className="underline-offset-2 hover:underline">
            안개 지도 — 상징적 장소 19곳 열어보기 →
          </a>
        </div>

        {/* 고도 단면 */}
        <section>
          <h2 className="mb-2 font-display text-lg text-text">전체 고도 단면</h2>
          <div className="rounded-lg border border-stone bg-white p-3">
            <Elevation
              fromTownId={input.startTownId}
              toTownId="santiago-de-compostela"
              marks={marks}
              height={150}
            />
            <div className="mt-2 flex justify-between font-mono text-[12px] tabular-nums text-muted">
              <span>{townKo(input.startTownId)} ({startKm.toFixed(0)}km)</span>
              <span>산티아고 (773km)</span>
            </div>
          </div>
        </section>

        {/* 구간 목록 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-text">
              에타파{' '}
              <span className="text-[13px] text-muted" data-testid="plan-total-days">
                Etapa · {plan.totalDays}일
              </span>
            </h2>
            <div className="flex gap-2">
              <a
                href={`/plan/print?${params.toString()}`}
                className="inline-flex min-h-11 items-center rounded-md border border-stone px-4 py-2 text-[15px] font-medium text-ink"
              >
                인쇄용 보기
              </a>
              <ShareButton />
            </div>
          </div>
          <div className="space-y-2.5">
            {accessRoutes.length > 0 && (
              <AccessDay0
                routes={accessRoutes}
                selectedRouteId={selectedAccessRouteId}
                currentParams={params}
              />
            )}
            {plan.stages.map((s) => (
              <StageCard key={s.dayNo} stage={s} currentParams={params} />
            ))}
          </div>
        </section>

        {process.env.RESEND_API_KEY && <EmailCapture />}
      </div>
    </main>
  )
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div className="rounded-lg border border-stone bg-white px-4 py-3 text-center">
      <div className="font-mono text-2xl font-semibold tabular-nums leading-none text-text">
        {value}
        {unit && <span className="ml-0.5 text-[13px] font-normal text-muted">{unit}</span>}
      </div>
      <div className="mt-1 text-[13px] text-muted">{label}</div>
    </div>
  )
}

function CompostelaNotice({
  eligible,
  walkedKm,
  doubleStamp,
}: {
  eligible: boolean
  walkedKm: number
  doubleStamp: boolean
}) {
  if (!eligible) {
    return (
      <section className="rounded-lg border border-vino/40 bg-vino/5 px-4 py-3 text-[17px] leading-relaxed text-text">
        <b className="text-vino">콤포스텔라 요건 미충족.</b> 완주 증서를 받으려면 산티아고까지
        연속으로 100km 이상 걸어야 합니다 (현재 걸은 거리 {walkedKm.toFixed(0)}km). 이동수단으로
        건너뛴 구간은 도보 거리에서 제외됩니다.
      </section>
    )
  }
  return (
    <section className="rounded-lg border border-moss/40 bg-moss/5 px-4 py-3 text-[17px] leading-relaxed text-text">
      <b className="text-moss">콤포스텔라 발급 요건 충족.</b> 산티아고까지 연속 도보{' '}
      {walkedKm.toFixed(0)}km입니다.{' '}
      {doubleStamp
        ? '최소 거리에 가까운 일정이라 크레덴시알에 하루 도장 2개를 받아야 합니다.'
        : '하루 도장 1개면 충분합니다 (총 도보 거리 기준).'}
    </section>
  )
}

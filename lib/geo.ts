/**
 * geo.ts — SEO 페이지(마을·구간·루트)가 공유하는 데이터 조회 헬퍼.
 *
 * 순수 조회만. 정적 towns/profiles 만 읽는다. fetch/window 없음.
 * ★ 없는 정보(숙소 등)는 여기서 지어내지 않는다. 페이지가 "정보 확인 중"으로 표시.
 */

import { towns } from '../data/towns'
import { profiles } from '../data/profiles'
import { albergues } from '../data/albergues'
import { transitOptions } from '../data/transit'
import type { Town, SegmentProfile, Service, Albergue, AlbergueType, TransitOption } from './schema'

export const SANTIAGO_ID = 'santiago-de-compostela'
export const TOTAL_KM = 773.1

export const SERVICE_LABEL: Record<Service, string> = {
  WATER: '식수',
  BAR: '바·식당',
  SHOP: '상점',
  PHARMACY: '약국',
  ATM: 'ATM',
  BAG_TRANSFER: '배낭 배송',
  MEDICAL: '의료시설',
  MASS: '순례자 미사',
}

export const ALBERGUE_TYPE_LABEL: Record<AlbergueType, string> = {
  MUNICIPAL: '지자체 공립',
  XUNTA: 'Xunta 공립',
  PARISH: '본당',
  MONASTERY: '수도원',
  PRIVATE: '사립',
  DONATIVO: '기부제',
}

export function getTown(slug: string): Town | undefined {
  return towns.find((t) => t.id === slug)
}

/** 마을의 알베르게 목록. 없으면 빈 배열(화면이 "정보 확인 중"으로 표시, 규칙 1). */
export function getAlbergues(townId: string): Albergue[] {
  return albergues.filter((a) => a.townId === townId)
}

/**
 * 마을의 실측 침대 수 합계(F-02). beds가 확인된 알베르게만 더한다 — 알베르게
 * 자체가 없거나(마을 정보 없음) 전부 beds:null이면 null(지어내지 않음, 규칙 1).
 * 일부만 beds가 확인된 마을은 확인된 것만 더한 "최소치"라 실제보다 적을 수 있다.
 */
export function totalBedsForTown(townId: string): number | null {
  const known = getAlbergues(townId).filter((a) => a.beds != null)
  if (known.length === 0) return null
  return known.reduce((sum, a) => sum + (a.beds ?? 0), 0)
}

/**
 * 두 마을 사이 실제 버스·기차 노선(F-26). 조사해둔 구간(현재 부르고스~레온,
 * 사아군~레온)만 찾고, 없으면 빈 배열 — 지어내지 않고 일정 화면이 일반 문구로
 * 폴백하게 둔다.
 */
export function findTransitOptions(fromTownId: string, toTownId: string): TransitOption[] {
  return transitOptions.filter((t) => t.fromTownId === fromTownId && t.toTownId === toTownId)
}

/** km 오름차순에서 이전/다음 마을. */
export function townNeighbors(slug: string): { prev?: Town; next?: Town } {
  const i = towns.findIndex((t) => t.id === slug)
  if (i < 0) return {}
  return { prev: i > 0 ? towns[i - 1] : undefined, next: i < towns.length - 1 ? towns[i + 1] : undefined }
}

export const remainingKm = (t: Town): number => Math.round((TOTAL_KM - t.km) * 10) / 10

// ── 구간(연속 마을쌍 81개) ──────────────────────────────────
export interface Stage {
  from: Town
  to: Town
  profile: SegmentProfile
  slug: string
}

const STAGE_SEP = '-to-'
const stageSlug = (fromId: string, toId: string) => `${fromId}${STAGE_SEP}${toId}`

/** 연속 마을쌍 81개. profiles(연속쌍)와 1:1. */
export function allStages(): Stage[] {
  const out: Stage[] = []
  for (let i = 0; i < towns.length - 1; i++) {
    const from = towns[i]
    const to = towns[i + 1]
    const profile = profiles.find((p) => p.fromTownId === from.id && p.toTownId === to.id)
    if (!profile) continue
    out.push({ from, to, profile, slug: stageSlug(from.id, to.id) })
  }
  return out
}

const STAGE_BY_SLUG = new Map(allStages().map((s) => [s.slug, s]))
export const getStage = (slug: string): Stage | undefined => STAGE_BY_SLUG.get(slug)

export function estimatedMinutes(distanceKm: number, ascent: number, descent: number): number {
  return Math.round((distanceKm / 4.2) * 60 + ascent / 8 + descent / 20)
}

/** 구간 난이도 (부상 관점: 내리막 가중). 표시용 라벨. */
export function difficultyKo(p: SegmentProfile, distanceKm: number): string {
  const load = p.ascent + p.descent * 1.4
  if (p.descent > 500 || p.ascent > 600) return '어려움'
  if (load > 700 || distanceKm > 28) return '다소 어려움'
  if (load > 350 || distanceKm > 22) return '보통'
  return '쉬움'
}

// ── 루트 3개 (Phase 1은 프랑스 길 하나, 출발점 3가지) ─────────
export interface RouteInfo {
  slug: string
  nameKo: string
  nameEs: string
  startTownId: string
  standardDays: number
  summaryKo: string
}

export const ROUTES: RouteInfo[] = [
  {
    slug: 'camino-frances',
    nameKo: '프랑스 길 전 구간',
    nameEs: 'Camino Francés',
    startTownId: 'saint-jean-pied-de-port',
    standardDays: 34,
    summaryKo: '피레네를 넘어 생장에서 산티아고까지 걷는 가장 대표적인 순례길입니다.',
  },
  {
    slug: 'desde-leon',
    nameKo: '레온에서 출발',
    nameEs: 'Camino desde León',
    startTownId: 'leon',
    standardDays: 14,
    summaryKo: '메세타를 지나 레온에서 시작해 갈리시아 산길을 넘는 후반부 구간입니다.',
  },
  {
    slug: 'sarria-100km',
    nameKo: '사리아 100km',
    nameEs: 'Sarria a Santiago',
    startTownId: 'sarria',
    standardDays: 5,
    summaryKo: '콤포스텔라 최소 거리(100km)를 채우는 가장 인기 있는 출발점입니다.',
  },
]

export const getRoute = (slug: string): RouteInfo | undefined => ROUTES.find((r) => r.slug === slug)

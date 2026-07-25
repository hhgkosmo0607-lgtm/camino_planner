/**
 * sitemap.ts — 모든 페이지를 검색엔진에 알린다.
 * ★ 새 페이지를 만들면 여기 포함되는지 반드시 확인한다 (CLAUDE.md 규칙 7).
 */

import type { MetadataRoute } from 'next'
import { towns } from '@/data/towns'
import { allStages, ROUTES } from '@/lib/geo'

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://camino.example'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/plan'].map((p) => ({
    url: `${BASE_URL}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.9,
  }))

  const routePages = ROUTES.map((r) => ({
    url: `${BASE_URL}/route/${r.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const townPages = towns.map((t) => ({
    url: `${BASE_URL}/town/${t.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const stagePages = allStages().map((s) => ({
    url: `${BASE_URL}/stage/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...routePages, ...townPages, ...stagePages]
}

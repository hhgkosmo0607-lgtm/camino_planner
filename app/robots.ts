/**
 * robots.ts — 크롤러 허용 + sitemap 위치 안내.
 * /dev, /plan/print 등 인덱싱 불필요 페이지는 각 페이지 metadata의 robots로 제외한다.
 */

import type { MetadataRoute } from 'next'
import { BASE_URL } from './sitemap'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dev', '/plan/print'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

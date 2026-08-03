import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * 06_개발가이드.md "접근성 테스트" 표: axe-core로 심각도 critical/serious 0건을
 * CI에서 자동 확인한다. 181개 전 페이지가 아니라 화면 템플릿 대표 1개씩만 훑는다
 * — 마을·구간 82/81개는 같은 컴포넌트를 재사용하므로 반복해도 새 신호가 없다.
 */
const PAGES = [
  '/',
  '/plan?start=saint-jean-pied-de-port&mode=km&d=24&f=normal&rest=1',
  '/plan/print?start=saint-jean-pied-de-port&mode=km&d=24&f=normal&rest=1',
  '/town/sarria',
  '/stage/saint-jean-pied-de-port-to-orisson',
  '/route/camino-frances',
  '/tools/cost',
  '/tools/pack',
  '/tools/timeline',
  '/tools/access',
  '/tools/phrases',
  '/tools/luggage',
  '/fog',
  '/cards',
  '/community', // Supabase 키 없는 테스트 환경에서는 "설정 안 됨" 안내만 렌더된다
  '/privacy',
]

for (const path of PAGES) {
  test(`접근성: ${path} — critical/serious 0건`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const bad = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    if (bad.length > 0) {
      const detail = bad
        .map((v) => `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length}곳)`)
        .join('\n')
      throw new Error(`critical/serious 접근성 위반 발견:\n${detail}`)
    }
    expect(bad).toHaveLength(0)
  })
}

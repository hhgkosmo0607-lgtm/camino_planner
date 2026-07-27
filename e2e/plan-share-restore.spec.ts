import { test, expect } from '@playwright/test'

/**
 * 06_개발가이드.md E2E 시나리오 1: 일정 생성 → 공유 → 복원.
 * 상태가 URL에만 있다(규칙 8)는 전제를 검증한다 — 클립보드 권한에
 * 기대지 않고, 컨트롤 변경 후의 URL을 새 브라우저 컨텍스트(=새 탭 격리)에서
 * 열어 같은 결과가 나오는지로 확인한다.
 */
test('일정 생성 → 링크로 새 탭에서 열기 → 동일 결과', async ({ page, browser }) => {
  await page.goto('/plan?start=saint-jean-pied-de-port&mode=km&d=24&f=normal&rest=2')

  const totalDays = page.getByTestId('plan-total-days')
  await expect(totalDays).toContainText('일')

  // 컨트롤을 바꿔 일정을 재계산시킨다 (체력: 빠르게) — 입력이 sr-only(화면엔 안 보이고 스크린리더에만 읽히는 요소)라 라벨을 클릭한다
  await page.getByText('빠르게', { exact: true }).click()
  await expect(page).toHaveURL(/f=high/)

  const changedTitle = await page.title()
  const changedTotalDays = await totalDays.textContent()
  const sharedUrl = page.url()

  // "새 탭"을 세션·쿠키 없이 완전히 새로 연다
  const freshContext = await browser.newContext()
  const freshPage = await freshContext.newPage()
  await freshPage.goto(sharedUrl)

  await expect(freshPage).toHaveTitle(changedTitle)
  await expect(freshPage.getByTestId('plan-total-days')).toHaveText(changedTotalDays ?? '')

  await freshContext.close()
})

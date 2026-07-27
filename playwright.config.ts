import { defineConfig, devices } from '@playwright/test'

/**
 * 06_개발가이드.md "E2E — 3개 핵심 시나리오만" 중 현재 구현된 기능으로
 * 실행 가능한 시나리오만 다룬다. 갈림길·Plan B 시나리오는 해당 UI가
 * Phase 2·3에서 만들어지면 추가한다.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})

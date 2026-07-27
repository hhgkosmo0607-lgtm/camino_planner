import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // e2e/ 는 Playwright 전용 스펙이라 vitest 대상에서 뺀다
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})

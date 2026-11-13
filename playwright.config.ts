import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  webServer: {
    command:
      'VITE_BASE_PATH=starter-kit npm run build && VITE_BASE_PATH=starter-kit npm run preview -- --port 4174',
    url: 'http://127.0.0.1:4174/starter-kit/',
    reuseExistingServer: false,
  },
})

import type { PlaywrightTestConfig } from '@playwright/test'

const headless = process.env.HEADLESS !== 'false'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'cross-env MOCK_EXPORT=1 npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
  testMatch: /.*\.spec\.ts/,
  use: {
    baseURL,
    headless,
  },
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
}

export default config

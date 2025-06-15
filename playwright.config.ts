import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'MOCK_EXPORT=1 npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
  testMatch: /.*\.spec\.ts/,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
}

export default config

import { test, expect } from '@playwright/test'

test('login page has email and password fields', async ({ page }) => {
  await page.goto('/login')
  await page.waitForSelector('input#email', { timeout: 50000 })
  await page.waitForSelector('input#password', { timeout: 50000 })
  await expect(page.locator('input#email')).toBeVisible()
  await expect(page.locator('input#password')).toBeVisible()
})

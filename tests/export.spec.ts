import { test, expect, Page } from '@playwright/test'

async function mockExport(page: Page) {
  await page.addInitScript(() => {
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string' && input.includes('/baustellen/export') && init?.method === 'POST') {
        const body = JSON.stringify({ success: true, data: 'col1,col2\n', filename: 'data.csv' })
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
      }
      return originalFetch(input, init)
    }
  })
}

test.skip('Export-Dialog lädt CSV herunter', async ({ page }) => {
  await mockExport(page)
  await page.goto('/baustellen/export')
  await page.getByRole('button', { name: 'Exportieren' }).first().click()
  await expect(page.getByText('Baustelle exportieren')).toBeVisible()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportieren' }).last().click(),
  ])
  expect(download.suggestedFilename()).toBe('data.csv')
})

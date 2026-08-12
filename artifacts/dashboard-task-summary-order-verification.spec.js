import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Task Summary appears directly above Quick Actions on the Dashboard', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1267, height: 700 })
  await page.goto(`${baseUrl}/dashboard`)

  const mainSections = page.locator('main section')
  await expect(mainSections).toHaveCount(5)
  await expect(mainSections.nth(0)).toHaveAttribute('id', 'task-summary')
  await expect(mainSections.nth(1)).toHaveAttribute('id', 'quick-actions')

  const taskSummary = page.locator('#task-summary')
  const quickActions = page.locator('#quick-actions')
  const taskSummaryBox = await taskSummary.boundingBox()
  const quickActionsBox = await quickActions.boundingBox()
  expect(taskSummaryBox.y + taskSummaryBox.height).toBeLessThanOrEqual(quickActionsBox.y)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(mainSections.nth(0)).toHaveAttribute('id', 'task-summary')
  await expect(mainSections.nth(1)).toHaveAttribute('id', 'quick-actions')

  expect(errors, 'Dashboard section-order workflow produced console/page errors').toEqual([])
})

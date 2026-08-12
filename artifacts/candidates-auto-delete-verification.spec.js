import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

async function openCandidates(page, errors) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/candidates`)
  await expect(page.locator('#all-candidates article')).toHaveCount(10)
}

test('Add Candidate opens the CV Builder page', async ({ page }) => {
  const errors = []
  await openCandidates(page, errors)

  await page.getByRole('button', { name: 'Add Candidate' }).click()

  await expect(page).toHaveURL(`${baseUrl}/cv-builder`)
  await expect(page.getByRole('heading', { name: /CV Builder/ }).first()).toBeVisible()
  expect(errors, 'CV Builder navigation produced console/page errors').toEqual([])
})

test('Auto-Delete opens matching settings capped at 90 days and persists the chosen duration', async ({ page }) => {
  const errors = []
  await page.setViewportSize({ width: 1267, height: 700 })
  await openCandidates(page, errors)

  await page.getByRole('button', { name: 'Auto-Delete', exact: true }).click()

  const dialog = page.getByRole('dialog', { name: 'Auto-Deletion Settings' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Enable auto-deletion for completed candidates')
  await expect(dialog).toContainText('Auto-Deletion Policy')
  await expect(dialog).toContainText('Completed candidates will be automatically deleted after the specified number of days.')

  const enabled = dialog.getByRole('checkbox', { name: 'Enable auto-deletion for completed candidates' })
  const duration = dialog.getByLabel('Delete after (days):')
  await expect(enabled).toBeChecked()
  await expect(duration).toHaveValue('30')
  await expect(duration.locator('option')).toHaveText([
    '7 days (1 week)',
    '30 days (1 month)',
    '60 days (2 months)',
    '90 days (3 months)',
  ])
  await expect(duration.locator('option')).toHaveCount(4)

  await duration.selectOption('90')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: 'Auto-Delete', exact: true }).click()
  await expect(dialog.getByLabel('Delete after (days):')).toHaveValue('30')
  await dialog.getByLabel('Delete after (days):').selectOption('90')
  await dialog.getByRole('button', { name: 'Execute Now' }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: 'Auto-Delete', exact: true }).click()
  await expect(dialog.getByLabel('Delete after (days):')).toHaveValue('90')
  await enabled.uncheck()
  await expect(dialog.getByLabel('Delete after (days):')).toBeDisabled()

  const box = await dialog.boundingBox()
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(1267)
  expect(errors, 'Auto-Delete settings produced console/page errors').toEqual([])
})

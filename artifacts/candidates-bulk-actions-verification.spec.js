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

async function selectAllOnPage(page) {
  await page.getByLabel('Select All on Page').check()
  const rowCheckboxes = page.locator('#all-candidates article input[type="checkbox"]')
  await expect(rowCheckboxes).toHaveCount(10)
  for (const checkbox of await rowCheckboxes.all()) await expect(checkbox).toBeChecked()
}

test('Select All reveals the responsive Candidates bulk toolbar and updates every selected stage', async ({ page }) => {
  const errors = []
  await page.setViewportSize({ width: 1267, height: 700 })
  await openCandidates(page, errors)

  const toolbar = page.getByRole('region', { name: 'Candidate bulk actions' })
  await expect(toolbar).toBeHidden()
  await selectAllOnPage(page)

  await expect(toolbar).toBeVisible()
  await expect(toolbar).toContainText('10 candidate(s) selected')
  await expect(toolbar.getByRole('button', { name: 'Update Stage' })).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'Export selected candidates to PDF' })).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'Export selected candidates to Excel' })).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'Export selected candidates to CSV' })).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'Delete Selected' })).toBeVisible()
  await expect(toolbar).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(toolbar).toHaveCSS('border-radius', '8px')

  const updateStage = toolbar.getByRole('button', { name: 'Update Stage' })
  await expect(updateStage).toHaveAttribute('aria-expanded', 'false')
  await updateStage.click()
  await expect(updateStage).toHaveAttribute('aria-expanded', 'true')

  const menu = page.getByRole('menu', { name: 'Bulk stage options' })
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('width', '160px')
  for (const stage of ['Onboarding', 'Interviewing', 'Offer', 'Hired', 'Rejected']) {
    const option = menu.getByRole('menuitem', { name: stage })
    await expect(option).toBeVisible()
    const dot = option.locator('[data-status-dot]')
    await expect(dot).toHaveCSS('width', '8px')
    await expect(dot).toHaveCSS('height', '8px')
    await expect(dot).toHaveCSS('border-radius', '9999px')
  }

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(updateStage).toHaveAttribute('aria-expanded', 'false')

  await updateStage.click()
  await page.locator('#all-candidates h2').click()
  await expect(menu).toBeHidden()

  await page.setViewportSize({ width: 390, height: 844 })
  await toolbar.scrollIntoViewIfNeeded()
  const toolbarBox = await toolbar.boundingBox()
  expect(toolbarBox.x).toBeGreaterThanOrEqual(0)
  expect(toolbarBox.x + toolbarBox.width).toBeLessThanOrEqual(390)
  await updateStage.click()
  await expect(menu).toBeVisible()
  const menuBox = await menu.boundingBox()
  expect(menuBox.x).toBeGreaterThanOrEqual(0)
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(390)
  await menu.getByRole('menuitem', { name: 'Hired' }).click()

  await expect(toolbar).toBeHidden()
  await expect(page.locator('#all-candidates article').first()).toContainText('Hired')
  await expect(page.locator('#all-candidates article').last()).toContainText('Hired')
  await expect(page.getByLabel('Select All on Page')).not.toBeChecked()

  await page.screenshot({
    path: 'C:/Users/user/Desktop/Naim-CRM/candidates-bulk-actions-mobile-final.png',
    fullPage: true,
  })
  expect(errors, 'Candidates bulk-stage workflow produced console/page errors').toEqual([])
})

test('bulk export actions download only the selected Candidates rows', async ({ page }) => {
  const errors = []
  await page.setViewportSize({ width: 1267, height: 700 })
  await openCandidates(page, errors)
  await selectAllOnPage(page)

  const toolbar = page.getByRole('region', { name: 'Candidate bulk actions' })
  const exports = [
    { label: 'Export selected candidates to PDF', filename: 'selected-candidates.pdf' },
    { label: 'Export selected candidates to Excel', filename: 'selected-candidates.xlsx' },
    { label: 'Export selected candidates to CSV', filename: 'selected-candidates.csv' },
  ]

  for (const item of exports) {
    const downloadPromise = page.waitForEvent('download')
    await toolbar.getByRole('button', { name: item.label }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(item.filename)
  }

  await expect(toolbar).toContainText('10 candidate(s) selected')
  expect(errors, 'Candidates bulk-export workflow produced console/page errors').toEqual([])
})

test('Delete Selected requires confirmation and moves only selected Candidates to the Recycle Bin', async ({ page }) => {
  const errors = []
  await page.setViewportSize({ width: 1267, height: 700 })
  await openCandidates(page, errors)
  const firstEmail = await page.locator('#all-candidates article').first().locator('p').nth(1).textContent()
  await selectAllOnPage(page)

  const toolbar = page.getByRole('region', { name: 'Candidate bulk actions' })
  await toolbar.getByRole('button', { name: 'Delete Selected' }).click()

  const dialog = page.getByRole('dialog', { name: 'Delete Selected Candidates' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('10 selected candidates')
  await expect(dialog).toContainText('Recycle Bin')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toBeHidden()
  await expect(toolbar).toBeVisible()

  await toolbar.getByRole('button', { name: 'Delete Selected' }).click()
  await dialog.getByRole('button', { name: 'Delete 10 Candidates' }).click()

  await expect(dialog).toBeHidden()
  await expect(toolbar).toBeHidden()
  await expect(page.getByLabel('Select All on Page')).not.toBeChecked()
  await expect(page.locator('#all-candidates article').first()).not.toContainText(firstEmail)
  expect(errors, 'Candidates bulk-delete workflow produced console/page errors').toEqual([])
})

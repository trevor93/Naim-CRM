import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Reports & Analytics reference layout and workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))

  // Stub window.print so the Print Report button never triggers an OS dialog.
  await page.addInitScript(() => { window.print = () => { window.__printed = true } })

  await page.goto(`${baseUrl}/reports`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Reports & Analytics', exact: true })).toBeVisible()
  await expect(page.getByText('Track performance and analyze recruitment metrics')).toBeVisible()

  // KPI cards
  for (const [slug, label, value] of [
    ['total-candidates', 'Total Candidates', '165'],
    ['total-jobs', 'Total Jobs', '3'],
    ['total-tasks', 'Total Tasks', '2'],
    ['completed-tasks', 'Completed Tasks', '1'],
    ['total-appointments', 'Total Appointments', '1'],
    ['pending-tasks', 'Pending Tasks', '0'],
  ]) {
    await expect(page.getByTestId(`report-metric-${slug}`)).toBeVisible()
    await expect(page.getByTestId(`report-metric-${slug}`)).toContainText(label)
    await expect(page.getByTestId(`report-metric-${slug}`)).toContainText(value)
  }

  // Candidates by Stage heading + values 158/4/1/2 scoped to the stage summary testid
  await expect(page.getByRole('heading', { name: 'Candidates by Stage' })).toBeVisible()
  const stageSummary = page.getByTestId('candidate-stage-summary')
  for (const value of ['158', '4', '1', '2']) {
    await expect(stageSummary.getByText(value, { exact: true }).first()).toBeVisible()
  }

  // Successful placements
  await expect(page.getByText('TERESIAH WAMBERE KARIUKI', { exact: true })).toBeVisible()
  await expect(page.getByText('JANE NYAMBURA NJOROGE', { exact: true })).toBeVisible()

  // Live analytics groups
  await expect(page.getByRole('heading', { name: 'Candidate Stage Distribution' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Applications by Country' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Task Performance by Assignee' })).toBeVisible()

  // Placement History table scoped to testid with exactly 20 tbody rows
  const placementTable = page.getByTestId('placement-history-table')
  await expect(placementTable.locator('tbody tr')).toHaveCount(20)

  // Search filter: KITHUKA hides both recent successful placements; clearing restores them
  const recentPlacements = page.getByTestId('recent-successful-placements')
  await page.getByLabel('Search reports data').fill('KITHUKA')
  await expect(placementTable.getByText('KITHUKA')).toBeVisible()
  await expect(recentPlacements.getByText('TERESIAH WAMBERE KARIUKI')).toHaveCount(0)
  await expect(recentPlacements.getByText('JANE NYAMBURA NJOROGE')).toHaveCount(0)
  await page.getByLabel('Search reports data').fill('')
  await expect(recentPlacements.getByText('TERESIAH WAMBERE KARIUKI')).toBeVisible()
  await expect(recentPlacements.getByText('JANE NYAMBURA NJOROGE')).toBeVisible()

  // Sortable Candidate header
  const sortButton = page.getByRole('button', { name: 'Sort by Candidate' })
  await sortButton.click()
  await expect(sortButton).toHaveAttribute('data-direction', 'asc')
  await sortButton.click()
  await expect(sortButton).toHaveAttribute('data-direction', 'desc')

  // Report export format: actively select each approved option and verify values
  const exportSelect = page.getByLabel('Report export format')
  for (const [label, value] of [['CSV Format', 'csv'], ['Excel Format', 'xlsx'], ['PDF Format', 'pdf']]) {
    await exportSelect.selectOption(value)
    await expect(exportSelect).toHaveValue(value)
    await expect(exportSelect.locator(`option[value="${value}"]`)).toHaveText(label)
  }
  await expect(exportSelect.locator('option')).toHaveText(['CSV Format', 'Excel Format', 'PDF Format'])

  // Filter KITHUKA, select CSV, export; verify filename and saved content
  await page.getByLabel('Search reports data').fill('KITHUKA')
  await exportSelect.selectOption('csv')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Report' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('placement-history-report.csv')
  const csvPath = await download.path()
  expect(csvPath, 'download.path() returned falsy').toBeTruthy()
  const fs = await import('node:fs/promises')
  const csv = await fs.readFile(csvPath, 'utf8')
  expect(csv).toContain('KITHUKA')
  expect(csv).not.toContain('AMINA')
  await page.getByLabel('Search reports data').fill('')

  // Print Report triggers window.print stub
  await page.getByRole('button', { name: 'Print Report' }).click()
  const printed = await page.evaluate(() => window.__printed === true)
  expect(printed).toBe(true)

  // Mobile layout: no horizontal overflow, placement-history table wrapper scrolls internally
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Reports & Analytics', exact: true })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBeFalsy()
  const tableWrapperScrolls = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="placement-history-scroll"]')
    if (!wrapper) return false
    return wrapper.scrollWidth > wrapper.clientWidth
  })
  expect(tableWrapperScrolls).toBe(true)

  // Capture screenshot at the documented size
  await page.setViewportSize({ width: 1366, height: 2439 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/reports-analytics-implemented.png', fullPage: true })

  // Smoke navigation through related routes
  // Final main-body error check before any later resets so smoke loop cannot mask them
  expect(errors, 'main body produced console/page errors').toEqual([])
  const smokeRoutes = [
    '/documents',
    '/tasks',
    '/jobs',
    '/appointments',
    '/associates',
    '/receptionist-view',
    '/job-generator',
  ]
  for (const route of smokeRoutes) {
    errors.length = 0
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'load' })
    expect(response, `no response for ${route}`).not.toBeNull()
    expect(response.ok(), `bad response for ${route}`).toBe(true)
    expect(errors, `console errors on ${route}`).toEqual([])
  }

  expect(errors).toEqual([])
})

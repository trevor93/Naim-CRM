import { test, expect } from 'playwright/test'

test('Associates task management interactions and regressions', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('http://127.0.0.1:3000/associates')
  await expect(page.getByRole('heading', { name: 'Associates Task Management' })).toBeVisible()
  await expect(page.getByText('Recent Candidates', { exact: false })).toBeVisible()
  await expect(page.getByText('Recent Jobs', { exact: false })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'All Tasks' })).toBeVisible()

  const stage = page.getByLabel(/Stage for/).first()
  await stage.selectOption('Screening')
  await expect(stage).toHaveValue('Screening')

  const priority = page.getByLabel(/Priority for/).first()
  await priority.selectOption('LOW')
  await expect(priority).toHaveValue('LOW')

  const status = page.getByLabel(/Status for/).first()
  await status.selectOption('In Progress')
  await expect(status).toHaveValue('In Progress')

  const taskCheckboxes = page.getByRole('checkbox', { name: /Select task/ })
  const initialTaskCount = await taskCheckboxes.count()
  expect(initialTaskCount).toBeGreaterThan(0)
  await page.getByLabel('Select all tasks').check()
  for (let index = 0; index < initialTaskCount; index += 1) await expect(taskCheckboxes.nth(index)).toBeChecked()
  await page.getByLabel('Select all tasks').uncheck()

  await page.getByLabel('Search tasks').fill('Mary Wanjiru')
  await expect(page.getByText('Confirm offer details for Mary Wanjiru')).toBeVisible()
  await page.getByLabel('Search tasks').fill('no matching task exists')
  await expect(page.getByRole('checkbox', { name: /Select task/ })).toHaveCount(0)
  await page.getByLabel('Search tasks').fill('')

  await page.getByLabel('Filter by priority').selectOption('HIGH')
  for (const select of await page.getByLabel(/Priority for/).all()) await expect(select).toHaveValue('HIGH')
  await page.getByLabel('Filter by priority').selectOption('All Priority')

  await page.getByRole('button', { name: 'Archive Completed' }).click()
  await expect(page.getByRole('status')).toContainText('There are no completed tasks to archive.')

  await status.selectOption('Completed')
  let confirmationMessage = ''
  page.once('dialog', async (dialog) => {
    confirmationMessage = dialog.message()
    await dialog.dismiss()
  })
  await page.getByRole('button', { name: 'Archive Completed' }).click()
  expect(confirmationMessage).toContain('Archive')
  await expect(page.getByText('Confirm offer details for Mary Wanjiru')).toBeVisible()

  const quickActions = [
    ['Add Candidate', /\/candidates\?action=add$/],
    ['View Candidates', /\/candidates$/],
    ['Book Appointment', /\/appointments\?action=book$/],
    ['View Jobs', /\/jobs$/],
  ]
  for (const [name, url] of quickActions) {
    await page.goto('http://127.0.0.1:3000/associates')
    await page.getByRole('button', { name }).click()
    await expect(page).toHaveURL(url)
  }

  await page.goto('http://127.0.0.1:3000/associates')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Associates Task Management' })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBeFalsy()

  await page.setViewportSize({ width: 1366, height: 1962 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/associates-verified.png', fullPage: true })
  expect(errors).toEqual([])
})

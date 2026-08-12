import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Appointments Page reference layout and workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/appointments`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Appointments', exact: true })).toBeVisible()
  await expect(page.getByText('Schedule and manage candidate interviews and meetings')).toBeVisible()
  const summary = page.getByLabel('Appointment summary')
  for (const label of ["Today's Appointments", 'Upcoming', 'Completed', 'No Shows']) {
    await expect(summary.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(page.getByRole('heading', { name: 'All Appointments' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Schedule Appointment' })).toBeVisible()
  await expect(page.getByLabel('Search appointments')).toBeVisible()
  await expect(page.getByLabel('Filter appointments by date')).toBeVisible()
  await expect(page.getByLabel('Filter appointments by status')).toBeVisible()
  await expect(page.getByLabel('Filter appointments by stage')).toBeVisible()
  const collection = page.getByLabel('Appointment collection')
  await expect(collection.getByText('dogo', { exact: true }).first()).toBeVisible()
  for (const text of ['Initial Interview', 'Tue, Sep 23, 2025', '01:00', 'Naim Investments Office - Room A', 'Ali', 'dogo@gmail.com', '02145666']) {
    await expect(collection.getByText(text, { exact: true }).first()).toBeVisible()
  }

  await page.getByRole('button', { name: 'Schedule Appointment' }).click()
  const scheduleDialog = page.getByRole('dialog', { name: 'Schedule Appointment' })
  await scheduleDialog.getByRole('button', { name: 'Schedule', exact: true }).click()
  await expect(scheduleDialog.getByText('Candidate or title is required')).toBeVisible()
  await expect(scheduleDialog.getByText('Date is required')).toBeVisible()
  await scheduleDialog.getByLabel('Candidate or Title').fill('Jane Candidate')
  await scheduleDialog.getByLabel('Appointment Type').selectOption('Medical')
  await scheduleDialog.getByLabel('Date', { exact: true }).fill('2026-08-15')
  await scheduleDialog.getByLabel('Time', { exact: true }).fill('09:30')
  await scheduleDialog.getByLabel('Location').fill('Medical Center')
  await scheduleDialog.getByLabel('Coordinator').fill('Reception Team')
  await scheduleDialog.getByLabel('Email').fill('jane@example.com')
  await scheduleDialog.getByLabel('Phone').fill('5550101')
  await scheduleDialog.getByLabel('Stage').selectOption('Onboarding')
  await scheduleDialog.getByLabel('Status').selectOption('Scheduled')
  await scheduleDialog.getByRole('button', { name: 'Schedule', exact: true }).click()
  await expect(collection.getByText('Jane Candidate', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Edit Jane Candidate' }).first().click()
  const editDialog = page.getByRole('dialog', { name: 'Edit Appointment' })
  await editDialog.getByLabel('Candidate or Title').fill('Jane Updated')
  await editDialog.getByRole('button', { name: 'Update' }).click()
  await expect(collection.getByText('Jane Updated', { exact: true }).first()).toBeVisible()

  await collection.getByLabel('Stage for dogo').first().selectOption('Offer')
  await expect(collection.getByLabel('Stage for dogo').first()).toHaveValue('Offer')
  await collection.getByLabel('Status for dogo').first().selectOption('Completed')
  await expect(collection.getByLabel('Status for dogo').first()).toHaveValue('Completed')
  await expect(page.getByLabel('Completed: 1')).toBeVisible()

  await page.getByLabel('Search appointments').fill('Jane Updated')
  await expect(collection.getByText('Jane Updated', { exact: true }).first()).toBeVisible()
  await expect(collection.getByText('dogo', { exact: true })).toHaveCount(0)
  await page.getByLabel('Search appointments').fill('')
  await page.getByLabel('Filter appointments by date').fill('2026-08-15')
  await page.getByLabel('Filter appointments by status').selectOption('Scheduled')
  await page.getByLabel('Filter appointments by stage').selectOption('Onboarding')
  await expect(collection.getByText('Jane Updated', { exact: true }).first()).toBeVisible()
  await page.getByLabel('Filter appointments by date').fill('')
  await page.getByLabel('Filter appointments by status').selectOption('')
  await page.getByLabel('Filter appointments by stage').selectOption('')

  await collection.getByLabel('Select appointment dogo').first().check()
  await expect(collection.getByLabel('Select appointment dogo').first()).toBeChecked()

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Delete Jane Updated' }).first().click()
  await expect(collection.getByText('Jane Updated', { exact: true }).first()).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete Jane Updated' }).first().click()
  await expect(page.getByText('Jane Updated', { exact: true })).toHaveCount(0)

  await page.goto(`${baseUrl}/tasks`)
  await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()
  await page.goto(`${baseUrl}/documents`)
  await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible()
  await page.goto(`${baseUrl}/receptionist-view`)
  await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible()
  await page.goto(`${baseUrl}/associates`)
  await expect(page.getByRole('heading', { name: 'Associates Task Management' })).toBeVisible()
  await page.goto(`${baseUrl}/appointments`)
  errors.length = 0
  await page.reload()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.setViewportSize({ width: 1366, height: 785 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/appointments-final.png', fullPage: true })
  expect(errors).toEqual([])
})

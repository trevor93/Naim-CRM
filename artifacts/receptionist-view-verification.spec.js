import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Receptionist View reference layout and workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/receptionist-view`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Receptionist View', exact: true })).toBeVisible()
  await expect(page.getByText('Manage daily reception activities and candidate interactions')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible()

  const actions = [
    ['Create CV', '/cv-builder'],
    ['Add Candidate', '/candidates?add=1'],
    ['View Candidate', '/candidates'],
    ['Schedule Appointment', '/appointments?add=1'],
    ['View Tasks', '/tasks'],
  ]
  for (const [label, path] of actions) {
    await page.getByRole('button', { name: label }).click()
    await expect(page).toHaveURL(new RegExp(path.replace('?', '\\?')))
    await page.goto(`${baseUrl}/receptionist-view`)
  }

  for (const label of ['Total Candidates', 'Total Jobs', 'Total Appointments', 'Pending Tasks']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(page.getByText('Live data', { exact: true })).toHaveCount(4)
  await expect(page.getByRole('heading', { name: 'Recent Candidates' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recent Jobs' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'My Task Progress' })).toBeVisible()

  await page.getByRole('button', { name: 'Send Email' }).click()
  const dialog = page.getByRole('dialog', { name: 'Send Email' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Send Email' }).click()
  await expect(dialog.getByText('Recipient is required')).toBeVisible()
  await expect(dialog.getByText('Subject is required')).toBeVisible()
  await expect(dialog.getByText('Message is required')).toBeVisible()
  await dialog.getByLabel('Recipient').fill('candidate@example.com')
  await dialog.getByLabel('Subject').fill('Interview details')
  await dialog.getByLabel('Message').fill('Your interview is confirmed.')
  await dialog.getByRole('button', { name: 'Send Email' }).click()
  await expect(page.getByRole('status')).toContainText('Email sent successfully')
  await expect(dialog).toHaveCount(0)

  const firstCandidateStatus = page.getByRole('button', { name: /Candidate status for/ }).first()
  await firstCandidateStatus.click()
  await page.getByRole('menuitem', { name: 'Interviewing' }).click()
  await expect(firstCandidateStatus).toContainText('Interviewing')

  const firstTaskStatus = page.getByRole('button', { name: /Task status for/ }).first()
  await firstTaskStatus.click()
  await page.getByRole('menuitem', { name: 'Pending' }).click()
  await expect(firstTaskStatus).toContainText('Pending')
  await page.getByLabel('Filter tasks by status').selectOption('Completed')
  await expect(page.getByLabel('Filter tasks by status')).toHaveValue('Completed')

  await page.getByRole('button', { name: 'View All Candidates' }).click()
  await expect(page).toHaveURL(/\/candidates$/)
  await page.goto(`${baseUrl}/receptionist-view`)
  await page.getByRole('button', { name: 'View All Jobs' }).click()
  await expect(page).toHaveURL(/\/jobs$/)

  await page.goto(`${baseUrl}/documents`)
  await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible()
  await page.goto(`${baseUrl}/receptionist-view`)
  errors.length = 0
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.setViewportSize({ width: 1366, height: 1962 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/receptionist-view-final.png', fullPage: true })
  expect(errors).toEqual([])
})

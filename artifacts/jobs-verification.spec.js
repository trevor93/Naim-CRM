import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Jobs Page reference layout and workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/jobs`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Job Openings', exact: true })).toBeVisible()
  await expect(page.getByText('Manage available job positions and track applications')).toBeVisible()

  await expect(page.getByText('Available Positions', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Available Positions: 2', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Job', exact: true })).toBeVisible()
  await expect(page.getByLabel('Search jobs', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Filter jobs by status', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Filter jobs by company', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Filter jobs by country', { exact: true })).toBeVisible()

  const collection = page.getByLabel('Jobs collection')
  await expect(collection.getByText('Cleaners', { exact: true }).first()).toBeVisible()
  await expect(collection.getByText('Personal Driver (Female)', { exact: true }).first()).toBeVisible()
  for (const text of [
    'Male',
    'Any',
    'Negotiable',
    '350 - 450 KWD',
    'Dammam',
    'Saudi Arabia',
    'Naim Investments',
    'Elite Chauffeur Services',
    'Not specified',
    'Yes',
    'Available',
    'Provided',
    'Not specified (Female)',
    '1 left',
    '0 linked',
    'None',
  ]) {
    await expect(collection.getByText(text, { exact: true }).first()).toBeVisible()
  }
  await expect(collection.getByLabel('Status for Cleaners').first()).toHaveValue('Active')
  await expect(collection.getByLabel('Status for Personal Driver (Female)').first()).toHaveValue('Closed')

  await page.getByRole('button', { name: 'Add Job', exact: true }).click()
  const newJobDialog = page.getByRole('dialog', { name: 'New Job' })
  await newJobDialog.getByRole('button', { name: 'Create Job', exact: true }).click()
  await expect(newJobDialog.getByText('Title is required')).toBeVisible()

  await newJobDialog.getByLabel('Job Title', { exact: true }).fill('Warehouse Assistant')
  await newJobDialog.getByLabel('Company Name', { exact: true }).fill('Naim Logistics')
  await newJobDialog.getByLabel('City', { exact: true }).fill('Riyadh')
  await newJobDialog.getByLabel('Country', { exact: true }).selectOption('Saudi Arabia')
  await newJobDialog.getByLabel('Gender', { exact: true }).selectOption('Male')
  await newJobDialog.getByLabel('Min Salary', { exact: true }).fill('500')
  await newJobDialog.getByLabel('Max Salary', { exact: true }).fill('650')
  await newJobDialog.getByLabel('Currency', { exact: true }).selectOption('SAR')
  await newJobDialog.getByLabel('Vacancies Left', { exact: true }).fill('3')
  await newJobDialog.getByLabel('Status', { exact: true }).selectOption('Draft')
  await newJobDialog.getByRole('button', { name: 'Create Job', exact: true }).click()
  await expect(collection.getByText('Warehouse Assistant', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Edit Warehouse Assistant' }).first().click()
  const editDialog = page.getByRole('dialog', { name: 'Edit Job' })
  await editDialog.getByLabel('Job Title', { exact: true }).fill('Warehouse Coordinator')
  await editDialog.getByRole('button', { name: 'Update Job', exact: true }).click()
  await expect(collection.getByText('Warehouse Coordinator', { exact: true }).first()).toBeVisible()

  await collection.getByLabel('Status for Warehouse Coordinator').first().selectOption('Active')
  await expect(collection.getByLabel('Status for Warehouse Coordinator').first()).toHaveValue('Active')

  await page.getByLabel('Search jobs', { exact: true }).fill('Warehouse Coordinator')
  await expect(collection.getByText('Warehouse Coordinator', { exact: true }).first()).toBeVisible()
  await expect(collection.getByText('Cleaners', { exact: true })).toHaveCount(0)
  await page.getByLabel('Search jobs', { exact: true }).fill('')

  await page.getByLabel('Filter jobs by company', { exact: true }).selectOption('Naim Logistics')
  await page.getByLabel('Filter jobs by country', { exact: true }).selectOption('Saudi Arabia')
  await page.getByLabel('Filter jobs by status', { exact: true }).selectOption('Active')
  await expect(collection.getByText('Warehouse Coordinator', { exact: true }).first()).toBeVisible()
  await page.getByLabel('Filter jobs by company', { exact: true }).selectOption('')
  await page.getByLabel('Filter jobs by country', { exact: true }).selectOption('')
  await page.getByLabel('Filter jobs by status', { exact: true }).selectOption('')

  await collection.getByLabel('Select job Cleaners').first().check()
  await expect(collection.getByLabel('Select job Cleaners').first()).toBeChecked()
  await page.getByRole('checkbox', { name: 'Select all jobs' }).check()
  await expect(collection.getByLabel('Select job Warehouse Coordinator').first()).toBeChecked()
  await expect(collection.getByLabel('Select job Cleaners').first()).toBeChecked()

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Delete Warehouse Coordinator' }).first().click()
  await expect(collection.getByText('Warehouse Coordinator', { exact: true }).first()).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete Warehouse Coordinator' }).first().click()
  await expect(page.getByText('Warehouse Coordinator', { exact: true })).toHaveCount(0)

  await page.goto(`${baseUrl}/tasks`)
  await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()
  await page.goto(`${baseUrl}/documents`)
  await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible()
  await page.goto(`${baseUrl}/receptionist-view`)
  await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible()
  await page.goto(`${baseUrl}/associates`)
  await expect(page.getByRole('heading', { name: 'Associates Task Management' })).toBeVisible()
  await page.goto(`${baseUrl}/appointments`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Appointments', exact: true })).toBeVisible()
  await page.goto(`${baseUrl}/jobs`)

  errors.length = 0
  await page.reload()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  await page.setViewportSize({ width: 1366, height: 785 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/jobs-final.png', fullPage: true })
  expect(errors).toEqual([])
})

import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Job Generator reference layout and workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/job-generator`)
  await expect(page.getByRole('heading', { name: 'Job Generator', exact: true })).toBeVisible()
  await expect(page.getByText('Create job postings quickly with ready-made sections and checkboxes')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quick Job Builder' })).toBeVisible()

  for (const label of ['Gender', 'Qualifications', 'Locations', 'Accommodation', 'Overtime', 'Transport Provision', 'Positions', 'Upload Files', 'Link Candidates']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible()
  }
  for (const position of ['Housemaids', 'Waiters/Waitress', 'Baristas', 'Cleaners', 'Caregivers', 'Drivers', 'Truck Drivers', 'Security Services', 'Emergency Services', 'Nurses', 'Teachers', 'Plant Technicians', 'Erectors', 'Fabrication Foreman', 'CNC Machine Operator', 'Mobile crane driver', 'Other']) {
    await expect(page.getByText(position, { exact: true })).toBeVisible()
  }

  await page.getByRole('button', { name: 'Generate Job' }).click()
  await expect(page.getByText('Select at least one gender')).toBeVisible()
  await expect(page.getByText('Select or specify at least one position')).toBeVisible()

  const country = page.getByLabel('Select Country')
  const city = page.getByLabel('Select City')
  await expect(country.locator('option')).toHaveText(['Select Country', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'])
  const cityMap = {
    'Saudi Arabia': ['Select City', 'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
    UAE: ['Select City', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'],
    Kuwait: ['Select City', 'Kuwait City', 'Hawalli', 'Salmiya', 'Jahra', 'Ahmadi'],
    Qatar: ['Select City', 'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Dukhan'],
    Bahrain: ['Select City', 'Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town'],
    Oman: ['Select City', 'Muscat', 'Salalah', 'Nizwa', 'Sur', 'Sohar'],
  }
  for (const [nation, cities] of Object.entries(cityMap)) {
    await country.selectOption(nation)
    await expect(city).toHaveValue('')
    await expect(city.locator('option')).toHaveText(cities)
  }

  await country.selectOption('Saudi Arabia'); await city.selectOption('Riyadh'); await page.getByRole('button', { name: 'Add Location' }).click()
  await expect(page.getByText('Riyadh, Saudi Arabia')).toBeVisible()
  await country.selectOption('Saudi Arabia'); await city.selectOption('Riyadh'); await page.getByRole('button', { name: 'Add Location' }).click()
  await expect(page.getByText('This location has already been added')).toBeVisible()
  await page.getByRole('button', { name: 'Remove Saudi Arabia, Riyadh' }).click()
  await expect(page.getByText('Riyadh, Saudi Arabia')).toHaveCount(0)

  await page.getByRole('button', { name: 'Select Candidates' }).click()
  const dialog = page.getByRole('dialog', { name: 'Select Candidates to Link' })
  await expect(dialog.getByText('Available Candidates', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Linked Candidates (0)', { exact: true })).toBeVisible()
  await expect(dialog.getByText('No candidates linked yet.')).toBeVisible()
  const firstLink = dialog.getByRole('button', { name: /^Link / }).first()
  const linkedName = (await firstLink.getAttribute('aria-label')).replace('Link ', '')
  await firstLink.click()
  await expect(dialog.getByText('Linked Candidates (1)', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: `Unlink ${linkedName}` }).click()
  await expect(dialog.getByText('Linked Candidates (0)', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Done' }).click()

  await page.getByRole('checkbox', { name: 'Male', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Cleaners', exact: true }).check()
  await page.getByLabel('Salary').fill('1200')
  await page.getByLabel('Company Name').fill('Naim Recruitment')
  await page.getByLabel('Number of Vacancies').fill('3')
  await country.selectOption('UAE'); await city.selectOption('Dubai'); await page.getByRole('button', { name: 'Add Location' }).click()
  await page.getByRole('button', { name: 'Generate Job' }).click()
  await expect(page).toHaveURL(/\/jobs$/)
  const jobDialog = page.getByRole('dialog', { name: 'Job Details' })
  await expect(jobDialog).toBeVisible()
  await expect(jobDialog.getByText('Cleaners', { exact: true })).toBeVisible()
  await expect(jobDialog.getByText('Naim Recruitment', { exact: true })).toBeVisible()
  await expect(jobDialog.getByText('Dubai', { exact: true })).toBeVisible()

  await page.goto(`${baseUrl}/job-generator`)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.setViewportSize({ width: 1366, height: 785 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/job-generator-final.png', fullPage: true })
  expect(errors).toEqual([])
})

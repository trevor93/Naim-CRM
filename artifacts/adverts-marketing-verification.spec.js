import { test, expect } from 'playwright/test'

const appUrl = 'http://127.0.0.1:3000/documents'

test('Adverts and Marketing document workflows and regressions', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(appUrl)
  await page.getByRole('button', { name: 'Adverts/Marketing' }).click()
  await expect(page.getByRole('button', { name: 'Adverts/Marketing' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { name: 'Marketing & Advertising Hub' })).toBeVisible()
  await expect(page.getByText('Centralize all your marketing materials, job advertisements, brand assets, and social media content. Keep track of promotional campaigns and maintain consistent branding across all recruitment efforts.')).toBeVisible()

  const sections = [
    ['Marketing Materials', 'Brochures, flyers, and promotional materials'],
    ['Advertisements', 'Job advertisements and recruitment campaigns'],
    ['Brand Assets', 'Logos, brand guidelines, and visual identity materials'],
    ['Social Media Content', 'Social media posts, campaigns, and content calendars'],
  ]
  for (const [title, subtitle] of sections) {
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await expect(page.getByText(subtitle, { exact: true })).toBeVisible()
  }
  await expect(page.getByText('No documents uploaded yet')).toHaveCount(4)
  await expect(page.getByRole('button', { name: 'Upload' })).toHaveCount(4)
  await expect(page.getByRole('button', { name: 'Camera' })).toHaveCount(4)
  await expect(page.getByText('Select All', { exact: true })).toHaveCount(0)
  const cameraInputs = page.locator('input[type="file"][capture="environment"]')
  await expect(cameraInputs).toHaveCount(4)

  const materialCard = page.getByRole('heading', { name: 'Marketing Materials' }).locator('xpath=ancestor::section')
  const uploadInput = materialCard.locator('input[type="file"]').first()
  await uploadInput.setInputFiles({ name: 'campaign.pdf', mimeType: 'application/pdf', buffer: Buffer.from('marketing campaign') })
  await expect(materialCard.getByText('campaign.pdf')).toBeVisible()
  await expect(materialCard.getByText('Select All', { exact: true })).toBeVisible()
  await materialCard.getByText('Select All', { exact: true }).click()
  await expect(materialCard.getByRole('checkbox').last()).toBeChecked()

  await materialCard.getByRole('button', { name: /Preview/ }).click()
  await expect(page.getByRole('dialog')).toContainText('campaign.pdf')
  await page.getByRole('button', { name: 'Close' }).click()

  await materialCard.getByRole('button', { name: /Edit/ }).click()
  const description = page.getByLabel('Description')
  await description.fill('Updated marketing campaign')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(materialCard.getByText('Updated marketing campaign')).toBeVisible()

  page.once('dialog', (dialog) => dialog.dismiss())
  await materialCard.getByRole('button', { name: /Delete/ }).click()
  await expect(materialCard.getByText('campaign.pdf')).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await materialCard.getByRole('button', { name: /Delete/ }).click()
  await expect(materialCard.getByText('campaign.pdf')).toHaveCount(0)
  await expect(materialCard.getByText('No documents uploaded yet')).toBeVisible()

  for (const tab of ['CVs', 'Medical Reports', 'Contracts', 'Licenses & Certifications', 'Reports']) {
    await page.getByRole('button', { name: tab, exact: true }).click()
    await expect(page.getByRole('button', { name: tab, exact: true })).toHaveAttribute('aria-current', 'page')
  }

  await page.getByRole('button', { name: 'Adverts/Marketing' }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBeFalsy()

  await page.setViewportSize({ width: 1366, height: 1962 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/adverts-marketing-final.png', fullPage: true })
  expect(errors).toEqual([])
})

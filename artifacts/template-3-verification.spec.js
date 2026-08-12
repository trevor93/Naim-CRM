import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const storageKey = 'naim-cv-builder-draft'

test('Template 3 reproduces the supplied maroon and gold Naim Investments CV', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1366, height: 1519 })
  await page.goto(`${baseUrl}/cv-builder`)
  await page.evaluate((key) => localStorage.removeItem(key), storageKey)
  await page.reload()

  await expect(page.getByLabel('CV template 3')).toBeChecked()
  await page.getByRole('button', { name: 'Preview CV' }).click()

  const preview = page.getByTestId('template-3-preview')
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('heading', { name: 'Naim Investments' })).toBeVisible()
  await expect(preview.getByText('P O Box 80249-80100 Mombasa, Kenya. Tel/Fax: +254 41 2317883, Mobile: +254720931164', { exact: true })).toBeVisible()
  await expect(preview.getByText('AMINA ALI KAKAWA', { exact: true })).toBeVisible()
  await expect(preview).toContainText('DOMESTIC WORKER')
  await expect(preview).toContainText('KSA (CLIENT)')
  await expect(preview.getByText('SAUDI ARABIA', { exact: true })).toBeVisible()
  await expect(preview.getByText('AK0597068', { exact: true })).toBeVisible()
  await expect(preview.getByText('30132445', { exact: true })).toBeVisible()
  await expect(preview.getByText('Profile Photo', { exact: true })).toBeVisible()
  await expect(preview.getByText('Full Body Photo', { exact: true })).toBeVisible()
  await expect(preview.getByText('APPLICANT DETAILS', { exact: true })).toBeVisible()
  await expect(preview.getByText('PASSPORT DETAILS', { exact: true })).toBeVisible()
  await expect(preview.getByText('LANGUAGES', { exact: true })).toBeVisible()
  await expect(preview.getByText('PREVIOUS EMPLOYMENT ABROAD', { exact: true })).toBeVisible()
  await expect(preview.getByText('WORK EXPERIENCE', { exact: true })).toBeVisible()
  await expect(preview.getByText('Baby Sitting', { exact: true })).toBeVisible()
  await expect(preview.getByText('Cleaning', { exact: true })).toBeVisible()
  await expect(preview.getByText('Washing', { exact: true })).toBeVisible()

  const visualContract = await preview.evaluate((element) => {
    const style = getComputedStyle(element)
    const maroonHeader = element.querySelector('.cv-t3-maroon')
    const goldCell = element.querySelector('.cv-t3-gold')
    return {
      width: Math.round(element.getBoundingClientRect().width),
      background: style.backgroundColor,
      maroon: maroonHeader ? getComputedStyle(maroonHeader).backgroundColor : null,
      gold: goldCell ? getComputedStyle(goldCell).backgroundColor : null,
      pageName: style.getPropertyValue('page'),
    }
  })
  expect(visualContract).toEqual({
    width: 632,
    background: 'rgb(255, 255, 255)',
    maroon: 'rgb(141, 0, 0)',
    gold: 'rgb(230, 190, 137)',
    pageName: 'cv-template-page',
  })

  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/template-3-preview-final.png', fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(preview).toBeVisible()
  const mobileDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(mobileDimensions.documentWidth).toBe(mobileDimensions.viewportWidth)
  expect(errors, 'Template 3 preview produced console/page errors').toEqual([])
})

import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const storageKey = 'naim-cv-builder-draft'

test('Template 4 reproduces the supplied two-page Naim Investments Arabic-style CV', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1366, height: 1519 })
  await page.goto(`${baseUrl}/cv-builder`)
  await page.evaluate((key) => localStorage.removeItem(key), storageKey)
  await page.reload()

  await page.getByText('Template 4', { exact: true }).click()
  await expect(page.getByLabel('CV template 4')).toBeChecked()
  await page.getByRole('button', { name: 'Preview CV' }).click()

  const preview = page.getByTestId('template-4-preview')
  await expect(preview).toBeVisible()

  const sheets = preview.locator('.cv-t4-page')
  await expect(sheets).toHaveCount(2)
  await expect(sheets.nth(0).getByRole('heading', { name: 'NAIM INVESTMENTS LIMITED' })).toBeVisible()
  await expect(sheets.nth(0).getByRole('heading', { name: 'APPLICATION FOR EMPLOYMENT' })).toBeVisible()
  await expect(sheets.nth(0)).toContainText('استمارة طلب عمل')
  await expect(sheets.nth(0)).toContainText('NAIM AGENCY-KENYA')
  await expect(sheets.nth(0)).toContainText('AMINA ALI KAKAWA')
  await expect(sheets.nth(0)).toContainText('DOMESTIC WORKER')
  await expect(sheets.nth(0)).toContainText('AK0597068')
  await expect(sheets.nth(0)).toContainText('Details of Application')
  await expect(sheets.nth(0)).toContainText('Languages & Education')
  await expect(sheets.nth(0)).toContainText('Previous Employment Abroad')
  await expect(sheets.nth(0)).toContainText('Inside Country Employment')
  await expect(sheets.nth(0)).toContainText('Skills & Experience')
  await expect(sheets.nth(0)).toContainText('Profile Photo')
  await expect(sheets.nth(0)).toContainText('Full Body Photo')
  await expect(sheets.nth(1)).toContainText('البيانات الشخصية')
  await expect(sheets.nth(1)).toContainText('بيانات جواز السفر')
  await expect(sheets.nth(1)).toContainText('المهارات والخبرات')

  const visualContract = await preview.evaluate((element) => {
    const firstPage = element.querySelector('.cv-t4-page')
    const yellowRow = element.querySelector('.cv-t4-inside-values')
    return {
      pageWidth: firstPage ? Math.round(firstPage.getBoundingClientRect().width) : 0,
      background: firstPage ? getComputedStyle(firstPage).backgroundColor : null,
      tableHeader: getComputedStyle(element.querySelector('.cv-t4-section')).backgroundColor,
      highlight: yellowRow ? getComputedStyle(yellowRow).backgroundColor : null,
      pageName: getComputedStyle(element).getPropertyValue('page'),
    }
  })

  expect(visualContract).toEqual({
    pageWidth: 800,
    background: 'rgb(255, 255, 255)',
    tableHeader: 'rgb(221, 221, 221)',
    highlight: 'rgb(255, 235, 59)',
    pageName: 'cv-template-page',
  })

  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/template-4-preview-final.png', fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(preview).toBeVisible()
  const mobileDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(mobileDimensions.documentWidth).toBe(mobileDimensions.viewportWidth)
  expect(errors, 'Template 4 preview produced console/page errors').toEqual([])
})

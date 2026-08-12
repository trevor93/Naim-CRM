import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const storageKey = 'naim-cv-builder-draft'

async function openTemplateFive(page, errors) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1366, height: 900 })
  await page.goto(`${baseUrl}/cv-builder`)
  await page.evaluate((key) => localStorage.removeItem(key), storageKey)
  await page.reload()
  await page.getByText('Template 5', { exact: true }).click()
  await page.getByRole('button', { name: 'Preview CV' }).click()
}

test('Template 5 reproduces the two-page Almelhem domestic-helper layout with live draft data', async ({ page }) => {
  const errors = []
  await openTemplateFive(page, errors)

  const preview = page.getByTestId('template-5-preview')
  const pages = preview.locator('.cv-t5-page')
  await expect(preview).toBeVisible()
  await expect(pages).toHaveCount(2)

  for (const cvPage of await pages.all()) {
    await expect(cvPage).toHaveCSS('width', '794px')
    await expect(cvPage).toHaveCSS('min-height', '1123px')
    await expect(cvPage).toHaveCSS('background-color', 'rgb(255, 250, 242)')
  }

  const firstPage = pages.nth(0)
  await expect(firstPage.getByRole('heading', { name: 'DOMESTIC HELPER' })).toBeVisible()
  await expect(firstPage.getByText('Worker data :', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('NAIM', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('FULL BODY PHOTO', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('PASSPORT SIZE PHOTO', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('AMINA ALI KAKAWA', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('AK0597068', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('1100', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('TANA DELTA, KENYA', { exact: true })).toBeVisible()
  await expect(firstPage.getByText('بيانات العامل / ـة الشخصية')).toBeVisible()
  await expect(firstPage.getByText('مدة العقد والراتب الشهري')).toBeVisible()
  await expect(firstPage.getByText('مستوى التعليمي واللغة')).toBeVisible()
  await expect(firstPage.getByText('خبرة العمل')).toBeVisible()

  const almelhemLogo = firstPage.getByRole('img', { name: 'Almelhem Recruitment Office logo' })
  await expect(almelhemLogo).toHaveCount(1)
  await expect(almelhemLogo).toBeVisible()
  await expect(firstPage.getByRole('img', { name: 'Naim Agency logo' })).toHaveCount(0)

  const secondPage = pages.nth(1)
  await expect(secondPage.getByText('Skills and experience :', { exact: true })).toBeVisible()
  await expect(secondPage.getByText('المهارات والخبرات')).toBeVisible()
  await expect(secondPage.getByText('Other experiences :', { exact: true })).toBeVisible()
  await expect(secondPage.getByText('خيارات أخرى')).toBeVisible()
  await expect(secondPage.getByText('COOPERATIVE / HIGHLY DISCIPLINE / HARDWORKING & EXPERIENCED, WORKED IN IRAQ FOR 8 YEARS AS A DOMESTIC WORKER', { exact: true })).toBeVisible()
  await expect(secondPage.locator('[data-skill-check="Elderly Care"]')).toContainText('✓')
  await expect(secondPage.locator('[data-skill-check="Child Care"]')).toContainText('✓')
  await expect(secondPage.locator('[data-skill-check="Housework"]')).toContainText('✓')
  await expect(secondPage.locator('[data-skill-check="Cooking"]')).toContainText('✓')

  await page.screenshot({
    path: 'C:/Users/user/Desktop/Naim-CRM/cv-template-5-almelhem-final.png',
    fullPage: true,
  })
  expect(errors, 'Template 5 preview produced console/page errors').toEqual([])
})

test('Template 5 keeps both A4 pages and page breaks in print output', async ({ page }) => {
  const errors = []
  await openTemplateFive(page, errors)
  await page.emulateMedia({ media: 'print' })

  const preview = page.getByTestId('template-5-preview')
  const pages = preview.locator('.cv-t5-page')
  await expect(pages).toHaveCount(2)
  await expect(preview.getByRole('img', { name: 'Almelhem Recruitment Office logo' })).toBeVisible()
  await expect(preview.getByRole('img', { name: 'Naim Agency logo' })).toHaveCount(0)
  await expect(pages.nth(0)).toHaveCSS('break-after', 'page')
  await expect(pages.nth(1)).toHaveCSS('break-after', 'auto')
  await expect(pages.nth(0)).toHaveCSS('box-shadow', 'none')
  await expect(pages.nth(1)).toHaveCSS('box-shadow', 'none')
  expect(errors, 'Template 5 print view produced console/page errors').toEqual([])
})

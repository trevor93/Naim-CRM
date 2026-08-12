import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const storageKey = 'naim-cv-builder-draft'
const logoPath = '/assets/naim-agency-logo.webp'

async function expectTransparentLogo(logo) {
  await expect(logo).toBeVisible()
  await expect(logo).toHaveAttribute('src', logoPath)
  await expect(logo).toHaveCSS('object-fit', 'contain')
  await expect.poll(() => logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
}

test('only CV Templates 1, 3, and 4 use the transparent Naim Agency logo', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1366, height: 1519 })
  await page.goto(`${baseUrl}/cv-builder`)
  await page.evaluate((key) => localStorage.removeItem(key), storageKey)
  await page.reload()

  const templates = [
    { number: 1, wrapper: '.cv-t1-logo', logoCount: 1, wrapperCount: 1 },
    { number: 2, wrapper: '.cv-t2-logo', logoCount: 0, wrapperCount: 1 },
    { number: 3, wrapper: '.cv-t3-logo-slot', logoCount: 1, wrapperCount: 1 },
    { number: 5, wrapper: '.cv-t5-logo', logoCount: 0, wrapperCount: 1 },
    { number: 4, wrapper: '.cv-t4-logo', logoCount: 2, wrapperCount: 2 },
  ]

  for (const template of templates) {
    await page.getByText(`Template ${template.number}`, { exact: true }).click()
    await page.getByRole('button', { name: 'Preview CV' }).click()

    const preview = page.getByTestId(`template-${template.number}-preview`)
    const logos = preview.getByRole('img', { name: 'Naim Agency logo' })
    const wrappers = preview.locator(template.wrapper)

    await expect(preview).toBeVisible()
    await expect(logos).toHaveCount(template.logoCount)
    await expect(wrappers).toHaveCount(template.wrapperCount)

    for (let index = 0; index < template.logoCount; index += 1) {
      await expectTransparentLogo(logos.nth(index))
      await expect(wrappers.nth(index)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    }

    if (template.logoCount === 0) {
      await page.emulateMedia({ media: 'print' })
      await expect(logos).toHaveCount(0)
      await page.emulateMedia({ media: 'screen' })
    }

    await expect(preview.getByText('Logo', { exact: true })).toHaveCount(0)
    await expect(preview.getByText('Click to add logo', { exact: true })).toHaveCount(0)
    await expect(preview.getByText('اضغط لإضافة الشعار', { exact: true })).toHaveCount(0)

    await page.screenshot({
      path: `C:/Users/user/Desktop/Naim-CRM/naim-logo-template-${template.number}-transparent-final.png`,
      fullPage: true,
    })

    if (template.number !== 4) {
      await page.getByRole('button', { name: 'Edit' }).click()
    }
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByTestId('template-4-preview')).toBeVisible()
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth)
  expect(errors, 'CV logo workflow produced console/page errors').toEqual([])
})

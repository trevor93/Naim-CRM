import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const cvDraftKey = 'naim-cv-builder-draft'

async function expectLoadedLogo(logo) {
  await expect(logo).toBeVisible()
  await expect(logo).toHaveAttribute('src', '/assets/naim-agency-logo.webp')
  await expect.poll(() => logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
}

async function expectNoPageOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth)
}

test('the real Naim Agency logo appears across all approved brand surfaces', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1366, height: 900 })
  await page.goto(`${baseUrl}/dashboard`)

  const sidebar = page.locator('#app-sidebar')
  const sidebarLogo = sidebar.getByRole('img', { name: 'Naim Agency logo' })
  await expectLoadedLogo(sidebarLogo)
  await expect(sidebar).toHaveClass(/w-14/)
  await expect(sidebarLogo).toHaveCSS('object-fit', 'contain')
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/naim-logo-sidebar-collapsed-final.png', fullPage: true })

  await sidebar.getByTitle('Toggle menu').click()
  await expect(sidebar).toHaveClass(/w-52/)
  await expect(sidebar.getByText('Naim Investments', { exact: true })).toBeVisible()
  await expectLoadedLogo(sidebarLogo)
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/naim-logo-sidebar-final.png', fullPage: true })

  await page.goto(`${baseUrl}/cv-builder`)
  await page.evaluate((key) => localStorage.removeItem(key), cvDraftKey)
  await page.reload()

  await page.setViewportSize({ width: 390, height: 844 })
  await expectNoPageOverflow(page)

  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page).toHaveURL(`${baseUrl}/login`)
  await expect(page.getByRole('heading', { name: 'Naim CRM App' })).toBeVisible()
  await expect(page.locator('form')).toBeVisible()
  const loginLogo = page.getByRole('img', { name: 'Naim Agency logo' })
  await expectLoadedLogo(loginLogo)
  await expect(loginLogo).toHaveCSS('object-fit', 'contain')
  await expectNoPageOverflow(page)
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/naim-logo-login-mobile-final.png', fullPage: true })

  await page.setViewportSize({ width: 1366, height: 900 })
  await expectLoadedLogo(loginLogo)
  await expectNoPageOverflow(page)
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/naim-logo-login-final.png', fullPage: true })
  expect(errors, 'Logo workflow produced console/page errors').toEqual([])
})

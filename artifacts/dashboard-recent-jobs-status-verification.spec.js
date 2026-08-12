import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

const statusColors = {
  Active: {
    triggerBackground: 'rgb(220, 252, 231)',
    triggerBorder: 'rgb(187, 247, 208)',
    triggerText: 'rgb(21, 128, 61)',
    dot: 'rgb(34, 197, 94)',
  },
  Closed: {
    triggerBackground: 'rgb(249, 250, 251)',
    triggerBorder: 'rgb(229, 231, 235)',
    triggerText: 'rgb(17, 24, 39)',
    dot: 'rgb(156, 163, 175)',
  },
  Draft: {
    triggerBackground: 'rgb(254, 249, 195)',
    triggerBorder: 'rgb(253, 230, 138)',
    triggerText: 'rgb(133, 77, 14)',
    dot: 'rgb(250, 204, 21)',
  },
}

test('Recent Jobs status control matches the Active, Closed, and Draft reference dropdown', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1267, height: 505 })
  await page.goto(`${baseUrl}/dashboard#recent-jobs`)

  const section = page.locator('#recent-jobs')
  const trigger = section.getByRole('button', { name: 'Status for Cleaners' })
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toContainText('Active')
  await expect(trigger).toHaveCSS('background-color', statusColors.Active.triggerBackground)
  await expect(trigger).toHaveCSS('border-color', statusColors.Active.triggerBorder)
  await expect(trigger).toHaveCSS('color', statusColors.Active.triggerText)
  await expect(trigger).toHaveCSS('border-radius', '9999px')

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const menu = page.getByRole('menu', { name: 'Status options for Cleaners' })
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(menu).toHaveCSS('width', '150px')
  await expect(menu).toHaveCSS('box-shadow', /rgba\(0, 0, 0, 0\.1\)/)

  const triggerBox = await trigger.boundingBox()
  const menuBox = await menu.boundingBox()
  expect(Math.abs(menuBox.x - triggerBox.x)).toBeLessThanOrEqual(1)

  for (const status of ['Active', 'Closed', 'Draft']) {
    const option = menu.getByRole('menuitem', { name: status })
    await expect(option).toBeVisible()
    const dot = option.locator('[data-status-dot]')
    await expect(dot).toHaveCSS('background-color', statusColors[status].dot)
    await expect(dot).toHaveCSS('width', '8px')
    await expect(dot).toHaveCSS('height', '8px')
    await expect(dot).toHaveCSS('border-width', '0px')
    await expect(dot).toHaveCSS('border-radius', '9999px')
  }

  const activeOption = menu.getByRole('menuitem', { name: 'Active' })
  await expect(activeOption).toHaveAttribute('data-selected', 'true')
  await expect(activeOption).toHaveCSS('background-color', 'rgb(249, 250, 251)')

  await menu.getByRole('menuitem', { name: 'Draft' }).click()
  await expect(trigger).toContainText('Draft')
  await expect(trigger).toHaveCSS('background-color', statusColors.Draft.triggerBackground)
  await expect(trigger).toHaveCSS('border-color', statusColors.Draft.triggerBorder)
  await expect(trigger).toHaveCSS('color', statusColors.Draft.triggerText)
  await expect(menu).toBeHidden()

  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  const closedTrigger = section.getByRole('button', { name: 'Status for Personal Driver (Female)' })
  await expect(closedTrigger).toContainText('Closed')
  await expect(closedTrigger).toHaveCSS('background-color', statusColors.Closed.triggerBackground)
  await expect(closedTrigger).toHaveCSS('border-color', statusColors.Closed.triggerBorder)
  await expect(closedTrigger).toHaveCSS('color', statusColors.Closed.triggerText)

  await page.setViewportSize({ width: 390, height: 844 })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  await expect(menu).toBeVisible()

  await menu.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)))

  const narrowMenuBox = await menu.boundingBox()
  expect(narrowMenuBox.x).toBeGreaterThanOrEqual(0)
  expect(narrowMenuBox.x + narrowMenuBox.width).toBeLessThanOrEqual(390)

  const narrowTriggerBox = await trigger.boundingBox()
  expect(Math.abs((narrowMenuBox.x + narrowMenuBox.width) - (narrowTriggerBox.x + narrowTriggerBox.width))).toBeLessThanOrEqual(1)

  await page.screenshot({
    path: 'C:/Users/user/Desktop/Naim-CRM/dashboard-recent-jobs-status-dropdown-final.png',
    fullPage: true,
  })

  expect(errors, 'Recent Jobs status workflow produced console/page errors').toEqual([])
})

import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

const taskStatuses = {
  Pending: {
    triggerBackground: 'rgb(254, 249, 195)',
    triggerBorder: 'rgb(253, 230, 138)',
    triggerText: 'rgb(161, 98, 7)',
    dot: 'rgb(250, 204, 21)',
  },
  'In Progress': {
    triggerBackground: 'rgb(219, 234, 254)',
    triggerBorder: 'rgb(191, 219, 254)',
    triggerText: 'rgb(29, 78, 216)',
    dot: 'rgb(96, 165, 250)',
  },
  Completed: {
    triggerBackground: 'rgb(220, 252, 231)',
    triggerBorder: 'rgb(187, 247, 208)',
    triggerText: 'rgb(21, 128, 61)',
    dot: 'rgb(34, 197, 94)',
  },
  Overdue: {
    triggerBackground: 'rgb(254, 226, 226)',
    triggerBorder: 'rgb(254, 202, 202)',
    triggerText: 'rgb(220, 38, 38)',
    dot: 'rgb(248, 113, 113)',
  },
}

test('Recent Tasks status controls match the four-option reference dropdown with small solid dots', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1267, height: 700 })
  await page.goto(`${baseUrl}/dashboard#recent-tasks`)

  const section = page.locator('#recent-tasks')
  const trigger = section.getByRole('button', { name: 'Status for Follow up with Qatar Medical Center' })
  await trigger.scrollIntoViewIfNeeded()
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toContainText('Completed')
  await expect(trigger).toHaveCSS('background-color', taskStatuses.Completed.triggerBackground)
  await expect(trigger).toHaveCSS('border-color', taskStatuses.Completed.triggerBorder)
  await expect(trigger).toHaveCSS('color', taskStatuses.Completed.triggerText)
  await expect(trigger).toHaveCSS('border-radius', '9999px')

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const menu = page.getByRole('menu', { name: 'Status options for Follow up with Qatar Medical Center' })
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(menu).toHaveCSS('width', '150px')
  await expect(menu).toHaveCSS('box-shadow', /rgba\(0, 0, 0, 0\.1\)/)

  const triggerBox = await trigger.boundingBox()
  const menuBox = await menu.boundingBox()
  expect(Math.abs((menuBox.x + menuBox.width) - (triggerBox.x + triggerBox.width))).toBeLessThanOrEqual(1)

  for (const status of ['Pending', 'In Progress', 'Completed', 'Overdue']) {
    const option = menu.getByRole('menuitem', { name: status })
    await expect(option).toBeVisible()

    const dot = option.locator('[data-status-dot]')
    await expect(dot).toHaveCSS('background-color', taskStatuses[status].dot)
    await expect(dot).toHaveCSS('width', '8px')
    await expect(dot).toHaveCSS('height', '8px')
    await expect(dot).toHaveCSS('border-width', '0px')
    await expect(dot).toHaveCSS('border-radius', '9999px')
  }

  const completedOption = menu.getByRole('menuitem', { name: 'Completed' })
  await expect(completedOption).toHaveAttribute('data-selected', 'true')
  await expect(completedOption).toHaveCSS('background-color', 'rgb(249, 250, 251)')

  await menu.getByRole('menuitem', { name: 'Pending' }).click()
  await expect(trigger).toContainText('Pending')
  await expect(trigger).toHaveCSS('background-color', taskStatuses.Pending.triggerBackground)
  await expect(trigger).toHaveCSS('border-color', taskStatuses.Pending.triggerBorder)
  await expect(trigger).toHaveCSS('color', taskStatuses.Pending.triggerText)
  await expect(menu).toBeHidden()

  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  const inProgressTrigger = section.getByRole('button', { name: 'Status for Schedule Medical Exam for James Omondi' })
  await expect(inProgressTrigger).toContainText('In Progress')
  await expect(inProgressTrigger).toHaveCSS('background-color', taskStatuses['In Progress'].triggerBackground)
  await expect(inProgressTrigger).toHaveCSS('border-color', taskStatuses['In Progress'].triggerBorder)
  await expect(inProgressTrigger).toHaveCSS('color', taskStatuses['In Progress'].triggerText)

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
    path: 'C:/Users/user/Desktop/Naim-CRM/dashboard-recent-tasks-status-dropdown-final.png',
    fullPage: true,
  })

  expect(errors, 'Recent Tasks status workflow produced console/page errors').toEqual([])
})

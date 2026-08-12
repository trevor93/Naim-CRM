import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const storageKey = 'naim-recycle-bin-items'

test('Recycle Bin reference layout and local workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/recycle-bin`)
  await page.evaluate((key) => localStorage.removeItem(key), storageKey)
  await page.reload()

  await expect(page.getByRole('main').getByRole('heading', { name: 'Recycle Bin', exact: true })).toBeVisible()
  await expect(page.getByText('Recover recently deleted items. Items are automatically deleted after 30 days.', { exact: true })).toBeVisible()
  await expect(page.getByTestId('recycle-bin-panel')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Deleted Items', exact: true })).toBeVisible()
  await expect(page.getByLabel('Search deleted items')).toHaveAttribute('placeholder', 'Search deleted items...')
  await expect(page.getByLabel('Deleted item type')).toHaveValue('all')
  await expect(page.getByRole('button', { name: 'Select All' })).toBeVisible()
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(15)

  await expect(page.getByText('MERCY HABEL MWAMBANGA', { exact: true })).toHaveCount(3)
  await expect(page.getByText('JULIA KEYA BARASA', { exact: true })).toHaveCount(12)
  await expect(page.getByText('candidate', { exact: true })).toHaveCount(15)
  await expect(page.getByText('Deleted about 2 months ago', { exact: true })).toHaveCount(15)
  await expect(page.getByText('Auto-deletion Policy', { exact: true })).toBeVisible()
  await expect(page.getByText('Items in the recycle bin are automatically deleted after 30 days. Restore important items before they are permanently removed.', { exact: true })).toBeVisible()

  await page.getByLabel('Search deleted items').fill('1780052470377')
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(1)
  await expect(page.getByText('JULIA KEYA BARASA', { exact: true })).toBeVisible()
  await page.getByLabel('Search deleted items').fill('')

  await page.getByLabel('Deleted item type').selectOption('candidate')
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(15)
  await page.getByLabel('Deleted item type').selectOption('all')

  await page.getByRole('button', { name: 'Select All' }).click()
  await expect(page.getByRole('checkbox', { name: /^Select deleted item/ })).toHaveCount(15)
  for (const checkbox of await page.getByRole('checkbox', { name: /^Select deleted item/ }).all()) {
    await expect(checkbox).toBeChecked()
  }
  await page.getByRole('button', { name: 'Select All' }).click()

  await page.getByRole('button', { name: 'Restore MERCY HABEL MWAMBANGA 1781021361040@temp.com' }).click()
  await expect(page.getByRole('status').last()).toContainText('Item restored')
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(14)
  await page.reload()
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(14)

  await page.getByRole('button', { name: 'Delete MERCY HABEL MWAMBANGA 1781021513702@temp.com' }).click()
  let confirmation = page.getByRole('dialog', { name: 'Permanently Delete Item' })
  await confirmation.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByText('1781021513702@temp.com', { exact: false })).toBeVisible()

  await page.getByRole('button', { name: 'Delete MERCY HABEL MWAMBANGA 1781021513702@temp.com' }).click()
  confirmation = page.getByRole('dialog', { name: 'Permanently Delete Item' })
  await confirmation.getByRole('button', { name: 'Delete Permanently' }).click()
  await expect(page.getByRole('status').last()).toContainText('Item permanently deleted')
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(13)
  await page.reload()
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(13)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Recycle Bin', exact: true })).toBeVisible()
  const mobileDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(mobileDimensions.documentWidth).toBe(mobileDimensions.viewportWidth)

  await page.evaluate((key) => localStorage.removeItem(key), storageKey)
  await page.setViewportSize({ width: 1366, height: 2281 })
  await page.reload()
  await expect(page.getByTestId('recycle-bin-item')).toHaveCount(15)
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/recycle-bin-final.png', fullPage: true })
  expect(errors, 'Recycle Bin workflow produced console/page errors').toEqual([])
})

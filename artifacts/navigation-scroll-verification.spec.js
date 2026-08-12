import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('new pages start at the top while Back and Forward restore history', async ({ page }) => {
  await page.goto(`${baseUrl}/cv-builder`)
  await expect(page.getByRole('heading', { name: 'CV Builder with Multiple Templates' })).toBeVisible()

  await page.evaluate(() => {
    const browserScrollTo = window.scrollTo.bind(window)
    window.__scrollCalls = []
    window.scrollTo = (...coordinates) => {
      window.__scrollCalls.push(coordinates)
      browserScrollTo(...coordinates)
    }
  })

  await page.evaluate(() => window.scrollTo(0, 900))
  const cvBuilderScroll = await page.evaluate(() => window.scrollY)
  expect(cvBuilderScroll).toBeGreaterThan(0)

  await page.getByRole('link', { name: 'Settings' }).click()
  await expect(page).toHaveURL(`${baseUrl}/settings`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Settings', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  await expect.poll(() => page.evaluate(() => window.__scrollCalls.at(-1))).toEqual([0, 0])

  await page.evaluate(() => window.scrollTo(0, 600))
  const settingsScroll = await page.evaluate(() => window.scrollY)
  expect(settingsScroll).toBeGreaterThan(0)

  await page.getByRole('link', { name: 'Recycle Bin' }).click()
  await expect(page).toHaveURL(`${baseUrl}/recycle-bin`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Recycle Bin', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await expect.poll(() => page.evaluate(() => window.__scrollCalls.at(-1))).toEqual([0, 0])

  await page.evaluate(() => { window.__scrollCalls = [] })
  await page.goBack()
  await expect(page).toHaveURL(`${baseUrl}/settings`)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(settingsScroll)
  expect(await page.evaluate(() => window.__scrollCalls)).toEqual([])

  await page.goBack()
  await expect(page).toHaveURL(`${baseUrl}/cv-builder`)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(cvBuilderScroll)
  expect(await page.evaluate(() => window.__scrollCalls)).toEqual([])

  await page.goForward()
  await expect(page).toHaveURL(`${baseUrl}/settings`)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(settingsScroll)
  expect(await page.evaluate(() => window.__scrollCalls)).toEqual([])

  await page.goForward()
  await expect(page).toHaveURL(`${baseUrl}/recycle-bin`)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  expect(await page.evaluate(() => window.__scrollCalls)).toEqual([])
})

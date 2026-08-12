import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('browser favicon uses the circular transparent Naim logo asset', async ({ page }) => {
  await page.goto(`${baseUrl}/dashboard`)

  const favicon = page.locator('link[rel="icon"]')
  await expect(favicon).toHaveCount(1)
  await expect(favicon).toHaveAttribute('type', 'image/png')
  await expect(favicon).toHaveAttribute('href', '/assets/naim-agency-favicon.png')

  const iconResult = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="icon"]')
    const image = new Image()
    image.src = link.href
    await image.decode()

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)

    const corners = [
      context.getImageData(0, 0, 1, 1).data[3],
      context.getImageData(canvas.width - 1, 0, 1, 1).data[3],
      context.getImageData(0, canvas.height - 1, 1, 1).data[3],
      context.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data[3],
    ]
    const centerAlpha = context.getImageData(
      Math.floor(canvas.width / 2),
      Math.floor(canvas.height / 2),
      1,
      1,
    ).data[3]

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      corners,
      centerAlpha,
    }
  })

  expect(iconResult.width).toBe(iconResult.height)
  expect(iconResult.width).toBeGreaterThanOrEqual(64)
  expect(iconResult.corners).toEqual([0, 0, 0, 0])
  expect(iconResult.centerAlpha).toBe(255)
})

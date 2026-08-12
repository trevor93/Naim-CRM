import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const storageKey = 'naim-cv-builder-draft'

const sectionHeadings = [
  'Upload CV for Auto-fill',
  'Select CV Template',
  'Company Letterhead Information',
  'Position Information',
  'Passport Details',
  'Personal Information',
  'Physical Details',
  'Family Status',
  'Education & Experience',
  'Other Information',
  'EXTRA INFORMATION FOR TEMPLATE 3',
  'Remarks',
  'Skills Selection',
  'Photo Upload',
  'Document Upload',
  'Media Upload',
]

test('CV Builder matches the supplied layout and supports local workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/cv-builder`)
  await page.evaluate((key) => localStorage.removeItem(key), storageKey)
  await page.reload()

  await expect(page.getByRole('main').getByRole('heading', { name: 'CV Builder with Multiple Templates' })).toBeVisible()
  await expect(page.getByText('Create professional CVs with our easy-to-use builder', { exact: true })).toBeVisible()
  await expect(page.getByTestId('cv-builder-panel')).toBeVisible()
  await expect(page.getByText('Professional CV Builder - Saudi Recruitment', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Auto-save')).toBeChecked()
  await expect(page.getByRole('button', { name: 'Save Draft' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Preview CV' })).toBeVisible()

  for (const heading of sectionHeadings) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }

  await expect(page.getByLabel('CV template')).toHaveCount(5)
  await expect(page.getByLabel('CV template', { exact: false }).nth(2)).toBeChecked()
  await expect(page.getByText('NAIM INVESTMENTS', { exact: true })).toHaveCount(2)
  const templateOneOption = page.getByText('Template 1', { exact: true }).locator('..')
  await expect(templateOneOption).toContainText('NAIM INVESTMENT LIMITED')
  await expect(templateOneOption).toContainText('(Green Headers)')
  const templateTwoOption = page.getByText('Template 2', { exact: true }).locator('..')
  await expect(templateTwoOption).toContainText('MODERN LAYOUT')
  await expect(templateTwoOption).toContainText('(Blue Headers)')
  await expect(page.getByLabel('Company Name', { exact: true })).toHaveValue('NAIM INVESTMENT OFFICE')
  await expect(page.getByLabel('Position', { exact: true })).toHaveValue('DOMESTIC WORKER')
  await expect(page.getByLabel('Salary')).toHaveValue('1100')
  await expect(page.getByLabel('Passport Number')).toHaveValue('AK0597068')
  await expect(page.getByLabel('Full Name', { exact: true })).toHaveValue('AMINA ALI KAKAWA')
  await expect(page.getByLabel('Work City')).toHaveValue('TANA DELTA, KENYA')
  await expect(page.getByLabel('Stage')).toHaveValue('Onboarding')

  const skills = ['ARABIC DISH COOKING', 'CLEANING', 'WASHING', 'IRONING', 'BABYSITTING', 'CARING ELDERS']
  for (const skill of skills) await expect(page.getByRole('checkbox', { name: skill })).toBeChecked()

  await page.getByText('Template 2', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'EXTRA INFORMATION FOR TEMPLATE 3' })).toBeHidden()
  await page.getByText('Template 3', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'EXTRA INFORMATION FOR TEMPLATE 3' })).toBeVisible()

  await page.getByPlaceholder('Enter new skill...').fill('FIRST AID')
  await page.getByRole('button', { name: 'Add Skills' }).click()
  await expect(page.getByRole('checkbox', { name: 'FIRST AID' })).toBeChecked()
  await page.getByRole('button', { name: 'Remove FIRST AID' }).click()
  await expect(page.getByRole('checkbox', { name: 'FIRST AID' })).toHaveCount(0)

  await page.getByLabel('Full Name', { exact: true }).fill('FATUMA TEST CANDIDATE')
  await page.getByRole('button', { name: 'Save Draft' }).first().click()
  await expect(page.getByRole('status').last()).toContainText('Draft saved')
  await page.reload()
  await expect(page.getByLabel('Full Name', { exact: true })).toHaveValue('FATUMA TEST CANDIDATE')

  await page.getByText('Template 1', { exact: true }).click()
  await page.getByRole('button', { name: 'Preview CV' }).click()

  const preview = page.getByTestId('cv-preview-screen')
  const template = page.getByTestId('template-1-preview')
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('heading', { name: 'CV Preview - FATUMA TEST CANDIDATE' })).toBeVisible()
  await expect(preview.getByRole('button', { name: 'Edit' })).toBeVisible()
  await expect(preview.getByRole('button', { name: 'Save Draft' })).toBeVisible()
  await expect(preview.getByRole('button', { name: 'Print/Download' })).toBeVisible()
  await expect(template.getByRole('heading', { name: 'NAIM INVESTMENT LIMITED' })).toBeVisible()
  await expect(template.getByText('HOUSEMAID APPLICATION FORM', { exact: true })).toBeVisible()
  await expect(template.getByText('بيانات طلب الخادمة', { exact: true })).toBeVisible()
  await expect(template.getByText('PERSONAL INFORMATION', { exact: true })).toBeVisible()
  await expect(template.getByText('PASSPORT DETAILS', { exact: true })).toBeVisible()
  await expect(template.getByText('SPOKEN LANGUAGE', { exact: true })).toBeVisible()
  await expect(template.getByText('WORK EXPERIENCE', { exact: true })).toBeVisible()
  await expect(template.getByText('DUTIES', { exact: true })).toBeVisible()
  await expect(template.getByText('FATUMA TEST CANDIDATE', { exact: true })).toBeVisible()
  await expect(template.getByText('DOMESTIC WORKER', { exact: true })).toHaveCount(2)
  await expect(template.getByText('1100', { exact: true })).toBeVisible()
  await expect(template.getByText('AK0597068', { exact: true })).toBeVisible()
  await expect(template.getByText('YES /YES', { exact: true })).toBeVisible()
  await expect(template).toContainText('COOPERATIVE / HIGHLY DISCIPLINE')

  const printSetup = await template.evaluate((documentElement) => {
    const hasPortraitPageRule = [...document.styleSheets].some((styleSheet) =>
      [...styleSheet.cssRules].some((rule) =>
        rule.selectorText === 'cv-template-page'
        && rule.style?.getPropertyValue('size') === 'a4',
      ),
    )

    return {
      pageName: getComputedStyle(documentElement).getPropertyValue('page'),
      hasPortraitPageRule,
    }
  })
  expect(printSetup).toEqual({
    pageName: 'cv-template-page',
    hasPortraitPageRule: true,
  })

  await preview.getByRole('button', { name: 'Save Draft' }).click()
  await expect(page.getByRole('status').last()).toContainText('Draft saved')
  await page.evaluate(() => {
    window.__cvPrintCalled = false
    window.print = () => { window.__cvPrintCalled = true }
  })
  await preview.getByRole('button', { name: 'Print/Download' }).click()
  await expect.poll(() => page.evaluate(() => window.__cvPrintCalled)).toBe(true)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(template).toBeVisible()
  const previewDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(previewDimensions.documentWidth).toBe(previewDimensions.viewportWidth)

  await page.setViewportSize({ width: 1366, height: 1446 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/template-1-preview-final.png', fullPage: true })

  await preview.getByRole('button', { name: 'Edit' }).click()
  await expect(page.getByLabel('Full Name', { exact: true })).toHaveValue('FATUMA TEST CANDIDATE')

  await page.getByText('Template 2', { exact: true }).click()
  await page.getByRole('button', { name: 'Preview CV' }).click()

  const templateTwoPreview = page.getByTestId('cv-preview-screen')
  const templateTwo = page.getByTestId('template-2-preview')
  await expect(templateTwoPreview).toBeVisible()
  await expect(templateTwo).toBeVisible()
  await expect(templateTwo.getByRole('heading', { name: 'NAIM INVESTMENT OFFICE' })).toBeVisible()
  await expect(templateTwo.getByText('P O Box 80249-80100 Mombasa, Kenya', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('CONTACT NUMBER: +254720931164', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('POSITION APPLYING FOR', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('SALARY: 1100', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('PASSPORT DETAILS', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('AK0597068', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('NAME IN FULL', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('FATUMA TEST CANDIDATE', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('PERSONAL INFORMATION', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('LANGUAGES LEVEL', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('EDUCATION LEVEL', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('WORK EXPERIENCE', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('SKILLS', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('Profile Photo', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('Full Body Photo', { exact: true })).toBeVisible()
  await expect(templateTwo.getByText('YES', { exact: true })).toHaveCount(6)
  await expect(templateTwo.getByText('REMARKS', { exact: true })).toBeVisible()
  await expect(templateTwo).toContainText('COOPERATIVE / HIGHLY DISCIPLINE')

  const templateTwoPrintSetup = await templateTwo.evaluate((documentElement) => ({
    pageName: getComputedStyle(documentElement).getPropertyValue('page'),
    hasPortraitPageRule: [...document.styleSheets].some((styleSheet) =>
      [...styleSheet.cssRules].some((rule) =>
        rule.selectorText === 'cv-template-page'
        && rule.style?.getPropertyValue('size') === 'a4',
      ),
    ),
  }))
  expect(templateTwoPrintSetup).toEqual({
    pageName: 'cv-template-page',
    hasPortraitPageRule: true,
  })

  await templateTwoPreview.getByRole('button', { name: 'Save Draft' }).click()
  await expect(page.getByRole('status').last()).toContainText('Draft saved')
  await page.evaluate(() => {
    window.__cvTemplateTwoPrintCalled = false
    window.print = () => { window.__cvTemplateTwoPrintCalled = true }
  })
  await templateTwoPreview.getByRole('button', { name: 'Print/Download' }).click()
  await expect.poll(() => page.evaluate(() => window.__cvTemplateTwoPrintCalled)).toBe(true)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(templateTwo).toBeVisible()
  const templateTwoDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(templateTwoDimensions.documentWidth).toBe(templateTwoDimensions.viewportWidth)

  await page.setViewportSize({ width: 1366, height: 1446 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/template-2-preview-final.png', fullPage: true })

  await templateTwoPreview.getByRole('button', { name: 'Edit' }).click()
  await expect(page.getByLabel('Full Name', { exact: true })).toHaveValue('FATUMA TEST CANDIDATE')

  await page.getByRole('button', { name: 'Clear Storage' }).click()
  const confirmation = page.getByRole('dialog', { name: 'Clear CV Builder Storage' })
  await confirmation.getByRole('button', { name: 'Clear Storage' }).click()
  await expect(page.getByLabel('Full Name', { exact: true })).toHaveValue('AMINA ALI KAKAWA')

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'CV Builder with Multiple Templates' })).toBeVisible()
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth)

  expect(errors, 'CV Builder workflow produced console/page errors').toEqual([])
})

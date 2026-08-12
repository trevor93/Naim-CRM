import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Settings reference layout and local workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/settings`)
  await page.evaluate(() => localStorage.removeItem('recruitment-settings'))
  await page.reload()

  await expect(page.getByRole('main').getByRole('heading', { name: 'Settings', exact: true })).toBeVisible()
  await expect(page.getByText('Manage your account settings and preferences')).toBeVisible()
  await expect(page.getByText('All Changes Saved', { exact: true })).toBeVisible()
  await expect(page.getByText('All settings are synchronized', { exact: true })).toBeVisible()

  const cards = [
    'user-management',
    'profile-information',
    'application-settings',
    'security-settings',
    'notification-preferences',
    'account-information',
    'settings-management',
  ]
  for (const card of cards) await expect(page.getByTestId(card)).toBeVisible()

  for (const heading of [
    'User Management',
    'Profile Information',
    'Application Settings',
    'Security Settings',
    'Notification Preferences',
    'Account Information',
    'Settings Management',
  ]) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }

  const userTable = page.getByTestId('settings-users-table')
  await expect(userTable.getByRole('columnheader')).toHaveText([
    'User',
    'Role',
    'Status',
    'Last Login',
    'Permissions',
    'Actions',
  ])
  await expect(userTable.locator('tbody tr')).toHaveCount(0)

  await expect(page.getByLabel('Full Name')).toHaveValue('Admin User (Dev Mode - No Auth)')
  await expect(page.getByLabel('Email Address')).toHaveValue('admin@naiminvestments.com')
  await expect(page.getByLabel('Role', { exact: true })).toHaveValue('Admin')
  await expect(page.getByLabel('Application Name')).toHaveValue('Recruitment CRM')
  await expect(page.getByLabel('Default User Role')).toHaveValue('Broker')
  await expect(page.getByLabel('Data Retention (Days)')).toHaveValue('1-year')
  await expect(page.getByLabel('Default Country')).toHaveValue('Kenya')
  await expect(page.getByLabel('Default Currency')).toHaveValue('KES')
  await expect(page.getByLabel('Auto-logout after inactivity')).toHaveValue('30')
  await expect(page.getByText('dev-admin-001', { exact: true })).toBeVisible()
  await expect(page.getByText('8/7/2026, 11:55:17 PM', { exact: true })).toBeVisible()
  await expect(page.getByTestId('account-information').getByText('Active', { exact: true })).toBeVisible()

  for (const label of [
    'Email Notifications',
    'WhatsApp Notifications',
    'Task Reminders',
    'Candidate Updates',
  ]) {
    await expect(page.getByRole('checkbox', { name: label })).toBeChecked()
  }

  // Add, edit, delete, cancel delete, and persistence.
  await page.getByRole('button', { name: 'Add User' }).click()
  let userDialog = page.getByRole('dialog', { name: 'Add User' })
  await userDialog.getByRole('button', { name: 'Add User' }).click()
  await expect(userDialog.getByText('Full name is required', { exact: true })).toBeVisible()
  await expect(userDialog.getByText('Last login is required', { exact: true })).toBeVisible()
  await userDialog.getByLabel('Full Name').fill('Amina Ali')
  await userDialog.getByLabel('Role').selectOption('Broker')
  await userDialog.getByLabel('Status').selectOption('Active')
  await userDialog.getByLabel('Last Login').fill('Today')
  await userDialog.getByLabel('Permissions').fill('Candidates')
  await userDialog.getByRole('button', { name: 'Add User' }).click()
  await expect(userTable.locator('tbody tr')).toHaveCount(1)
  await expect(userTable.getByText('Amina Ali', { exact: true })).toBeVisible()
  await page.reload()
  await expect(userTable.getByText('Amina Ali', { exact: true })).toBeVisible()

  await userTable.getByRole('button', { name: 'Edit Amina Ali' }).click()
  userDialog = page.getByRole('dialog', { name: 'Edit User' })
  await userDialog.getByLabel('Permissions').fill('Candidates, Jobs')
  await userDialog.getByRole('button', { name: 'Save Changes' }).click()
  await expect(userTable.getByText('Candidates, Jobs', { exact: true })).toBeVisible()

  await userTable.getByRole('button', { name: 'Delete Amina Ali' }).click()
  let confirmation = page.getByRole('dialog', { name: 'Delete User' })
  await confirmation.getByRole('button', { name: 'Cancel' }).click()
  await expect(userTable.getByText('Amina Ali', { exact: true })).toBeVisible()
  await userTable.getByRole('button', { name: 'Delete Amina Ali' }).click()
  confirmation = page.getByRole('dialog', { name: 'Delete User' })
  await confirmation.getByRole('button', { name: 'Delete User' }).click()
  await expect(userTable.locator('tbody tr')).toHaveCount(0)

  // Re-add so Reset can prove local rows are cleared.
  await page.getByRole('button', { name: 'Add User' }).click()
  userDialog = page.getByRole('dialog', { name: 'Add User' })
  await userDialog.getByLabel('Full Name').fill('Amina Ali')
  await userDialog.getByLabel('Last Login').fill('Today')
  await userDialog.getByLabel('Permissions').fill('Candidates')
  await userDialog.getByRole('button', { name: 'Add User' }).click()

  // Profile validation and persistence.
  await page.getByLabel('Full Name').fill('')
  await page.getByRole('button', { name: 'Update Profile' }).click()
  await expect(page.getByTestId('profile-information').getByText('Full name is required')).toBeVisible()
  await page.getByLabel('Full Name').fill('Admin User Updated')
  await page.getByRole('button', { name: 'Update Profile' }).click()
  await expect(page.getByRole('status').last()).toContainText('Profile updated!')
  await page.reload()
  await expect(page.getByLabel('Full Name')).toHaveValue('Admin User Updated')

  // Application and notification persistence.
  await page.getByLabel('Application Name').fill('NAIM Recruitment CRM')
  await page.getByLabel('Default Country').selectOption('Kuwait')
  await page.getByRole('checkbox', { name: 'Email Notifications' }).uncheck()
  await page.reload()
  await expect(page.getByLabel('Application Name')).toHaveValue('NAIM Recruitment CRM')
  await expect(page.getByLabel('Default Country')).toHaveValue('Kuwait')
  await expect(page.getByRole('checkbox', { name: 'Email Notifications' })).not.toBeChecked()

  // Safe password simulation.
  await page.getByRole('button', { name: 'Change Password' }).click()
  let passwordDialog = page.getByRole('dialog', { name: 'Change Password' })
  await passwordDialog.getByLabel('New Password').fill('short')
  await passwordDialog.getByLabel('Confirm Password').fill('different')
  await passwordDialog.getByRole('button', { name: 'Change Password' }).click()
  await expect(passwordDialog.getByText('Password must be at least 8 characters')).toBeVisible()
  await expect(passwordDialog.getByText('Passwords do not match')).toBeVisible()
  await passwordDialog.getByLabel('New Password').fill('SecurePass1!')
  await passwordDialog.getByLabel('Confirm Password').fill('SecurePass1!')
  await passwordDialog.getByRole('button', { name: 'Change Password' }).click()
  await expect(passwordDialog).toHaveCount(0)
  await expect(page.getByRole('status').last()).toContainText('Password updated securely')

  await page.getByRole('button', { name: 'Enable 2FA (Coming Soon)' }).click()
  await expect(page.getByRole('status').last()).toContainText(/coming soon/i)

  // Export is normalized and never contains password text.
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Settings' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('naim-crm-settings.json')
  const fs = await import('node:fs/promises')
  const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'))
  const exportedText = JSON.stringify(exported)
  expect(exportedText).not.toContain('SecurePass1!')
  expect(exported).not.toHaveProperty('password')
  expect(exported).not.toHaveProperty('confirmPassword')

  // Valid and invalid import.
  await page.getByLabel('Import Settings file').setInputFiles({
    name: 'settings.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      application: { name: 'Recruitment CRM', country: 'Kenya' },
      notifications: { email: true },
    })),
  })
  await expect(page.getByLabel('Application Name')).toHaveValue('Recruitment CRM')
  await expect(page.getByLabel('Default Country')).toHaveValue('Kenya')
  await expect(page.getByRole('checkbox', { name: 'Email Notifications' })).toBeChecked()

  await page.getByLabel('Import Settings file').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{invalid'),
  })
  await expect(page.getByRole('alert').last()).toContainText('Invalid settings file')
  await expect(page.getByLabel('Application Name')).toHaveValue('Recruitment CRM')

  // Reset restores exact screenshot defaults and clears users.
  await page.getByRole('button', { name: 'Reset to Defaults' }).click()
  confirmation = page.getByRole('dialog', { name: 'Reset Settings' })
  await confirmation.getByRole('button', { name: 'Reset to Defaults' }).click()
  await expect(page.getByLabel('Full Name')).toHaveValue('Admin User (Dev Mode - No Auth)')
  await expect(page.getByLabel('Application Name')).toHaveValue('Recruitment CRM')
  await expect(page.getByLabel('Default Country')).toHaveValue('Kenya')
  await expect(userTable.locator('tbody tr')).toHaveCount(0)

  // Responsive layout: page does not overflow; table scrolls internally.
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible()
  const overflowDiagnostics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1
      })
      .map((element) => ({
        tag: element.tagName,
        className: typeof element.className === 'string' ? element.className : '',
        text: (element.textContent || '').trim().slice(0, 80),
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      }))
      .slice(0, 20),
  }))
  expect(overflowDiagnostics, JSON.stringify(overflowDiagnostics, null, 2)).toMatchObject({
    documentWidth: overflowDiagnostics.viewportWidth,
  })
  expect(await page.getByTestId('settings-users-scroll').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)

  await page.setViewportSize({ width: 1366, height: 2193 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/settings-final.png', fullPage: true })
  expect(errors, 'Settings workflow produced console/page errors').toEqual([])
})

import { test, expect } from 'playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Tasks Page reference layout and workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/tasks`)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()
  await expect(page.getByText('Manage and track all tasks across your recruitment process')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Auto-Delete' })).toBeVisible()
  for (const label of ['Total', 'Pending', 'In Progress', 'Completed', 'Overdue']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible()
  }
  await expect(page.getByRole('heading', { name: 'All Tasks' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Task' })).toBeVisible()
  await expect(page.getByLabel('Search tasks')).toBeVisible()
  await expect(page.getByLabel('Filter tasks by status')).toBeVisible()
  await expect(page.getByLabel('Filter tasks by priority')).toBeVisible()
  await expect(page.getByLabel('Select all tasks')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Archive Completed' })).toBeVisible()
  await expect(page.getByRole('table').getByText('Follow up with Qatar Medical Center')).toBeVisible()
  await expect(page.getByRole('table').getByText('Schedule Medical Exam for James Omondi')).toBeVisible()

  await page.getByRole('button', { name: 'Add Task' }).click()
  const addDialog = page.getByRole('dialog', { name: 'Add Task' })
  await addDialog.getByRole('button', { name: 'Create Task' }).click()
  await expect(addDialog.getByText('Title is required')).toBeVisible()
  await addDialog.getByLabel('Title').fill('Prepare candidate documents')
  await addDialog.getByLabel('Description').fill('Collect and verify passport copies')
  await addDialog.getByLabel('Assigned To').fill('Reception Team')
  await addDialog.getByLabel('Due Date').fill('2026-08-01')
  await addDialog.getByLabel('Priority').selectOption('High')
  await addDialog.getByLabel('Category').selectOption('Documentation')
  await addDialog.getByRole('button', { name: 'Create Task' }).click()
  await expect(page.getByRole('table').getByText('Prepare candidate documents')).toBeVisible()

  await page.getByRole('button', { name: 'Edit Prepare candidate documents' }).click()
  const editDialog = page.getByRole('dialog', { name: 'Edit Task' })
  await editDialog.getByLabel('Title').fill('Prepare verified documents')
  await editDialog.getByRole('button', { name: 'Update Task' }).click()
  await expect(page.getByRole('table').getByText('Prepare verified documents')).toBeVisible()

  const taskTable = page.getByRole('table')
  await taskTable.getByLabel('Priority for Schedule Medical Exam for James Omondi').selectOption('High')
  await expect(taskTable.getByLabel('Priority for Schedule Medical Exam for James Omondi')).toHaveValue('High')
  await taskTable.getByLabel('Category for Schedule Medical Exam for James Omondi').selectOption('Interview')
  await expect(taskTable.getByLabel('Category for Schedule Medical Exam for James Omondi')).toHaveValue('Interview')
  await taskTable.getByLabel('Status for Schedule Medical Exam for James Omondi').selectOption('Completed')
  await expect(taskTable.getByLabel('Status for Schedule Medical Exam for James Omondi')).toHaveValue('Completed')

  await page.getByLabel('Search tasks').fill('verified')
  await expect(page.getByRole('table').getByText('Prepare verified documents')).toBeVisible()
  await expect(page.getByText('Follow up with Qatar Medical Center')).toHaveCount(0)
  await page.getByLabel('Search tasks').fill('')
  await page.getByLabel('Filter tasks by status').selectOption('Completed')
  await page.getByLabel('Filter tasks by priority').selectOption('High')
  await expect(page.getByRole('table').getByText('Schedule Medical Exam for James Omondi')).toBeVisible()
  await page.getByLabel('Filter tasks by status').selectOption('')
  await page.getByLabel('Filter tasks by priority').selectOption('')

  await page.getByRole('button', { name: 'Sort by Task' }).click()
  await expect(page.getByRole('button', { name: 'Sort by Task' })).toHaveAttribute('data-direction', 'asc')
  await page.getByLabel('Select all tasks').check()
  await expect(page.getByRole('table').getByLabel('Select task Follow up with Qatar Medical Center')).toBeChecked()
  await page.getByLabel('Select all tasks').uncheck()

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Delete Prepare verified documents' }).click()
  await expect(page.getByRole('table').getByText('Prepare verified documents')).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete Prepare verified documents' }).click()
  await expect(page.getByText('Prepare verified documents')).toHaveCount(0)

  await page.getByRole('button', { name: 'Auto-Delete' }).click()
  const autoDialog = page.getByRole('dialog', { name: 'Auto-Delete Settings' })
  await expect(autoDialog.getByLabel('Delete completed tasks after')).toHaveValue('30')
  await autoDialog.getByLabel('Delete completed tasks after').selectOption('7')
  await autoDialog.getByRole('button', { name: 'Save Settings' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Auto-delete settings saved' })).toBeVisible()

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Archive Completed' }).click()
  await expect(page.getByRole('table').getByText('Follow up with Qatar Medical Center')).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Archive Completed' }).click()
  await expect(page.getByText('Follow up with Qatar Medical Center')).toHaveCount(0)

  await page.goto(`${baseUrl}/receptionist-view`)
  await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible()
  await page.goto(`${baseUrl}/documents`)
  await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible()
  await page.goto(`${baseUrl}/tasks`)
  errors.length = 0
  await page.reload()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.setViewportSize({ width: 1366, height: 785 })
  await page.screenshot({ path: 'C:/Users/user/Desktop/Naim-CRM/tasks-final.png', fullPage: true })
  expect(errors).toEqual([])
})

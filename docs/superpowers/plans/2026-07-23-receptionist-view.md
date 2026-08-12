# Receptionist View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the candidate-lookup-only Receptionist View with the fully functional dashboard shown in the supplied reference while preserving the completed Documents area and shared application shell.

**Architecture:** Keep page data and optimistic interaction state in `ReceptionistViewPage.jsx`, extract only the reusable dropdown and email modal into focused receptionist components, and use existing candidate/job/task/appointment services with the established demo-mode fallback. A dedicated Playwright spec drives implementation and verifies navigation, modal behavior, data controls, responsiveness, regressions, and the final screenshot.

**Tech Stack:** React 18, React Router, Tailwind CSS, Lucide React, Supabase service wrappers, Vite, ESLint/Oxlint, Playwright.

**Repository constraint:** Do not create commits or push. Each task ends with a working-tree checkpoint instead of a commit.

---

## File Structure

- Modify `src/pages/ReceptionistViewPage.jsx`: page composition, data loading, reference layout, navigation, candidate/task updates, task filtering, and modal state.
- Create `src/components/receptionist/StatusMenu.jsx`: accessible reusable pill menu used for candidate and task statuses.
- Create `src/components/receptionist/EmailComposerModal.jsx`: controlled in-app recipient/subject/message form with validation and simulated send callback.
- Create `artifacts/receptionist-view-verification.spec.js`: full browser workflow, responsive assertions, regression navigation, console capture, and screenshot.
- Preserve `src/pages/DocumentsPage.jsx`, `src/components/documents/**`, and all shared layout files unless a verified shell defect blocks the page.

### Task 1: Add the failing Receptionist View browser contract

**Files:**
- Create: `artifacts/receptionist-view-verification.spec.js`
- Reference: `artifacts/playwright.config.js`

- [ ] **Step 1: Write the structural and interaction test**

Create a single Playwright test that opens `http://127.0.0.1:3000/receptionist-view`, records `console.error` and `pageerror`, and asserts:

```js
import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

test('Receptionist View reference layout and workflows', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseUrl}/receptionist-view`)
  await expect(page.getByRole('heading', { name: 'Receptionist View' })).toBeVisible()
  await expect(page.getByText('Manage daily reception activities and candidate interactions')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible()

  const actions = [
    ['Create CV', '/cv-builder'],
    ['Add Candidate', '/candidates?add=1'],
    ['View Candidate', '/candidates'],
    ['Schedule Appointment', '/appointments?add=1'],
    ['View Tasks', '/tasks'],
  ]
  for (const [label, path] of actions) {
    await page.getByRole('button', { name: label }).click()
    await expect(page).toHaveURL(new RegExp(path.replace('?', '\\?')))
    await page.goto(`${baseUrl}/receptionist-view`)
  }

  for (const label of ['Total Candidates', 'Total Jobs', 'Total Appointments', 'Pending Tasks']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(page.getByText('Live data', { exact: true })).toHaveCount(4)

  await expect(page.getByRole('heading', { name: 'Recent Candidates' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recent Jobs' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'My Task Progress' })).toBeVisible()

  await page.getByRole('button', { name: 'Send Email' }).click()
  const dialog = page.getByRole('dialog', { name: 'Send Email' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Send Email' }).click()
  await expect(dialog.getByText('Recipient is required')).toBeVisible()
  await expect(dialog.getByText('Subject is required')).toBeVisible()
  await expect(dialog.getByText('Message is required')).toBeVisible()
  await dialog.getByLabel('Recipient').fill('candidate@example.com')
  await dialog.getByLabel('Subject').fill('Interview details')
  await dialog.getByLabel('Message').fill('Your interview is confirmed.')
  await dialog.getByRole('button', { name: 'Send Email' }).click()
  await expect(page.getByRole('status')).toContainText('Email sent successfully')
  await expect(dialog).toHaveCount(0)

  const firstCandidateStatus = page.getByRole('button', { name: /Candidate status for/ }).first()
  await firstCandidateStatus.click()
  await page.getByRole('menuitem', { name: 'Interviewing' }).click()
  await expect(firstCandidateStatus).toContainText('Interviewing')

  const firstTaskStatus = page.getByRole('button', { name: /Task status for/ }).first()
  await firstTaskStatus.click()
  await page.getByRole('menuitem', { name: 'Pending' }).click()
  await expect(firstTaskStatus).toContainText('Pending')

  await page.getByLabel('Filter tasks by status').selectOption('Completed')
  await expect(page.getByLabel('Filter tasks by status')).toHaveValue('Completed')

  await page.getByRole('button', { name: 'View All Candidates' }).click()
  await expect(page).toHaveURL(/\/candidates$/)
  await page.goto(`${baseUrl}/receptionist-view`)
  await page.getByRole('button', { name: 'View All Jobs' }).click()
  await expect(page).toHaveURL(/\/jobs$/)

  await page.goto(`${baseUrl}/documents`)
  await expect(page.getByRole('heading', { name: 'Document Management' })).toBeVisible()
  await page.goto(`${baseUrl}/receptionist-view`)

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  await page.setViewportSize({ width: 1366, height: 1962 })
  await page.screenshot({ path: 'receptionist-view-final.png', fullPage: true })
  expect(errors).toEqual([])
})
```

If the Documents page’s exact heading differs, use its verified visible page heading rather than weakening the assertion.

- [ ] **Step 2: Run the spec and confirm it fails against the old page**

Run:

```powershell
npx --prefix "C:\Users\user\Desktop\Naim-CRM" playwright test "C:\Users\user\Desktop\Naim-CRM\artifacts\receptionist-view-verification.spec.js" --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"
```

Expected: FAIL because Quick Actions and the dashboard sections do not yet exist.

- [ ] **Step 3: Checkpoint without committing**

Run `git -C "C:\Users\user\Desktop\Naim-CRM" status --short` and confirm only the intended spec/design/plan files are newly changed. Do not commit.

### Task 2: Build the accessible status menu

**Files:**
- Create: `src/components/receptionist/StatusMenu.jsx`
- Test: `artifacts/receptionist-view-verification.spec.js`

- [ ] **Step 1: Keep the candidate/task menu assertions failing**

Confirm the Task 1 assertions target explicit accessible names:

```js
page.getByRole('button', { name: /Candidate status for/ })
page.getByRole('button', { name: /Task status for/ })
page.getByRole('menuitem', { name: 'Interviewing' })
```

- [ ] **Step 2: Implement `StatusMenu`**

Create a controlled component with this interface:

```jsx
<StatusMenu
  ariaLabel="Candidate status for AMINA ALI KAKAWA"
  value={candidate.stage}
  options={CANDIDATE_STATUS_OPTIONS}
  onChange={(value) => handleCandidateStatus(candidate.id, value)}
/>
```

Each option has `{ value, dotClass, badgeClass }`. The trigger uses `aria-haspopup="menu"`, `aria-expanded`, and the supplied `ariaLabel`. The popover uses `role="menu"`; each option is a `role="menuitem"` button. Close on selection, outside pointer down, and Escape. Use `ChevronDown`; keep all listeners cleaned up in `useEffect`.

- [ ] **Step 3: Run lint for the component**

Run:

```powershell
npx --prefix "C:\Users\user\Desktop\Naim-CRM" eslint "C:\Users\user\Desktop\Naim-CRM\src\components\receptionist\StatusMenu.jsx"
```

Expected: zero errors. Existing repository-wide warnings are addressed only if caused by this file.

- [ ] **Step 4: Checkpoint without committing**

Inspect `git status --short`; do not commit.

### Task 3: Build the in-app email composer

**Files:**
- Create: `src/components/receptionist/EmailComposerModal.jsx`
- Reuse: `src/components/ui/Modal.jsx`, `Input.jsx`, `Textarea.jsx`, `Button.jsx`
- Test: `artifacts/receptionist-view-verification.spec.js`

- [ ] **Step 1: Implement controlled modal reset and validation**

Expose:

```jsx
<EmailComposerModal
  isOpen={emailOpen}
  onClose={() => setEmailOpen(false)}
  onSend={({ recipient, subject, message }) => {
    toast.success('Email sent successfully')
    setEmailOpen(false)
  }}
/>
```

Maintain local `{ recipient, subject, message }` and `{ recipient, subject, message }` errors. On every open, reset fields and errors. Required error strings must exactly match the browser contract. Use labels `Recipient`, `Subject`, and `Message`; submit button text is `Send Email`; secondary button is `Cancel`. This is simulated in-app behavior: do not call `mailto:`, a network service, or any external API.

- [ ] **Step 2: Ensure close behavior is accessible**

The shared `Modal` already traps focus and closes on Escape/overlay. Wire Cancel and the modal close button to the same `onClose`. Ensure submission does not occur while fields are invalid.

- [ ] **Step 3: Run lint for the modal**

Run:

```powershell
npx --prefix "C:\Users\user\Desktop\Naim-CRM" eslint "C:\Users\user\Desktop\Naim-CRM\src\components\receptionist\EmailComposerModal.jsx"
```

Expected: zero errors.

- [ ] **Step 4: Checkpoint without committing**

Inspect `git status --short`; do not commit.

### Task 4: Replace the Receptionist View page

**Files:**
- Modify: `src/pages/ReceptionistViewPage.jsx:1-80`
- Reuse: `src/services/demoData.js`, `candidateService.js`, `jobService.js`, `taskService.js`, `appointmentService.js`
- Reuse: `src/supabase/client.js`, `src/contexts/ToastContext.jsx`

- [ ] **Step 1: Add reference-aligned constants**

Define six actions with exact labels/routes:

```js
const QUICK_ACTIONS = [
  { label: 'Create CV', to: '/cv-builder', icon: UserRound },
  { label: 'Add Candidate', to: '/candidates?add=1', icon: UserRoundPlus },
  { label: 'View Candidate', to: '/candidates', icon: Search },
  { label: 'Schedule Appointment', to: '/appointments?add=1', icon: CalendarPlus },
  { label: 'View Tasks', to: '/tasks', icon: Eye },
]
```

Render Send Email separately so it opens the modal. Define candidate, job, and task status style maps matching the screenshot’s gold/blue/green/gray pill palette.

- [ ] **Step 2: Implement demo and live loading**

Use `isSupabaseConfigured`. Demo mode sets:

```js
setCandidates(demoCandidates.slice(0, 5))
setTotalCandidates(demoTotalCandidates)
setJobs(demoJobs.slice(0, 2))
setTotalJobs(demoJobs.length)
setTasks(demoTasks)
setTotalTasks(demoTasks.length)
setTotalAppointments(1)
```

Live mode uses `Promise.all` for `getCandidates({ pageSize: 5 })`, `getJobs({ pageSize: 2 })`, `getTasks({ pageSize: 10 })`, and `getAppointments({ pageSize: 1 })`; take each result’s `count`. Derive pending tasks from the loaded tasks or `getTaskCounts()` if already imported. Catch errors with `toast.error('Failed to load receptionist dashboard')`, and always clear loading.

- [ ] **Step 3: Implement optimistic candidate and task updates**

Candidate change updates local `stage` and `status`, then calls `updateCandidate(id, { stage: value, status: value })` only in configured mode. Task change updates local `status`, then calls `updateTask(id, { status: value })` only in configured mode. On service failure, restore the previous array and show a specific error toast.

- [ ] **Step 4: Build the header, Quick Actions, and KPI cards**

Under `<Layout title="Receptionist View">`, render the page heading/subtitle, then a rounded white Quick Actions card. Use a six-column desktop grid and wrapping/stacking breakpoints. Render KPI cards for Total Candidates, Total Jobs, Total Appointments, and Pending Tasks with icons, numeric values, and exact `Live data` text. Match the reference’s gold headings, cream borders, white surfaces, rounded corners, and restrained shadows.

- [ ] **Step 5: Build Recent Candidates**

Render up to five numbered cream rows. Include initials avatar, name, position, phone, country, passport fallback, and salary. Use `StatusMenu` with an accessible name containing the candidate name. Render `View All Candidates` as a button that calls `navigate('/candidates')`.

- [ ] **Step 6: Build Recent Jobs**

Render up to two numbered cream rows with briefcase avatar, title, company/location/type, salary/date, and a static styled status pill. Render `View All Jobs` navigation.

- [ ] **Step 7: Build My Task Progress**

Render heading/subtitle, a native select labeled `Filter tasks by status`, and filtered task rows. Option values are `''`, `Pending`, `In Progress`, `Completed`, and `Overdue`, with blank option label `All Statuses`. Each row includes number, title, assignee, and an interactive `StatusMenu`.

- [ ] **Step 8: Mount the email modal**

Open `EmailComposerModal` from Send Email. On successful simulated submission, show `Email sent successfully`, close the modal, and preserve all page data.

- [ ] **Step 9: Run targeted lint**

Run:

```powershell
npx --prefix "C:\Users\user\Desktop\Naim-CRM" eslint "C:\Users\user\Desktop\Naim-CRM\src\pages\ReceptionistViewPage.jsx" "C:\Users\user\Desktop\Naim-CRM\src\components\receptionist\*.jsx"
```

Expected: zero errors in changed source files.

- [ ] **Step 10: Checkpoint without committing**

Inspect `git status --short`; confirm no Documents or shared-shell source file changed. Do not commit.

### Task 5: Make the browser contract pass

**Files:**
- Modify if necessary: `artifacts/receptionist-view-verification.spec.js`
- Modify only for verified defects: receptionist source files from Tasks 2–4

- [ ] **Step 1: Start the production preview on port 3000**

First build:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build
```

Then start preview as a long-running background command:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run preview -- --host 127.0.0.1 --port 3000
```

Expected: Vite reports `http://127.0.0.1:3000/`. Keep it running for subsequent browser checks.

- [ ] **Step 2: Run the Receptionist View spec**

Run:

```powershell
npx --prefix "C:\Users\user\Desktop\Naim-CRM" playwright test "C:\Users\user\Desktop\Naim-CRM\artifacts\receptionist-view-verification.spec.js" --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"
```

Expected: `1 passed`. If a locator fails, inspect Playwright’s error context before deciding whether the test or application is wrong. Do not weaken exact reference assertions merely to pass.

- [ ] **Step 3: Verify the final screenshot path**

Ensure the screenshot exists at `C:\Users\user\Desktop\Naim-CRM\receptionist-view-final.png`, is taken at 1366×1962, and shows the final stable page state rather than an open menu or modal.

- [ ] **Step 4: Checkpoint without committing**

Inspect status; do not commit.

### Task 6: Full regression and production verification

**Files:**
- Verify only; change source only for confirmed defects.

- [ ] **Step 1: Run a fresh production build**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build
```

Expected: exit code 0. Record the existing Vite bundle-size warning separately if present; it is non-blocking unless a new error appears.

- [ ] **Step 2: Run repository lint**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run lint
```

Expected: no errors. Report existing warnings accurately; fix only warnings introduced by Receptionist View changes.

- [ ] **Step 3: Run all browser verification specs**

Run:

```powershell
npx --prefix "C:\Users\user\Desktop\Naim-CRM" playwright test --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"
```

Expected: Receptionist View, Associates, Documents/Marketing, and other discovered verification specs pass. If legacy specs depend on stale state, diagnose rather than hiding them with a narrower `testMatch`.

- [ ] **Step 4: Inspect the final screenshot visually**

Open `receptionist-view-final.png` and verify against the supplied reference: title/subtitle, six equal Quick Actions, four KPI cards, five candidate rows, two job rows, task progress card, gold/cream visual system, alignment, spacing, no clipping, and no open overlays.

- [ ] **Step 5: Keep the preview available and report truthfully**

Leave port 3000 serving the production preview. Report exact build, lint, and Playwright results; mention non-blocking warnings and any skipped check. Show the preview and screenshot only now, after all checks pass.

- [ ] **Step 6: Final no-commit check**

Run `git -C "C:\Users\user\Desktop\Naim-CRM" status --short`. Confirm no commit or push was made and list the intentional changed/new files.

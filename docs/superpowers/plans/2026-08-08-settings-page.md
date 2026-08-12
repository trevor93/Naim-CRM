# Settings Page Screenshot Replica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current tabbed `/settings` route with the exact stacked Settings page shown in the supplied screenshot, including its fixed development-account data, responsive layout, local persistence, and every approved interaction.

**Architecture:** Keep `SettingsPage.jsx` as the state-and-workflow coordinator, put normalization and persistence in a pure `settingsModel.js` plus `settingsService.js`, and split each visible screenshot card/modal into one focused component under `src/components/settings/`. Use a Node unit contract for the pure settings model and a Playwright browser contract for exact content, workflows, persistence, accessibility, responsiveness, and screenshot verification.

**Tech Stack:** React 19, React Router, Tailwind CSS, Lucide React, browser `localStorage`, Vite, Oxlint, Node test runner, Playwright/Chrome.

**Repository constraint:** The working tree already contains substantial unrelated changes. Do not revert, overwrite, stage, commit, or push unrelated work. Each task ends with `git diff -- <task paths>` and `git status --short` checkpoints instead of a commit.

**Approved design:** `docs/superpowers/specs/2026-08-08-settings-page-design.md`

---

## File Structure

- Create `src/components/settings/settingsModel.js`: immutable screenshot defaults, select options, local-user shape, normalization, import validation, and export-safe serialization.
- Create `src/components/settings/settingsStorage.js`: dependency-free versioned local-storage read/write/import/reset helpers that can be tested under Node.
- Modify `src/services/settingsService.js`: expose the new storage helpers to the page; remove Settings page dependence on Supabase user CRUD after the old page is replaced.
- Create `src/components/settings/SettingsSection.jsx`: shared screenshot card heading/icon/subtitle shell.
- Create `src/components/settings/SettingsSaveBanner.jsx`: green synchronized status banner and non-interactive `Saved` treatment.
- Create `src/components/settings/UserManagementCard.jsx`: exact empty table, local rows, Add/Edit/Delete triggers, and internal horizontal scroll.
- Create `src/components/settings/ProfileInformationCard.jsx`: fixed email/role, editable screenshot name, and Update Profile action.
- Create `src/components/settings/ApplicationSettingsCard.jsx`: application text field and four screenshot-default selects.
- Create `src/components/settings/SecuritySettingsCard.jsx`: password, 2FA, and session controls.
- Create `src/components/settings/NotificationPreferencesCard.jsx`: four checked screenshot notification controls.
- Create `src/components/settings/AccountInformationCard.jsx`: fixed screenshot account details.
- Create `src/components/settings/SettingsManagementCard.jsx`: sync status and export/import/reset controls.
- Create `src/components/settings/AddUserModal.jsx`: add/edit local user form with exact validation and actions.
- Create `src/components/settings/ChangePasswordModal.jsx`: safe simulated password validation with no persistence.
- Create `src/components/settings/SettingsConfirmationModal.jsx`: in-app destructive-action confirmation.
- Replace `src/pages/SettingsPage.jsx`: screenshot order, two-column composition, persistence handlers, modal orchestration, downloads/imports, and toast feedback.
- Create `artifacts/settings-model.test.mjs`: pure normalization/import/export regression tests.
- Create `artifacts/settings-verification.spec.js`: full browser contract and final screenshot.
- Create `artifacts/trace-settings-network.mjs`: concise failed-request/console-error trace for the final route.

### Stable state contract

All implementation tasks use these exact property names:

```js
{
  version: 1,
  profile: {
    fullName: 'Admin User (Dev Mode - No Auth)',
  },
  application: {
    name: 'Recruitment CRM',
    defaultRole: 'Broker',
    retention: '1-year',
    country: 'Kenya',
    currency: 'KES',
  },
  security: {
    autoLogout: '30',
  },
  notifications: {
    email: true,
    whatsapp: true,
    taskReminders: true,
    candidateUpdates: true,
  },
  users: [],
}
```

Fixed display-only account constants are not persisted:

```js
export const SETTINGS_ACCOUNT = Object.freeze({
  email: 'admin@naiminvestments.com',
  role: 'Admin',
  userId: 'dev-admin-001',
  lastLogin: '8/7/2026, 11:55:17 PM',
  status: 'Active',
})
```

---

### Task 1: Lock the Settings data model with unit tests

**Files:**
- Create: `artifacts/settings-model.test.mjs`
- Create: `src/components/settings/settingsModel.js`

- [ ] **Step 1: Write the failing model contract**

Create `artifacts/settings-model.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  validateImportedSettings,
  toExportableSettings,
} from '../src/components/settings/settingsModel.js'

test('defaults reproduce the screenshot and use an empty user table', () => {
  assert.equal(DEFAULT_SETTINGS.profile.fullName, 'Admin User (Dev Mode - No Auth)')
  assert.deepEqual(DEFAULT_SETTINGS.application, {
    name: 'Recruitment CRM',
    defaultRole: 'Broker',
    retention: '1-year',
    country: 'Kenya',
    currency: 'KES',
  })
  assert.deepEqual(DEFAULT_SETTINGS.notifications, {
    email: true,
    whatsapp: true,
    taskReminders: true,
    candidateUpdates: true,
  })
  assert.deepEqual(DEFAULT_SETTINGS.users, [])
})

test('normalization merges partial legacy data without mutating defaults', () => {
  const normalized = normalizeSettings({ application: { country: 'Kuwait' } })
  assert.equal(normalized.application.country, 'Kuwait')
  assert.equal(normalized.application.currency, 'KES')
  normalized.notifications.email = false
  assert.equal(DEFAULT_SETTINGS.notifications.email, true)
})

test('normalization rejects malformed field types and sanitizes users', () => {
  const normalized = normalizeSettings({
    application: { name: 42 },
    users: [{ id: '1', name: 'Amina', role: 'Broker', status: 'Active', lastLogin: 'Today', permissions: 'Candidates' }, null],
  })
  assert.equal(normalized.application.name, 'Recruitment CRM')
  assert.equal(normalized.users.length, 1)
  assert.equal(normalized.users[0].name, 'Amina')
})

test('import validation rejects invalid top-level values and recognized wrong types', () => {
  for (const value of [null, [], 'settings']) {
    assert.throws(() => validateImportedSettings(value), /settings object/i)
  }
  assert.throws(
    () => validateImportedSettings({ notifications: { email: 'yes' } }),
    /notifications.email/i,
  )
})

test('export contains normalized settings and excludes ephemeral secrets', () => {
  const exported = toExportableSettings({
    ...DEFAULT_SETTINGS,
    password: 'NeverExportMe1!',
    confirmPassword: 'NeverExportMe1!',
  })
  const json = JSON.stringify(exported)
  assert.equal(json.includes('NeverExportMe1!'), false)
  assert.equal(exported.version, 1)
})
```

- [ ] **Step 2: Run the model test and verify red**

Run:

```powershell
node --test "C:\Users\user\Desktop\Naim-CRM\artifacts\settings-model.test.mjs"
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `settingsModel.js`.

- [ ] **Step 3: Implement the pure model**

Create `src/components/settings/settingsModel.js` with:

```js
export const SETTINGS_STORAGE_KEY = 'recruitment-settings'
export const SETTINGS_VERSION = 1

export const SETTINGS_ACCOUNT = Object.freeze({
  email: 'admin@naiminvestments.com',
  role: 'Admin',
  userId: 'dev-admin-001',
  lastLogin: '8/7/2026, 11:55:17 PM',
  status: 'Active',
})

export const ROLE_OPTIONS = ['Admin', 'Manager', 'Broker', 'User']
export const STATUS_OPTIONS = ['Active', 'Inactive']
export const RETENTION_OPTIONS = [
  { value: '30-days', label: '30 Days' },
  { value: '90-days', label: '90 Days' },
  { value: '1-year', label: '1 Year' },
  { value: 'forever', label: 'Forever' },
]
export const COUNTRY_OPTIONS = ['Kenya', 'Kuwait', 'Saudi Arabia', 'United Arab Emirates', 'Qatar']
export const CURRENCY_OPTIONS = [
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
  { value: 'KWD', label: 'Kuwaiti Dinar (KWD)' },
  { value: 'SAR', label: 'Saudi Riyal (SAR)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
]
export const AUTO_LOGOUT_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
]

export const DEFAULT_SETTINGS = Object.freeze({
  version: SETTINGS_VERSION,
  profile: Object.freeze({ fullName: 'Admin User (Dev Mode - No Auth)' }),
  application: Object.freeze({
    name: 'Recruitment CRM',
    defaultRole: 'Broker',
    retention: '1-year',
    country: 'Kenya',
    currency: 'KES',
  }),
  security: Object.freeze({ autoLogout: '30' }),
  notifications: Object.freeze({
    email: true,
    whatsapp: true,
    taskReminders: true,
    candidateUpdates: true,
  }),
  users: Object.freeze([]),
})

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const stringOr = (value, fallback) => typeof value === 'string' ? value : fallback
const booleanOr = (value, fallback) => typeof value === 'boolean' ? value : fallback

function normalizeUser(user, index) {
  if (!isObject(user) || typeof user.name !== 'string' || !user.name.trim()) return null
  return {
    id: stringOr(user.id, `local-user-${index + 1}`),
    name: user.name.trim(),
    role: ROLE_OPTIONS.includes(user.role) ? user.role : 'Broker',
    status: STATUS_OPTIONS.includes(user.status) ? user.status : 'Active',
    lastLogin: stringOr(user.lastLogin, 'Never'),
    permissions: stringOr(user.permissions, 'Standard'),
  }
}

export function normalizeSettings(value = {}) {
  const source = isObject(value) ? value : {}
  const profile = isObject(source.profile) ? source.profile : {}
  const application = isObject(source.application) ? source.application : {}
  const security = isObject(source.security) ? source.security : {}
  const notifications = isObject(source.notifications) ? source.notifications : {}
  const users = Array.isArray(source.users)
    ? source.users.map(normalizeUser).filter(Boolean)
    : []

  return {
    version: SETTINGS_VERSION,
    profile: { fullName: stringOr(profile.fullName, DEFAULT_SETTINGS.profile.fullName) },
    application: {
      name: stringOr(application.name, DEFAULT_SETTINGS.application.name),
      defaultRole: ROLE_OPTIONS.includes(application.defaultRole) ? application.defaultRole : DEFAULT_SETTINGS.application.defaultRole,
      retention: RETENTION_OPTIONS.some(({ value: option }) => option === application.retention) ? application.retention : DEFAULT_SETTINGS.application.retention,
      country: COUNTRY_OPTIONS.includes(application.country) ? application.country : DEFAULT_SETTINGS.application.country,
      currency: CURRENCY_OPTIONS.some(({ value: option }) => option === application.currency) ? application.currency : DEFAULT_SETTINGS.application.currency,
    },
    security: {
      autoLogout: AUTO_LOGOUT_OPTIONS.some(({ value: option }) => option === security.autoLogout) ? security.autoLogout : DEFAULT_SETTINGS.security.autoLogout,
    },
    notifications: {
      email: booleanOr(notifications.email, DEFAULT_SETTINGS.notifications.email),
      whatsapp: booleanOr(notifications.whatsapp, DEFAULT_SETTINGS.notifications.whatsapp),
      taskReminders: booleanOr(notifications.taskReminders, DEFAULT_SETTINGS.notifications.taskReminders),
      candidateUpdates: booleanOr(notifications.candidateUpdates, DEFAULT_SETTINGS.notifications.candidateUpdates),
    },
    users,
  }
}

export function validateImportedSettings(value) {
  if (!isObject(value)) throw new Error('Imported file must contain a settings object')
  const checks = [
    ['profile.fullName', value.profile?.fullName, 'string'],
    ['application.name', value.application?.name, 'string'],
    ['notifications.email', value.notifications?.email, 'boolean'],
    ['notifications.whatsapp', value.notifications?.whatsapp, 'boolean'],
    ['notifications.taskReminders', value.notifications?.taskReminders, 'boolean'],
    ['notifications.candidateUpdates', value.notifications?.candidateUpdates, 'boolean'],
  ]
  for (const [path, field, expected] of checks) {
    if (field !== undefined && typeof field !== expected) throw new Error(`${path} must be a ${expected}`)
  }
  if (value.users !== undefined && !Array.isArray(value.users)) throw new Error('users must be an array')
  return normalizeSettings(value)
}

export function toExportableSettings(value) {
  return normalizeSettings(value)
}
```

- [ ] **Step 4: Run the model test and verify green**

Run the Step 2 command. Expected: `5` tests pass, `0` fail.

- [ ] **Step 5: Checkpoint only the model files**

Run:

```powershell
git -C "C:\Users\user\Desktop\Naim-CRM" diff -- "src/components/settings/settingsModel.js" "artifacts/settings-model.test.mjs"
git -C "C:\Users\user\Desktop\Naim-CRM" status --short
```

Do not stage or commit.

---

### Task 2: Add the failing browser contract before UI implementation

**Files:**
- Create: `artifacts/settings-verification.spec.js`
- Reference: `artifacts/playwright.config.js`

- [ ] **Step 1: Write the screenshot-content contract**

Create one Playwright test using `import { test, expect } from 'playwright/test'`. Navigate once, clear `recruitment-settings`, then reload before any assertions so later reloads can observe persistence:

```js
await page.goto(`${baseUrl}/settings`)
await page.evaluate(() => localStorage.removeItem('recruitment-settings'))
await page.reload()
```

Capture `console.error` and `pageerror` before the first navigation. Assert the route heading/subtitle, `All Changes Saved`, all seven card headings, the six table headers, and these fixed values:

```js
const fixedCopy = [
  'Admin User (Dev Mode - No Auth)',
  'admin@naiminvestments.com',
  'Admin',
  'Recruitment CRM',
  'Broker',
  '1 Year',
  'Kenya',
  'Kenyan Shilling (KES)',
  '30 minutes',
  'dev-admin-001',
  '8/7/2026, 11:55:17 PM',
  'Active',
]
for (const copy of fixedCopy) {
  await expect(page.getByText(copy, { exact: true }).first()).toBeVisible()
}
```

Scope duplicate values to their card test IDs when needed. Require these stable test IDs:

```js
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
```

Assert the initial user table has `tbody tr` count `0`, and all four notification checkboxes are checked.

- [ ] **Step 2: Add complete workflow assertions**

In the same test:

1. Open `Add User`, submit empty, assert `Full name is required`; fill Amina/Broker/Active/Today/Candidates; submit; assert one row; reload and assert persistence. Reopen Edit for Amina, change Permissions to `Candidates, Jobs`, save, and assert the row updates. Click Delete, cancel once to prove no mutation, reopen Delete, confirm, and assert the row is removed. Add Amina again so the reset workflow can prove it clears local users.
2. Change Full Name to empty, click Update Profile, assert `Full name is required`; fill `Admin User Updated`, save, reload, and assert persistence.
3. Change Application Name to `NAIM Recruitment CRM`, Default Country to `Kuwait`, and Email Notifications to unchecked; reload and assert all persist.
4. Open Change Password; submit `short`/`different`, assert minimum-length and mismatch errors; submit matching `SecurePass1!`; assert success toast and closed dialog.
5. Click 2FA and assert informational status contains `coming soon`.
6. Export settings, assert suggested filename `naim-crm-settings.json`, inspect JSON, and assert it contains no `SecurePass1!`, `password`, or `confirmPassword` keys.
7. Use `page.setInputFiles()` on `Import Settings` with a valid in-memory JSON payload restoring `Recruitment CRM` and Kenya; assert applied values.
8. Import invalid JSON and assert an error alert while current values remain unchanged.
9. Click Reset to Defaults, assert an in-app dialog, confirm, and assert defaults plus empty user table.
10. Set viewport `390 × 844`, assert no document-level overflow and internal table scroller exists.
11. Set viewport `1366 × 2193`, capture `settings-final.png`, and finally assert the captured error list is empty.

- [ ] **Step 3: Run the browser contract and verify red**

With the current production server on port 3000, run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" exec -- playwright test settings-verification.spec.js --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"
```

Expected: FAIL because the old page still uses tabs and lacks `All Changes Saved` and the screenshot card test IDs.

- [ ] **Step 4: Checkpoint the new spec**

Inspect `git diff -- artifacts/settings-verification.spec.js`; do not stage or commit.

---

### Task 3: Implement local Settings persistence safely

**Files:**
- Create: `src/components/settings/settingsStorage.js`
- Modify: `src/services/settingsService.js:1-41`
- Test: `artifacts/settings-model.test.mjs`

- [ ] **Step 1: Extend the failing unit contract for storage helpers**

Import `readSettings`, `writeSettings`, and `resetSettings` from `../src/components/settings/settingsStorage.js`. Add a tiny fake storage and test them:

```js
function makeStorage(seed = {}) {
  const values = new Map(Object.entries(seed))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}
```

Assert malformed JSON returns and stores defaults; writing partial settings stores normalized version 1 data; reset returns defaults and an empty users array.

- [ ] **Step 2: Run unit tests and verify red**

Run the Task 1 unit-test command. Expected: FAIL because the storage helpers are not exported yet.

- [ ] **Step 3: Implement dependency-free storage helpers**

Create `src/components/settings/settingsStorage.js`; keeping this module free of Supabase allows the Node test runner to import it without evaluating browser-only dependencies:

```js
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  normalizeSettings,
  validateImportedSettings,
} from './settingsModel.js'

export function readSettings(storage = window.localStorage) {
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY)
    const normalized = normalizeSettings(raw ? JSON.parse(raw) : DEFAULT_SETTINGS)
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    const defaults = normalizeSettings(DEFAULT_SETTINGS)
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  }
}

export function writeSettings(settings, storage = window.localStorage) {
  const normalized = normalizeSettings(settings)
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function importSettings(value, storage = window.localStorage) {
  const normalized = validateImportedSettings(value)
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function resetSettings(storage = window.localStorage) {
  return writeSettings(DEFAULT_SETTINGS, storage)
}
```

Import these four functions into `settingsService.js` and re-export them. Keep compatibility wrappers `getAppSettings()` and `updateAppSettings()` delegating to `readSettings()` and `writeSettings()` until the page replacement lands. Remove the Supabase import and legacy user CRUD only after a `Grep` confirms no caller remains outside the old Settings page.

- [ ] **Step 4: Run unit tests and verify green**

Expected: all model and storage tests pass.

- [ ] **Step 5: Verify the old Settings route still builds during the compatibility checkpoint**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build
```

Expected: exit code 0. This proves the compatibility wrappers preserve the old page until Task 7 replaces it.

- [ ] **Step 6: Checkpoint service/model changes**

Inspect the focused diff and status; do not stage or commit.

---

### Task 4: Build screenshot card primitives and read-only cards

**Files:**
- Create: `src/components/settings/SettingsSection.jsx`
- Create: `src/components/settings/SettingsSaveBanner.jsx`
- Create: `src/components/settings/AccountInformationCard.jsx`
- Create: `src/components/settings/NotificationPreferencesCard.jsx`

- [ ] **Step 1: Implement the shared section shell**

Expose:

```jsx
<SettingsSection
  testId="account-information"
  icon={UserRound}
  title="Account Information"
  description="Your account details"
>
  {children}
</SettingsSection>
```

Render a `section` with `rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_16px_rgba(15,23,42,0.08)] sm:p-8`, a gold icon, `h2` gold title, muted description, and content margin matching the screenshot.

- [ ] **Step 2: Implement the save banner**

`SettingsSaveBanner` accepts `saved`. Render `role="status"`, green dot, screenshot copy, and a right-aligned outlined status treatment with `Save` icon. When `saved` is false, use `Unsaved Changes` / `Changes are waiting to be saved`; do not make the status treatment a button.

- [ ] **Step 3: Implement fixed Account Information**

Use `SETTINGS_ACCOUNT` and exact rows `User ID`, `Last Login`, and `Account Status`. Apply monospace only to the ID and green text to Active.

- [ ] **Step 4: Implement Notification Preferences**

Accept `{ notifications, onChange }`. Render exact title/copy pairs and native checkboxes with gold accent:

```jsx
<input
  type="checkbox"
  aria-label="Email Notifications"
  checked={notifications.email}
  onChange={(event) => onChange('email', event.target.checked)}
  className="h-4 w-4 rounded border-gray-300 accent-primary"
/>
```

Repeat for `whatsapp`, `taskReminders`, and `candidateUpdates` with the exact screenshot descriptions.

- [ ] **Step 5: Run targeted lint**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" exec -- oxlint "src/components/settings/SettingsSection.jsx" "src/components/settings/SettingsSaveBanner.jsx" "src/components/settings/AccountInformationCard.jsx" "src/components/settings/NotificationPreferencesCard.jsx"
```

Expected: zero errors in these files.

- [ ] **Step 6: Checkpoint only these new components**

Inspect focused diff/status; do not stage or commit.

---

### Task 5: Build editable profile, application, and security cards

**Files:**
- Create: `src/components/settings/ProfileInformationCard.jsx`
- Create: `src/components/settings/ApplicationSettingsCard.jsx`
- Create: `src/components/settings/SecuritySettingsCard.jsx`
- Create: `src/components/settings/ChangePasswordModal.jsx`

- [ ] **Step 1: Implement Profile Information**

Accept `{ fullName, onFullNameChange, onSubmit, error }`. Use a `<form onSubmit={onSubmit}>`, exact screenshot labels/helpers, a narrow desktop input width that naturally clips long fixed values, fixed read-only email and role values, and primary `Update Profile`. Connect the error text to Full Name through the shared `Input` error prop.

- [ ] **Step 2: Implement Application Settings**

Accept `{ application, onChange }`. Use exact labels and the model option constants. Application Name is an input. The other four controls are native/select primitives with values `Broker`, `1-year`, `Kenya`, and `KES`. Call `onChange(field, value)` for each change.

- [ ] **Step 3: Implement Security Settings**

Accept `{ autoLogout, onAutoLogoutChange, onChangePassword, onEnable2FA }`. Reproduce the three screenshot blocks with separators, outlined buttons, and a right-aligned auto-logout select. Use exact labels and descriptions.

- [ ] **Step 4: Implement safe Change Password modal**

Maintain local `password`, `confirmation`, and errors. Reset state whenever `isOpen` becomes true. Submit rules:

```js
const nextErrors = {
  password: password.length < 8 ? 'Password must be at least 8 characters' : '',
  confirmation: password !== confirmation ? 'Passwords do not match' : '',
}
```

If valid, call `onSuccess()` without passing either string, clear state, and close. Use labels `New Password` and `Confirm Password`, both `type="password"`, plus Cancel and Change Password buttons.

- [ ] **Step 5: Run targeted lint**

Run Oxlint over these four files. Expected: zero errors introduced.

- [ ] **Step 6: Checkpoint**

Inspect focused diff/status; do not stage or commit.

---

### Task 6: Build local user management and confirmation dialogs

**Files:**
- Create: `src/components/settings/UserManagementCard.jsx`
- Create: `src/components/settings/AddUserModal.jsx`
- Create: `src/components/settings/SettingsConfirmationModal.jsx`

- [ ] **Step 1: Implement the exact table card**

Accept `{ users, onAdd, onEdit, onDelete }`. Render heading icon/title/description and outlined `Add User`. Always render the table and six exact headers, even when empty. Wrap it in `data-testid="settings-users-scroll"` with `overflow-x-auto`; table uses `data-testid="settings-users-table"` and `min-w-[900px]`. Render rows only after users are added. Use Badge variants for role/status and text buttons for Edit/Delete.

- [ ] **Step 2: Implement add/edit user modal**

Accept `{ isOpen, user, onClose, onSave }`. Reset fields from `user` or defaults every time it opens. Labels: `Full Name`, `Role`, `Status`, `Last Login`, `Permissions`. Require trimmed Full Name and Last Login. Save this exact shape:

```js
onSave({
  id: user?.id || `local-user-${Date.now()}`,
  name: name.trim(),
  role,
  status,
  lastLogin: lastLogin.trim(),
  permissions: permissions.trim() || 'Standard',
})
```

The title/button are `Add User` for a new row and `Edit User` / `Save Changes` for an existing row.

- [ ] **Step 3: Implement reusable in-app confirmation**

`SettingsConfirmationModal` accepts `{ isOpen, title, description, confirmLabel, onClose, onConfirm }`. It uses the shared Modal, renders the supplied description, Cancel, and a destructive `confirmLabel` button. The confirm button calls `onConfirm` once. For reset, pass title `Reset Settings`, description `This restores the screenshot defaults and removes locally added users.`, and label `Reset to Defaults`. For row deletion, pass title `Delete User`, description `This removes the locally saved user from Settings.`, and label `Delete User`.

- [ ] **Step 4: Run targeted lint and checkpoint**

Run Oxlint over the three files, then inspect focused status. Do not commit.

---

### Task 7: Build Settings Management and replace SettingsPage orchestration

**Files:**
- Create: `src/components/settings/SettingsManagementCard.jsx`
- Replace: `src/pages/SettingsPage.jsx:1-176`
- Modify: `src/services/settingsService.js`
- Test: `artifacts/settings-verification.spec.js`

- [ ] **Step 1: Implement Settings Management card**

Accept `{ onExport, onImport, onReset, importInputRef }`. Render exact screenshot sync copy and `Live`; buttons `Export Settings`, `Import Settings`, and `Reset to Defaults`. Include hidden `<input ref={importInputRef} aria-label="Import Settings file" type="file" accept="application/json,.json">`; Import button clicks the ref. Reset uses an outlined red treatment without introducing a new shared Button variant.

- [ ] **Step 2: Replace page imports and state**

`SettingsPage.jsx` imports all Settings components; imports `readSettings`, `writeSettings`, `importSettings`, and `resetSettings` from `settingsService.js`; imports `toExportableSettings` from `settingsModel.js`; and imports `useToast` and `Layout`. State:

```js
const [settings, setSettings] = useState(() => readSettings())
const [saved, setSaved] = useState(true)
const [profileError, setProfileError] = useState('')
const [userModal, setUserModal] = useState({ open: false, user: null })
const [passwordOpen, setPasswordOpen] = useState(false)
const [resetOpen, setResetOpen] = useState(false)
const importInputRef = useRef(null)
```

Remove `useAuth`, tabs, Supabase users, and the old Edit User modal.

- [ ] **Step 3: Add one immutable persist helper**

```js
function persist(next) {
  setSaved(false)
  const normalized = writeSettings(next)
  setSettings(normalized)
  setSaved(true)
  return normalized
}
```

Application, security, notifications, and user handlers build a new nested object and pass it to `persist`.

- [ ] **Step 4: Implement profile/user/password handlers**

Profile validation shows `Full name is required`; success persists and toasts `Profile updated!`. User save replaces by ID or appends, closes modal, and toasts `User saved!`. User delete opens a confirmation path using the in-app reset/confirm modal pattern with copy specific to deletion; do not call native `confirm`. Password success closes and toasts `Password updated securely`; 2FA uses `toast.info('Two-factor authentication is coming soon')`.

- [ ] **Step 5: Implement export/import/reset**

Export:

```js
const blob = new Blob([JSON.stringify(toExportableSettings(settings), null, 2)], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const anchor = document.createElement('a')
anchor.href = url
anchor.download = 'naim-crm-settings.json'
anchor.click()
URL.revokeObjectURL(url)
```

Import reads one file with `file.text()`, parses JSON, calls the service `importSettings`, updates state, clears the input value, and toasts success. Catch parse/type failures, preserve current state, clear the input, and toast `Invalid settings file`. Reset calls service `resetSettings`, closes confirmation, and toasts `Settings reset to defaults`.

- [ ] **Step 6: Compose the exact page**

Use `<Layout title="Admin Dashboard">`. Render heading/subtitle, Save banner, User Management, then:

```jsx
<div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,2.08fr)_minmax(300px,1fr)]">
  <div className="min-w-0 space-y-6">
    <ProfileInformationCard />
    <SecuritySettingsCard />
    <NotificationPreferencesCard />
  </div>
  <div className="min-w-0 space-y-6">
    <ApplicationSettingsCard />
    <AccountInformationCard />
    <SettingsManagementCard />
  </div>
</div>
```

Mount Add User, Change Password, Reset Settings, and row-delete confirmation modals after the page content.

- [ ] **Step 7: Remove obsolete Supabase service calls after caller search**

Run Grep for `getUsers`, `updateUserProfile`, and `deleteUserProfile`. If no callers remain, remove those exports and the Supabase import from `settingsService.js`. If another caller exists, keep them unchanged and document it in the checkpoint.

- [ ] **Step 8: Run targeted lint**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" exec -- oxlint "src/pages/SettingsPage.jsx" "src/components/settings/*.jsx" "src/components/settings/settingsModel.js" "src/services/settingsService.js"
```

Expected: zero errors in changed Settings files.

- [ ] **Step 9: Build and run the focused browser contract**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build
npm --prefix "C:\Users\user\Desktop\Naim-CRM" exec -- playwright test settings-verification.spec.js --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"
```

Expected: build exits 0 and Settings test reports `1 passed`. Diagnose failures from Playwright context; do not weaken exact screenshot assertions merely to pass.

- [ ] **Step 10: Checkpoint all Settings paths**

Inspect focused diff and full status. Confirm no unrelated source file changed; do not commit.

---

### Task 8: Add network tracing and complete visual/responsive verification

**Files:**
- Create: `artifacts/trace-settings-network.mjs`
- Verify: `settings-final.png`
- Modify only for confirmed defects: Settings files from Tasks 1–7

- [ ] **Step 1: Add a deterministic network/error trace**

Create a Chrome script mirroring `trace-reports-network.mjs`: collect and print `REQUEST_FAILED`, `CONSOLE_ERROR`, and `PAGE_ERROR`; load `/settings`; exercise notification toggle, 2FA, and mobile/desktop viewports; take `settings-network-trace.png`; wait briefly; close browser. No output is the passing signal.

- [ ] **Step 2: Run model, lint, and build checks freshly**

Run:

```powershell
node --test "C:\Users\user\Desktop\Naim-CRM\artifacts\settings-model.test.mjs"
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run lint
npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build
```

Expected: model tests pass; lint has no errors (report unrelated existing warnings); build exits 0 (report the existing chunk-size warning separately).

- [ ] **Step 3: Run the focused Settings browser checks freshly**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" exec -- playwright test settings-verification.spec.js --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"
node "C:\Users\user\Desktop\Naim-CRM\artifacts\trace-settings-network.mjs"
```

Expected: `1 passed`; trace produces no error lines.

- [ ] **Step 4: Run the complete Playwright regression suite**

Run:

```powershell
npm --prefix "C:\Users\user\Desktop\Naim-CRM" exec -- playwright test --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"
```

Expected: all discovered specs pass. If a legacy spec fails, investigate and report the exact unrelated or Settings-caused failure; do not hide it by narrowing test discovery.

- [ ] **Step 5: Inspect both reference sizes visually**

Open `settings-final.png` and compare it with the supplied 1366 × 2193 screenshot. Verify exact section order, empty initial table, 2.08:1 content ratio, gold headings/actions, card shadows/radii, clipped long profile values, fixed screenshot account data, checked notifications, and no open modal/toast in the capture. Also inspect the 390 × 844 state for page-level overflow and usable internal table scrolling.

- [ ] **Step 6: Final no-commit and integrity check**

Run:

```powershell
git -C "C:\Users\user\Desktop\Naim-CRM" status --short
git -C "C:\Users\user\Desktop\Naim-CRM" diff --check
```

Expected: no whitespace errors. List only the intentional Settings/spec/plan/artifact paths as this task's work; explicitly preserve and report all pre-existing unrelated changes. Do not stage, commit, or push.

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  validateImportedSettings,
  toExportableSettings,
} from '../src/components/settings/settingsModel.js'
import {
  readSettings,
  resetSettings,
  writeSettings,
} from '../src/components/settings/settingsStorage.js'

function makeStorage(seed = {}) {
  const values = new Map(Object.entries(seed))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

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
    users: [
      {
        id: '1',
        name: 'Amina',
        role: 'Broker',
        status: 'Active',
        lastLogin: 'Today',
        permissions: 'Candidates',
      },
      null,
    ],
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

test('readSettings repairs malformed JSON with screenshot defaults', () => {
  const storage = makeStorage({ 'recruitment-settings': '{broken' })
  const settings = readSettings(storage)
  assert.equal(settings.application.name, 'Recruitment CRM')
  assert.deepEqual(JSON.parse(storage.getItem('recruitment-settings')), settings)
})

test('writeSettings stores a normalized versioned document', () => {
  const storage = makeStorage()
  const settings = writeSettings({ application: { country: 'Kuwait' } }, storage)
  assert.equal(settings.version, 1)
  assert.equal(settings.application.country, 'Kuwait')
  assert.equal(settings.application.currency, 'KES')
  assert.deepEqual(JSON.parse(storage.getItem('recruitment-settings')), settings)
})

test('resetSettings clears local users and restores defaults', () => {
  const storage = makeStorage()
  writeSettings({ users: [{ name: 'Amina', role: 'Broker', status: 'Active', lastLogin: 'Today', permissions: 'Candidates' }] }, storage)
  const settings = resetSettings(storage)
  assert.deepEqual(settings.users, [])
  assert.equal(settings.profile.fullName, 'Admin User (Dev Mode - No Auth)')
})

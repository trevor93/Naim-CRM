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
      defaultRole: ROLE_OPTIONS.includes(application.defaultRole)
        ? application.defaultRole
        : DEFAULT_SETTINGS.application.defaultRole,
      retention: RETENTION_OPTIONS.some(({ value: option }) => option === application.retention)
        ? application.retention
        : DEFAULT_SETTINGS.application.retention,
      country: COUNTRY_OPTIONS.includes(application.country)
        ? application.country
        : DEFAULT_SETTINGS.application.country,
      currency: CURRENCY_OPTIONS.some(({ value: option }) => option === application.currency)
        ? application.currency
        : DEFAULT_SETTINGS.application.currency,
    },
    security: {
      autoLogout: AUTO_LOGOUT_OPTIONS.some(({ value: option }) => option === security.autoLogout)
        ? security.autoLogout
        : DEFAULT_SETTINGS.security.autoLogout,
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
    if (field !== undefined && typeof field !== expected) {
      throw new Error(`${path} must be a ${expected}`)
    }
  }
  if (value.users !== undefined && !Array.isArray(value.users)) {
    throw new Error('users must be an array')
  }
  return normalizeSettings(value)
}

export function toExportableSettings(value) {
  return normalizeSettings(value)
}

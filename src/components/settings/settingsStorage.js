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

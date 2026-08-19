import { demoCVDrafts, demoLicenseDocuments, demoMedicalDocuments } from './demoData'

export const DOCUMENTS_STORAGE_KEY = 'naim-documents-store'

// One key per section list the Documents page renders.
export const DOCUMENT_COLLECTIONS = Object.freeze([
  'builderCVs',
  'uploadedCVs',
  'drafts',
  'medical',
  'contracts',
  'licenses',
  'marketing',
  'reports',
])

// Sections the screenshots ship content for; the rest start empty and fill up
// as documents are uploaded.
const SEED_COLLECTIONS = {
  drafts: demoCVDrafts,
  medical: demoMedicalDocuments,
  licenses: demoLicenseDocuments,
}

// A File picked from an <input> cannot survive JSON, so it is dropped on write.
// The record keeps its metadata, and after a reload a download of that record
// falls back to the details text file the fixtures already use.
const TRANSIENT_FIELDS = new Set(['demoFile', 'previewUrl'])

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

export function formatFileSize(bytes) {
  const size = Number(bytes)
  // A null/absent column coerces to 0, and no upload path allows an empty
  // file, so treat 0 as "unknown" rather than rendering a bogus "0 B".
  if (!Number.isFinite(size) || size <= 0) return 'Size unavailable'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDocumentDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : DATE_FORMATTER.format(date)
}

function cloneSeed() {
  return Object.fromEntries(DOCUMENT_COLLECTIONS.map((key) => [
    key,
    (SEED_COLLECTIONS[key] || []).map((item) => ({ ...item })),
  ]))
}

function normalizeCollections(value) {
  const seed = cloneSeed()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return seed
  return Object.fromEntries(DOCUMENT_COLLECTIONS.map((key) => [
    key,
    Array.isArray(value[key])
      ? value[key].filter((item) => item && typeof item === 'object' && item.id)
      : seed[key],
  ]))
}

export function writeDocumentsStore(collections, storage = window.localStorage) {
  const normalized = normalizeCollections(collections)
  try {
    storage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(
      normalized,
      (key, value) => (TRANSIENT_FIELDS.has(key) ? undefined : value),
    ))
  } catch {
    // Storage full or unavailable: the session keeps working from React state.
  }
  return normalized
}

/**
 * Read the demo-mode document lists, seeding them on first visit.
 *
 * Supabase mode never touches this store — there the page reads the
 * `documents` and `cv_drafts` tables instead.
 */
export function readDocumentsStore(storage = window.localStorage) {
  try {
    const raw = storage.getItem(DOCUMENTS_STORAGE_KEY)
    if (raw === null) return writeDocumentsStore(cloneSeed(), storage)
    return normalizeCollections(JSON.parse(raw))
  } catch {
    return cloneSeed()
  }
}

export function clearDocumentsStore(storage = window.localStorage) {
  try {
    storage.removeItem(DOCUMENTS_STORAGE_KEY)
  } catch {
    // Nothing to recover from — the caller resets its state either way.
  }
  return cloneSeed()
}

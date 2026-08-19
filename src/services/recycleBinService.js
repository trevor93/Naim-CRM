import { isSupabaseConfigured } from '../supabase/client'
import {
  getDeletedCandidates,
  permanentDeleteCandidate,
  restoreCandidate,
} from './candidateService'

export const RECYCLE_BIN_STORAGE_KEY = 'naim-recycle-bin-items'

const screenshotItems = [
  ['recycle-1', 'MERCY HABEL MWAMBANGA', '1781021361040@temp.com'],
  ['recycle-2', 'MERCY HABEL MWAMBANGA', '1781021513702@temp.com'],
  ['recycle-3', 'MERCY HABEL MWAMBANGA', '1781021514348@temp.com'],
  ['recycle-4', 'JULIA KEYA BARASA', '1780052470377@temp.com'],
  ['recycle-5', 'JULIA KEYA BARASA', '1780052472808@temp.com'],
  ['recycle-6', 'JULIA KEYA BARASA', '1780052471508@temp.com'],
  ['recycle-7', 'JULIA KEYA BARASA', '1780052466546@temp.com'],
  ['recycle-8', 'JULIA KEYA BARASA', '1780052472050@temp.com'],
  ['recycle-9', 'JULIA KEYA BARASA', '1780052471864@temp.com'],
  ['recycle-10', 'JULIA KEYA BARASA', '1780052473410@temp.com'],
  ['recycle-11', 'JULIA KEYA BARASA', '1780052473189@temp.com'],
  ['recycle-12', 'JULIA KEYA BARASA', '1780052471315@temp.com'],
  ['recycle-13', 'JULIA KEYA BARASA', '1780052470963@temp.com'],
  ['recycle-14', 'JULIA KEYA BARASA', '1780052471695@temp.com'],
  ['recycle-15', 'JULIA KEYA BARASA', '1780052471115@temp.com'],
]

export const DEFAULT_RECYCLE_BIN_ITEMS = Object.freeze(
  screenshotItems.map(([id, name, email]) => Object.freeze({
    id,
    name,
    email,
    phone: '+000-000-0000',
    type: 'candidate',
    deleted_at: '2026-06-08T12:00:00.000Z',
    deleted_by: 'by',
  })),
)

function cloneDefaults() {
  return DEFAULT_RECYCLE_BIN_ITEMS.map((item) => ({ ...item }))
}

function normalizeItems(value) {
  if (!Array.isArray(value)) return cloneDefaults()
  return value
    .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string')
    .map((item) => ({
      id: item.id,
      name: item.name,
      email: typeof item.email === 'string' ? item.email : '',
      phone: typeof item.phone === 'string' ? item.phone : '+000-000-0000',
      type: item.type === 'candidate' ? item.type : 'candidate',
      deleted_at: typeof item.deleted_at === 'string' ? item.deleted_at : new Date().toISOString(),
      deleted_by: typeof item.deleted_by === 'string' ? item.deleted_by : 'by',
    }))
}

export function readLocalRecycleBin(storage = window.localStorage) {
  try {
    const raw = storage.getItem(RECYCLE_BIN_STORAGE_KEY)
    const items = raw === null ? cloneDefaults() : normalizeItems(JSON.parse(raw))
    storage.setItem(RECYCLE_BIN_STORAGE_KEY, JSON.stringify(items))
    return items
  } catch {
    const items = cloneDefaults()
    storage.setItem(RECYCLE_BIN_STORAGE_KEY, JSON.stringify(items))
    return items
  }
}

function writeLocalRecycleBin(items, storage = window.localStorage) {
  const normalized = normalizeItems(items)
  storage.setItem(RECYCLE_BIN_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

/**
 * Append candidate records to the local (demo-mode) Recycle Bin store.
 *
 * Supabase mode gets this for free: soft-deleted rows are what the Recycle Bin
 * page reads. In demo mode the bin is a separate localStorage list, so deletes
 * on the Candidates page have to push their records across explicitly.
 */
export function addLocalRecycleBinItems(records) {
  const incoming = (Array.isArray(records) ? records : [records]).filter(Boolean)
  if (!incoming.length) return readLocalRecycleBin()

  const existing = readLocalRecycleBin()
  const knownIds = new Set(existing.map((item) => item.id))
  const additions = incoming
    .filter((record) => !knownIds.has(record.id))
    .map((record) => ({
      id: record.id,
      name: record.name || 'Unnamed candidate',
      email: record.email || '',
      phone: record.phone || '+000-000-0000',
      type: 'candidate',
      deleted_at: record.deleted_at || new Date().toISOString(),
      deleted_by: 'by',
    }))

  return additions.length ? writeLocalRecycleBin([...additions, ...existing]) : existing
}

export async function loadRecycleBinItems() {
  if (!isSupabaseConfigured) return readLocalRecycleBin()
  const candidates = await getDeletedCandidates()
  return candidates.map((candidate) => ({
    ...candidate,
    type: 'candidate',
    deleted_by: candidate.deleted_by || 'by',
  }))
}

export async function restoreRecycleBinItem(item) {
  if (isSupabaseConfigured) {
    await restoreCandidate(item.id)
    return null
  }
  const remaining = readLocalRecycleBin().filter((candidate) => candidate.id !== item.id)
  return writeLocalRecycleBin(remaining)
}

export async function deleteRecycleBinItem(item) {
  if (isSupabaseConfigured) {
    await permanentDeleteCandidate(item.id)
    return null
  }
  const remaining = readLocalRecycleBin().filter((candidate) => candidate.id !== item.id)
  return writeLocalRecycleBin(remaining)
}

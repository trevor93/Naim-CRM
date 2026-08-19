import { CANDIDATE_STATUSES } from '../components/candidates/StatusDropdown'
import { getAllActiveCandidates, updateCandidate } from './candidateService'

const STANDARD_STAGES = CANDIDATE_STATUSES.map((status) => status.label)

// Stages carried over from the longer legacy pipeline (CANDIDATE_STAGES in
// utils/constants.js) folded onto the five stages the Candidates page uses.
const LEGACY_STAGES = {
  new: 'Onboarding',
  source: 'Onboarding',
  screening: 'Onboarding',
  pending: 'Onboarding',
  draft: 'Onboarding',
  active: 'Onboarding',
  interview: 'Interviewing',
  assessment: 'Interviewing',
  shortlist: 'Interviewing',
  'contract signing': 'Offer',
  'visa processing': 'Offer',
  placed: 'Hired',
  completed: 'Hired',
  withdrawn: 'Rejected',
}

// Values that read as "empty" in this dataset, so they never get copied into a
// field that is genuinely blank.
const PLACEHOLDERS = new Set(['n/a', 'na', 'none', 'null', 'undefined', 'not set', 'invalid date', '-', '—'])

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function realText(value) {
  const cleaned = cleanText(value)
  return PLACEHOLDERS.has(cleaned.toLowerCase()) ? '' : cleaned
}

function titleCase(value) {
  return value.toLowerCase().replace(/(^|[\s/-])([a-z])/g, (match) => match.toUpperCase())
}

function standardStage(value) {
  const cleaned = cleanText(value)
  if (!cleaned) return STANDARD_STAGES[0]
  const exact = STANDARD_STAGES.find((stage) => stage.toLowerCase() === cleaned.toLowerCase())
  return exact || LEGACY_STAGES[cleaned.toLowerCase()] || STANDARD_STAGES[0]
}

/**
 * Work out what a candidate record needs to match the app's standard shape.
 *
 * Returns only the fields that actually differ, or null when the record is
 * already standard — so callers can both count and apply the repairs.
 */
export function standardCandidateChanges(candidate) {
  if (!candidate || typeof candidate !== 'object') return null
  const changes = {}

  const name = cleanText(candidate.name)
  if (name && name !== candidate.name) changes.name = name

  const email = cleanText(candidate.email).toLowerCase()
  if (email && email !== candidate.email) changes.email = email

  const phone = cleanText(candidate.phone)
  if (phone && phone !== candidate.phone) changes.phone = phone

  // stage drives the badge; status is the column the database sorts on. The
  // rest of this page keeps the two identical, so the sync does the same.
  const stage = standardStage(candidate.stage || candidate.status)
  if (stage !== candidate.stage) changes.stage = stage
  if (stage !== candidate.status) changes.status = stage

  // The list renders `position`, Supabase stores `job_title`, and exports read
  // whichever exists — they have to agree.
  const jobTitle = realText(candidate.position) || realText(candidate.job_title)
  if (jobTitle) {
    if (jobTitle !== candidate.position) changes.position = jobTitle
    if (jobTitle !== candidate.job_title) changes.job_title = jobTitle
  }

  // Country filters and reports read country_applying_to; older records only
  // carry the shouty `country` value.
  const destination = realText(candidate.country_applying_to) || titleCase(realText(candidate.country))
  if (destination && destination !== candidate.country_applying_to) changes.country_applying_to = destination

  return Object.keys(changes).length ? changes : null
}

/** Standardize the in-memory demo dataset. Returns how much was touched. */
export function syncStandardDemoData(list) {
  const active = list.filter((candidate) => !candidate.deleted_at)
  let standardized = 0

  active.forEach((candidate) => {
    const changes = standardCandidateChanges(candidate)
    if (!changes) return
    Object.assign(candidate, changes, { updated_at: new Date().toISOString() })
    standardized += 1
  })

  return { checked: active.length, standardized }
}

/** Standardize every live candidate row in Supabase. */
export async function syncStandardCandidateData() {
  const candidates = await getAllActiveCandidates()
  let standardized = 0

  for (const candidate of candidates) {
    const changes = standardCandidateChanges(candidate)
    if (!changes) continue
    await updateCandidate(candidate.id, changes)
    standardized += 1
  }

  return { checked: candidates.length, standardized }
}

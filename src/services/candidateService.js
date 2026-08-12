import { supabase } from '../supabase/client'

const TABLE = 'candidates'

export async function getCandidates({ search, stage, country, status, page = 1, pageSize = 20, sortBy = 'created_at', sortDir = 'desc' } = {}) {
  let query = supabase.from(TABLE).select('*', { count: 'exact' }).is('deleted_at', null)

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,passport_number.ilike.%${search}%`)
  }
  if (stage) query = query.eq('stage', stage)
  if (country) query = query.eq('country_applying_to', country)
  if (status) query = query.eq('status', status)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, to)

  if (error) throw error
  return { data, count, page, pageSize }
}

export async function getCandidateById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function addCandidate(candidate) {
  const { data, error } = await supabase.from(TABLE).insert(candidate).select().single()
  if (error) throw error
  return data
}

export async function updateCandidate(id, updates) {
  const { data, error } = await supabase.from(TABLE).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCandidate(id) {
  const { error } = await supabase.from(TABLE).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function bulkUpdateCandidates(ids, updates) {
  const { error } = await supabase.from(TABLE).update({ ...updates, updated_at: new Date().toISOString() }).in('id', ids)
  if (error) throw error
}

export async function bulkDeleteCandidates(ids) {
  const { error } = await supabase.from(TABLE).update({ deleted_at: new Date().toISOString() }).in('id', ids)
  if (error) throw error
}

export async function autoDeleteCompletedCandidates(cutoff) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .in('stage', ['Hired', 'Rejected'])
    .is('deleted_at', null)
    .lt('updated_at', cutoff)
    .select('id')
  if (error) throw error
  return data?.length || 0
}

export async function getCandidatesByStage() {
  const { data, error } = await supabase.from(TABLE).select('stage').is('deleted_at', null)
  if (error) throw error
  const counts = {}
  data.forEach((c) => { counts[c.stage] = (counts[c.stage] || 0) + 1 })
  return counts
}

export async function getCandidatesByCountry() {
  const { data, error } = await supabase.from(TABLE).select('country_applying_to').is('deleted_at', null)
  if (error) throw error
  const counts = {}
  data.forEach((c) => {
    const key = c.country_applying_to || 'Unknown'
    counts[key] = (counts[key] || 0) + 1
  })
  return counts
}

export async function getRecentPlacements(limit = 10) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('stage', 'Placed').is('deleted_at', null).order('updated_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data
}

export async function restoreCandidate(id) {
  const { error } = await supabase.from(TABLE).update({ deleted_at: null }).eq('id', id)
  if (error) throw error
}

export async function permanentDeleteCandidate(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function getDeletedCandidates() {
  const { data, error } = await supabase.from(TABLE).select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
  if (error) throw error
  return data
}

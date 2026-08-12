import { supabase } from '../supabase/client'

const TABLE = 'documents'
const BUCKET = 'documents'

export async function getDocuments({ candidateId, documentType } = {}) {
  let query = supabase.from(TABLE).select('*')
  if (candidateId) query = query.eq('candidate_id', candidateId)
  if (documentType) query = query.eq('document_type', documentType)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadDocument(file, candidateId, documentType, source = 'manual') {
  const filePath = `${candidateId}/${source}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file)
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

  const { data, error } = await supabase.from(TABLE).insert({
    candidate_id: candidateId,
    document_type: documentType,
    file_name: file.name,
    file_path: filePath,
    file_url: urlData.publicUrl,
    file_size: file.size,
    mime_type: file.type,
  }).select().single()
  if (error) {
    try {
      const { error: rollbackError } = await supabase.storage.from(BUCKET).remove([filePath])
      void rollbackError
    } catch {
      // Preserve the database error that made the rollback necessary.
    }
    throw error
  }
  return data
}

export async function updateDocument(id, updates) {
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteDocument(id, filePath) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error

  if (filePath) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([filePath])
    if (storageError) throw storageError
  }
}

export async function downloadDocument(filePath, fileName) {
  const { data, error } = await supabase.storage.from(BUCKET).download(filePath)
  if (error) throw error
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

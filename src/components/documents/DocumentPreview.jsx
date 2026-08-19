import { useEffect, useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'

/**
 * Preview body shared by every document modal on the Documents page.
 *
 * Renders the real file when one is attached — the File object from an upload
 * this session, or the stored URL in Supabase mode — and always lists the
 * record's details underneath.
 */
export default function DocumentPreview({ record }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const file = record?.demoFile

  useEffect(() => {
    if (!file) return undefined
    const url = URL.createObjectURL(file)
    setBlobUrl(url)
    return () => {
      URL.revokeObjectURL(url)
      setBlobUrl(null)
    }
  }, [file])

  if (!record) return null

  const name = record.file_name || record.name || 'Document'
  const mimeType = record.mime_type || file?.type || ''
  const viewUrl = blobUrl || record.file_url || null
  const isImage = mimeType.startsWith('image/')
  const isPdf = mimeType === 'application/pdf'

  return (
    <div className="space-y-4">
      {viewUrl && isImage && (
        <img
          src={viewUrl}
          alt={name}
          className="max-h-[46vh] w-full rounded-lg border border-cream bg-cream-light object-contain"
        />
      )}

      {viewUrl && isPdf && (
        <iframe
          src={viewUrl}
          title={`${name} preview`}
          className="h-[46vh] w-full rounded-lg border border-cream bg-cream-light"
        />
      )}

      {viewUrl && !isImage && !isPdf && (
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-cream bg-white px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-cream-warm"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open {name}
        </a>
      )}

      {!viewUrl && (
        <p className="flex items-start gap-2 rounded-lg border border-cream bg-cream-light px-3 py-2.5 text-xs leading-5 text-text-secondary">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          No file is stored against this record, so only its details are shown. Downloading saves those details as a text file.
        </p>
      )}

      <dl className="grid gap-3 text-sm text-text-secondary">
        {record.document_type && (
          <div><dt className="font-semibold text-text-primary">Type</dt><dd>{record.document_type}</dd></div>
        )}
        <div><dt className="font-semibold text-text-primary">File size</dt><dd>{record.size || 'Size unavailable'}</dd></div>
        <div>
          <dt className="font-semibold text-text-primary">Uploaded</dt>
          <dd>{record.uploadedAt || 'Date unavailable'}{record.uploadedBy ? ` • ${record.uploadedBy}` : ''}</dd>
        </div>
        <div><dt className="font-semibold text-text-primary">Description</dt><dd>{record.description || '—'}</dd></div>
      </dl>
    </div>
  )
}

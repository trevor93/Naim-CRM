import { FileText, FolderOpen } from 'lucide-react'
import CVUploadButton from './CVUploadButton'

function formatSize(bytes) {
  if (bytes === null || bytes === undefined || bytes === '') return ''

  const size = Number(bytes)
  if (!Number.isFinite(size)) return String(bytes)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function CVDocumentSection({
  id,
  icon: Icon = FileText,
  title,
  subtitle,
  documents = [],
  onUpload,
  onCamera,
}) {
  return (
    <section id={id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-primary">
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
            <p className="mt-0.5 text-xs leading-5 text-text-secondary">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <CVUploadButton onFile={onUpload} />
          <CVUploadButton camera onFile={onCamera} />
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="flex min-h-[230px] flex-col items-center justify-center py-7 text-center">
          <FolderOpen className="h-9 w-9 text-gray-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-text-secondary">No documents uploaded yet</p>
          <p className="mt-1 text-xs text-text-muted">Click the upload button to add documents</p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {documents.map((document, index) => {
            const formattedSize = formatSize(document.file_size)

            return (
              <div
                key={document.id ?? document.file_path ?? `${document.file_name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-primary shadow-sm ring-1 ring-cream">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text-primary">{document.file_name || document.name || 'CV document'}</p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {document.document_type || 'Resume/CV'}
                    {formattedSize ? ` • ${formattedSize}` : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

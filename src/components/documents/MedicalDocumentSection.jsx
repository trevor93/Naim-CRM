import { useLayoutEffect, useRef } from 'react'
import { FolderOpen } from 'lucide-react'
import CVUploadButton from './CVUploadButton'
import MedicalDocumentRow from './MedicalDocumentRow'

export default function MedicalDocumentSection({ section, documents, selectedIds, onToggle, onToggleAll, onUpload, onCamera, onPreview, onEdit, onDownload, onDelete }) {
  const selectAllRef = useRef(null)
  const selectedCount = documents.filter((document) => selectedIds.has(document.id)).length
  const allSelected = documents.length > 0 && selectedCount === documents.length
  const Icon = section.icon

  useLayoutEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = selectedCount > 0 && selectedCount < documents.length
  }, [documents.length, selectedCount])

  return (
    <section className="rounded-lg border border-gray-200 bg-white px-5 py-7 shadow-sm sm:px-12 sm:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-gray-900"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
          <div>
            <h2 className="text-lg font-semibold leading-6 text-primary">{section.title}</h2>
            <p className="text-xs text-text-secondary">{section.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {documents.length > 0 && (
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900">
              <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={onToggleAll} className="h-4 w-4 rounded border-gray-300 accent-primary" /> Select All
            </label>
          )}
          <CVUploadButton onFile={onUpload} />
          <CVUploadButton camera onFile={onCamera} />
        </div>
      </div>
      {documents.length === 0 ? (
        <div className="flex min-h-[205px] flex-col items-center justify-center text-center">
          <FolderOpen className="h-11 w-11 text-gray-300" aria-hidden="true" />
          <p className="mt-4 text-sm text-text-secondary">No documents uploaded yet</p>
          <p className="mt-1 text-xs text-text-muted">Click the upload button to add documents</p>
        </div>
      ) : (
        <div className="mt-7 space-y-2">
          {documents.map((document, index) => <MedicalDocumentRow key={document.id} document={document} index={index + 1} selected={selectedIds.has(document.id)} onSelect={onToggle} onPreview={onPreview} onEdit={onEdit} onDownload={onDownload} onDelete={onDelete} />)}
        </div>
      )}
    </section>
  )
}

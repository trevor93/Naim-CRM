import { useLayoutEffect, useRef } from 'react'
import { Copy, FolderOpen } from 'lucide-react'
import CVUploadButton from './CVUploadButton'
import CVDraftRow from './CVDraftRow'

export default function CVDraftsSection({
  drafts = [],
  selectedIds = new Set(),
  onToggle,
  onToggleAll,
  onUpload,
  onCamera,
  onPreview,
  onEdit,
  onDownload,
  onDelete,
}) {
  const selectAllRef = useRef(null)
  const selectedCount = drafts.reduce((count, draft) => count + (selectedIds.has(draft.id) ? 1 : 0), 0)
  const allSelected = drafts.length > 0 && selectedCount === drafts.length

  useLayoutEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedCount > 0 && selectedCount < drafts.length
    }
  }, [drafts.length, selectedCount])

  return (
    <section id="cv-drafts" className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-primary">
            <Copy className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary">CV Drafts</h2>
            <p className="mt-0.5 text-xs leading-5 text-text-secondary">Draft CVs that are work in progress</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-secondary">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              disabled={drafts.length === 0}
              onChange={onToggleAll}
              aria-label="Select all CV drafts"
              className="h-4 w-4 rounded border-gray-300 accent-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            Select All
          </label>
          <CVUploadButton onFile={onUpload} />
          <CVUploadButton camera onFile={onCamera} />
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center py-7 text-center">
          <FolderOpen className="h-9 w-9 text-gray-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-text-secondary">No documents uploaded yet</p>
          <p className="mt-1 text-xs text-text-muted">Click the upload button to add documents</p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {drafts.map((draft, index) => (
            <CVDraftRow
              key={draft.id}
              draft={draft}
              displayIndex={index + 1}
              selected={selectedIds.has(draft.id)}
              onSelect={onToggle}
              onPreview={onPreview}
              onEdit={onEdit}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

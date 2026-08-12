import { Download, Eye, Files, SquarePen, Trash2 } from 'lucide-react'

export default function CVDraftRow({
  draft,
  displayIndex,
  selected,
  onSelect,
  onPreview,
  onEdit,
  onDownload,
  onDelete,
}) {
  return (
    <article
      data-cv-draft-row
      className={`flex flex-col gap-3 rounded-lg border px-3.5 py-3 transition-colors sm:flex-row sm:items-center ${
        selected ? 'border-gold-light bg-cream-light' : 'border-gray-200 bg-gray-50/80 hover:border-cream'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(draft.id)}
          aria-label={`Select ${draft.name}`}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary focus:ring-primary sm:mt-0"
        />
        <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md bg-cream px-1.5 text-xs font-semibold text-primary">
          {displayIndex}.
        </span>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-primary shadow-sm ring-1 ring-cream">
          <Files className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[13px] font-semibold leading-5 text-text-primary">{draft.title}</h3>
          <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
            <span>{draft.size}</span>
            <span className="mx-1 text-gray-300">•</span>
            <span>{draft.uploadedAt}</span>
            <span className="mx-1 text-gray-300">•</span>
            <span>by {draft.uploadedBy}</span>
          </p>
          <p className="mt-0.5 break-words text-[11px] leading-4 text-text-secondary">{draft.description}</p>
        </div>
      </div>

      <div className="ml-7 flex flex-wrap items-center gap-1 sm:ml-0">
        <button
          type="button"
          onClick={() => onPreview(draft)}
          aria-label={`Preview ${draft.name}`}
          title="Preview"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(draft)}
          aria-label={`Edit ${draft.name}`}
          title="Edit"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <SquarePen className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDownload(draft)}
          aria-label={`Download ${draft.name}`}
          title="Download"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(draft)}
          aria-label={`Delete ${draft.name}`}
          title="Delete"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

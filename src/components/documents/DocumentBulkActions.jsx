import { Download, Trash2 } from 'lucide-react'

/**
 * Bar that appears once rows are ticked, giving the Select All checkboxes
 * something to act on. Styled to match the Candidates page bulk bar.
 */
export default function DocumentBulkActions({ count, noun = 'document', onDownload, onDelete }) {
  if (!count) return null

  return (
    <div
      role="region"
      aria-label={`${noun} bulk actions`}
      className="mt-5 flex flex-wrap items-center gap-2 rounded-lg border border-[#eee8d8] bg-white px-3 py-2.5 shadow-sm animate-fade-in"
    >
      <p className="mr-auto min-w-fit text-[13px] font-semibold text-primary">
        {count} {noun}(s) selected
      </p>
      <button
        type="button"
        onClick={onDownload}
        className="flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-gray-50"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download Selected
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete Selected
      </button>
    </div>
  )
}

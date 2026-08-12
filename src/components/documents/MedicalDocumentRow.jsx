import { Download, Eye, FileImage, FileText, SquarePen, Trash2 } from 'lucide-react'

export default function MedicalDocumentRow({ document, index, selected, onSelect, onPreview, onEdit, onDownload, onDelete }) {
  const ImageIcon = document.mime_type?.startsWith('image/') ? FileImage : FileText
  const iconColor = document.mime_type?.startsWith('image/') ? 'text-purple-500' : 'text-red-500'

  return (
    <article className={`flex flex-col gap-3 rounded-lg px-5 py-4 transition-colors sm:flex-row sm:items-center ${selected ? 'bg-cream-light ring-1 ring-gold-light' : 'bg-gray-50'}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <input type="checkbox" checked={selected} onChange={() => onSelect(document.id)} aria-label={`Select ${document.file_name}`} className="h-4 w-4 shrink-0 rounded border-gray-300 accent-primary focus:ring-primary" />
        <span className="inline-flex h-7 min-w-8 shrink-0 items-center justify-center rounded bg-cream px-1.5 text-xs font-semibold text-primary">{index}.</span>
        <ImageIcon className={`h-[18px] w-[18px] shrink-0 ${iconColor}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[13px] font-semibold leading-5 text-text-primary">{document.file_name}</h3>
          <p className="text-[11px] leading-4 text-text-muted">{document.size} · Uploaded {document.uploadedAt} by {document.uploadedBy}</p>
          <p className="mt-0.5 break-words text-[11px] leading-4 text-text-secondary">{document.description}</p>
        </div>
      </div>
      <div className="ml-7 flex items-center justify-end gap-3 sm:ml-0">
        {[
          [Eye, 'Preview', onPreview], [SquarePen, 'Edit', onEdit], [Download, 'Download', onDownload], [Trash2, 'Delete', onDelete],
        ].map(([Icon, label, handler]) => (
          <button key={label} type="button" onClick={() => handler(document)} aria-label={`${label} ${document.file_name}`} title={label} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      </div>
    </article>
  )
}

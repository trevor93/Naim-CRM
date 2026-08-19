import { Download, Eye, SquarePen, Trash2 } from 'lucide-react'

// Preview / Edit / Download / Delete, in the order every document row shows
// them. An action whose handler is omitted simply is not rendered.
const ROW_ACTIONS = [
  ['Preview', Eye, 'onPreview', 'text-blue-600 hover:bg-blue-50'],
  ['Edit', SquarePen, 'onEdit', 'text-amber-600 hover:bg-amber-50'],
  ['Download', Download, 'onDownload', 'text-emerald-600 hover:bg-emerald-50'],
  ['Delete', Trash2, 'onDelete', 'text-red-600 hover:bg-red-50'],
]

const PLAIN_TONE = 'text-gray-900 hover:bg-white'

export default function DocumentRowActions({
  record,
  name,
  tone = 'color',
  className = '',
  onPreview,
  onEdit,
  onDownload,
  onDelete,
}) {
  const handlers = { onPreview, onEdit, onDownload, onDelete }

  return (
    <div className={className}>
      {ROW_ACTIONS.map(([label, Icon, handlerKey, colorClasses]) => {
        const handler = handlers[handlerKey]
        if (!handler) return null

        return (
          <button
            key={label}
            type="button"
            onClick={() => handler(record)}
            aria-label={`${label} ${name}`}
            title={label}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              tone === 'plain' ? PLAIN_TONE : colorClasses
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}

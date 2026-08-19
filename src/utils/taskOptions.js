// Dropdown options for the Associates task table.
//
// `dot` is a small solid swatch (h-2 w-2), matching the colours supplied for
// this app rather than the large faint circles in the reference screenshots.
// `badge` styles the closed trigger pill, which shows text + chevron only.

export const TASK_STATUS_OPTIONS = [
  { label: 'Pending', dot: 'bg-yellow-400', badge: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
  { label: 'In Progress', dot: 'bg-blue-500', badge: 'border-blue-200 bg-blue-50 text-blue-700' },
  { label: 'Completed', dot: 'bg-green-500', badge: 'border-green-200 bg-green-50 text-green-700' },
  { label: 'Overdue', dot: 'bg-red-500', badge: 'border-red-200 bg-red-50 text-red-600' },
]

export const TASK_PRIORITY_OPTIONS = [
  { label: 'High', dot: 'bg-red-500', badge: 'border-red-200 bg-red-50 text-red-600' },
  { label: 'Medium', dot: 'bg-yellow-400', badge: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
  { label: 'Low', dot: 'bg-green-500', badge: 'border-green-200 bg-green-50 text-green-700' },
]

// Every category shares one colour, the way the template renders them.
const CATEGORY_STYLE = { dot: 'bg-yellow-400', badge: 'border-yellow-200 bg-yellow-50 text-yellow-700' }

export const TASK_CATEGORY_OPTIONS = ['Follow-up', 'Screening', 'Interview', 'Data Entry', 'Medical', 'Documentation']
  .map((label) => ({ label, ...CATEGORY_STYLE }))

/** Match a stored value to its option label, ignoring case (demo data stores "HIGH"). */
export function matchOptionLabel(options, value) {
  const wanted = String(value ?? '').toLowerCase()
  return options.find((option) => option.label.toLowerCase() === wanted)?.label || value
}

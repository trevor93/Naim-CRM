import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export const CANDIDATE_STATUSES = [
  { label: 'Onboarding', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  { label: 'Interviewing', dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  { label: 'Offer', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
  { label: 'Hired', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  { label: 'Rejected', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
]

export default function StatusDropdown({ value, onChange, size = 'sm' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = CANDIDATE_STATUSES.find((s) => s.label === value) || CANDIDATE_STATUSES[0]
  const pad = size === 'xs' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className={`flex items-center gap-1 rounded-full font-medium transition-colors ${pad} ${current.badge}`}
      >
        {current.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-xl border border-gray-200 bg-white py-1 shadow-xl animate-scale-in">
          {CANDIDATE_STATUSES.map((s) => (
            <button
              key={s.label}
              onClick={(e) => { e.stopPropagation(); onChange(s.label); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-text-primary hover:bg-cream-warm transition-colors"
            >
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

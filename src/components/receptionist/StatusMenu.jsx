import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function StatusMenu({ ariaLabel, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const current = options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${current.badgeClass}`}
      >
        {current.value}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-36 rounded-xl border border-gray-200 bg-white py-1 shadow-xl animate-scale-in">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-primary transition-colors hover:bg-cream-warm"
            >
              <span className={`h-2 w-2 rounded-full ${option.dotClass}`} aria-hidden="true" />
              {option.value}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

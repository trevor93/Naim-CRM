import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

const GAP = 4
const EDGE = 8

/**
 * Pill dropdown: the closed trigger shows the selected label and a chevron,
 * and each option in the open menu is prefixed with a small solid colour dot.
 *
 * The menu renders into <body> with fixed coordinates rather than as an
 * absolutely positioned child. The tasks table scrolls horizontally, and
 * `overflow-x: auto` forces the used value of `overflow-y` to `auto` too, so a
 * menu inside that wrapper would be clipped and would add a scrollbar.
 *
 * @param options array of `{ label, dot, badge }` — see utils/taskOptions.js
 */
export default function DotSelect({ label, value, options, onChange, className = '', menuClassName = 'w-40' }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const selectedIndex = options.findIndex((option) => option.label === value)
  // A stored value that is not on the list (a retired option, say) keeps showing
  // its own text in a neutral pill instead of silently reading as options[0].
  const current = options[selectedIndex]
    || (value ? { label: value, badge: 'border-gray-200 bg-gray-50 text-gray-700' } : options[0])

  function openMenu() {
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex)
    setOpen(true)
  }

  function closeMenu() {
    setOpen(false)
    // Force a fresh measurement the next time the menu opens.
    setPosition(null)
  }

  function select(option) {
    closeMenu()
    if (option.label !== value) onChange(option.label)
  }

  // Measured after mount so the flip decision uses the real menu height. Until
  // `position` lands the menu is hidden, so this never paints in the wrong spot.
  useLayoutEffect(() => {
    if (!open) return
    function place() {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (!trigger || !menu) return
      const rect = trigger.getBoundingClientRect()
      const { offsetHeight: height, offsetWidth: width } = menu
      const flipUp = rect.bottom + GAP + height > window.innerHeight - EDGE && rect.top - GAP - height > EDGE
      setPosition({
        top: flipUp ? rect.top - GAP - height : rect.bottom + GAP,
        left: Math.max(EDGE, Math.min(rect.right - width, window.innerWidth - width - EDGE)),
      })
    }
    place()
    // Capture phase so scrolling the table wrapper repositions too, not just the window.
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event) {
      if (triggerRef.current?.contains(event.target)) return
      if (menuRef.current?.contains(event.target)) return
      closeMenu()
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) return openMenu()
      const step = event.key === 'ArrowDown' ? 1 : -1
      return setActiveIndex((index) => (index + step + options.length) % options.length)
    }
    if (!open) return
    if (event.key === 'Escape') {
      event.preventDefault()
      return closeMenu()
    }
    // Without this the button's own click handler would reopen the menu.
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(options[activeIndex])
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        onBlur={() => open && closeMenu()}
        className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-3 text-[11px] font-medium outline-none transition-colors ${current.badge} ${open ? 'ring-2 ring-gold-light' : ''} ${className}`}
      >
        {current.label}
        <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          // Keeps focus on the trigger so onBlur cannot close the menu before a click lands.
          onMouseDown={(event) => event.preventDefault()}
          style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? 'visible' : 'hidden' }}
          className={`fixed z-50 rounded-xl border border-gray-200 bg-white py-1 shadow-xl animate-scale-in ${menuClassName}`}
        >
          {options.map((option, index) => (
            <button
              key={option.label}
              type="button"
              role="option"
              aria-selected={option.label === value}
              tabIndex={-1}
              onClick={() => select(option)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-text-primary transition-colors ${index === activeIndex ? 'bg-cream-warm' : ''}`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${option.dot}`} aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

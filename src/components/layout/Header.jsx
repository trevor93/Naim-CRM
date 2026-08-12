import { useState, useRef, useEffect } from 'react'
import { Bell, Search, LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { demoNotifications } from '../../services/demoData'

export default function Header({ title }) {
  const { user, logout } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(demoNotifications)
  const [search, setSearch] = useState('')
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const email = user?.email || 'admin@naiminvest...'
  const displayEmail = email.length > 20 ? email.slice(0, 18) + '...' : email

  return (
    <header id="app-header" className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
      <h1 className="text-lg font-bold text-primary">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search pill */}
        <div className="relative hidden md:block">
          <input
            id="global-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-9 w-64 rounded-full border border-gray-300 bg-white pl-4 pr-9 text-sm text-text-primary placeholder-gray-400 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        </div>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-1.5 text-gray-500 hover:bg-cream-warm hover:text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl animate-scale-in">
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-bold text-primary">Notifications</h3>
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 ${i === 0 && !n.read ? 'bg-blue-50/60' : ''} ${i > 0 ? 'border-t border-gray-100' : ''}`}
                  >
                    <p className="text-[13px] font-medium leading-snug text-text-primary">{n.title}</p>
                    <p className="mt-1 text-xs text-gray-400">{n.time}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {n.tags.map((tag) => (
                        <span key={tag.label} className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${tag.color}`}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 py-2 text-center">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User email */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-text-secondary">{displayEmail}</span>
        </div>

        {/* Logout button */}
        <button
          id="logout-button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-text-primary hover:bg-cream-warm hover:border-primary hover:text-primary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  )
}

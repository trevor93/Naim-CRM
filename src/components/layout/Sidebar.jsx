import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Folder, UserPlus, Eye, CheckSquare,
  Calendar, Briefcase, Plus, BarChart3, Settings, Trash2, Menu, X, FileEdit
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/cv-builder', label: 'CV Builder', icon: FileEdit },
  { to: '/documents', label: 'Documents', icon: Folder },
  { to: '/associates', label: 'Associates', icon: UserPlus },
  { to: '/receptionist-view', label: 'Receptionist View', icon: Eye },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/job-generator', label: 'Job Generator', icon: Plus },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/recycle-bin', label: 'Recycle Bin', icon: Trash2 },
]

export default function Sidebar({ expanded, onToggle }) {
  return (
    <aside
      id="app-sidebar"
      className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
        expanded ? 'w-64' : 'w-14'
      }`}
    >
      {/* Naim Agency logo. Expanded matches the sidebar template: the mark shown
          large and centred with the close toggle beside it, over a divider.
          Collapsed keeps the hamburger with a small mark under it so both still
          fit the 56px rail. */}
      {expanded ? (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-6">
          <span className="flex flex-1 justify-center">
            <img
              src="/assets/naim-agency-logo.png"
              alt="Naim Agency logo"
              className="h-36 w-36 object-contain"
            />
          </span>
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-primary hover:bg-cream-warm transition-colors"
            title="Close menu"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 border-b border-gray-200 px-2 py-3">
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-cream-warm hover:text-primary transition-colors"
            title="Open menu"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img
            src="/assets/naim-agency-logo.png"
            alt="Naim Agency logo"
            className="h-9 w-9 object-contain"
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `mb-1 flex items-center rounded-lg transition-all duration-200 ${
                  expanded ? 'gap-3 px-2.5 py-2' : 'justify-center p-2'
                } ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:bg-cream-warm hover:text-primary'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {expanded && <span className="truncate text-[13px] font-medium">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

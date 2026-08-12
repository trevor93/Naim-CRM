import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Folder, UserPlus, Eye, CheckSquare,
  Calendar, Briefcase, Plus, BarChart3, Settings, Trash2, Menu, FileEdit
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
        expanded ? 'w-52' : 'w-14'
      }`}
    >
      {/* Hamburger toggle */}
      <div className="flex h-12 items-center px-3">
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-cream-warm hover:text-primary transition-colors"
          title="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Naim Agency logo */}
      <div className="flex items-center px-2.5 pb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black shadow-sm">
          <img
            src="/assets/naim-agency-logo.webp"
            alt="Naim Agency logo"
            className="h-full w-full object-contain"
          />
        </div>
        {expanded && (
          <span className="ml-2 truncate text-sm font-bold text-primary">Naim Investments</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3" aria-label="Main navigation">
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

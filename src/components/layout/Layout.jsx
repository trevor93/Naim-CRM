import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ title, children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="min-h-screen bg-cream-light">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />

      <div className={`transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-14'}`}>
        <Header title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

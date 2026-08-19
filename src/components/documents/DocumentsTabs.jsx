const DOCUMENT_TABS = [
  ['cvs', 'CVs'],
  ['medical-reports', 'Medical Reports'],
  ['contracts', 'Contracts'],
  ['licenses-certifications', 'Licenses & Certifications'],
  ['adverts-marketing', 'Adverts/Marketing'],
  ['reports', 'Reports'],
]

export const DOCUMENT_TAB_IDS = DOCUMENT_TABS.map(([id]) => id)

export default function DocumentsTabs({ activeTab = 'cvs', onChange }) {
  return (
    <nav aria-label="Document categories" className="overflow-x-auto border-b border-gray-200">
      <div className="flex min-w-max">
        {DOCUMENT_TABS.map(([id, label]) => {
          const active = id === activeTab

          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(id)}
              className={`-mb-px border-b-2 px-5 py-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset ${
                active
                  ? 'border-gold-light bg-[#faf8f2] text-primary'
                  : 'border-transparent text-gray-600 hover:text-primary'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

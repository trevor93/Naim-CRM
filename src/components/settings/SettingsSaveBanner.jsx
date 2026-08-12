import { Save } from 'lucide-react'

export default function SettingsSaveBanner({ saved }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-5 rounded-2xl border border-emerald-400 bg-blue-50 px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
        <div>
          <p className="font-bold text-primary">{saved ? 'All Changes Saved' : 'Unsaved Changes'}</p>
          <p className="text-sm text-text-secondary">
            {saved ? 'All settings are synchronized' : 'Changes are waiting to be saved'}
          </p>
        </div>
      </div>
      <div className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl border border-gold-warm bg-white px-6 font-semibold text-primary shadow-sm sm:self-auto">
        <Save className="h-4 w-4" aria-hidden="true" />
        {saved ? 'Saved' : 'Pending'}
      </div>
    </div>
  )
}

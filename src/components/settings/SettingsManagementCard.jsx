import { Download, RotateCcw, Upload } from 'lucide-react'
import Button from '../ui/Button'
import SettingsSection from './SettingsSection'

export default function SettingsManagementCard({ onExport, onImport, onReset, importInputRef }) {
  return (
    <SettingsSection
      testId="settings-management"
      icon={RotateCcw}
      title="Settings Management"
      description="Backup and restore your settings"
    >
      <div>
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <p className="font-medium text-primary">Settings Sync</p>
            <p className="mt-1 text-sm leading-5 text-text-secondary">Real-time synchronization across all components</p>
          </div>
          <span className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-success">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /> Live
          </span>
        </div>
        <div className="grid gap-3 border-b border-gray-200 py-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Button type="button" variant="outline" className="min-h-16 bg-white leading-5" onClick={onExport}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export Settings
          </Button>
          <Button type="button" variant="outline" className="min-h-16 bg-white leading-5" onClick={() => importInputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" /> Import Settings
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            aria-label="Import Settings file"
            className="sr-only"
            onChange={onImport}
          />
        </div>
        <Button type="button" variant="outline" className="mt-5 border-danger text-danger hover:bg-red-50" onClick={onReset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset to Defaults
        </Button>
      </div>
    </SettingsSection>
  )
}

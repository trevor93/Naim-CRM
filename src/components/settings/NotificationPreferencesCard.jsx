import { Bell } from 'lucide-react'
import SettingsSection from './SettingsSection'

const options = [
  ['email', 'Email Notifications', 'Receive notifications via email'],
  ['whatsapp', 'WhatsApp Notifications', 'Receive notifications via WhatsApp'],
  ['taskReminders', 'Task Reminders', 'Get reminded about upcoming tasks'],
  ['candidateUpdates', 'Candidate Updates', 'Notifications when candidate status changes'],
]

export default function NotificationPreferencesCard({ notifications, onChange }) {
  return (
    <SettingsSection
      testId="notification-preferences"
      icon={Bell}
      title="Notification Preferences"
      description="Choose how you want to be notified"
    >
      <div className="space-y-5">
        {options.map(([key, label, description]) => (
          <label key={key} className="flex cursor-pointer items-start justify-between gap-4">
            <span>
              <span className="block font-medium text-primary">{label}</span>
              <span className="block text-sm text-text-secondary">{description}</span>
            </span>
            <input
              type="checkbox"
              aria-label={label}
              checked={notifications[key]}
              onChange={(event) => onChange(key, event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary"
            />
          </label>
        ))}
      </div>
    </SettingsSection>
  )
}

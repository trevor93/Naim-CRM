import { Info } from 'lucide-react'
import SettingsSection from './SettingsSection'
import { SETTINGS_ACCOUNT } from './settingsModel'

export default function AccountInformationCard() {
  return (
    <SettingsSection
      testId="account-information"
      icon={Info}
      title="Account Information"
      description="Your account details"
    >
      <dl className="space-y-5 text-sm">
        <div>
          <dt className="text-text-secondary">User ID</dt>
          <dd className="font-mono font-medium text-text-primary">{SETTINGS_ACCOUNT.userId}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">Last Login</dt>
          <dd className="font-medium text-text-primary">{SETTINGS_ACCOUNT.lastLogin}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">Account Status</dt>
          <dd className="font-medium text-success">{SETTINGS_ACCOUNT.status}</dd>
        </div>
      </dl>
    </SettingsSection>
  )
}

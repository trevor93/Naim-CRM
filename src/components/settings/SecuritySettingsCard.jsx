import { Shield } from 'lucide-react'
import Button from '../ui/Button'
import Select from '../ui/Select'
import SettingsSection from './SettingsSection'
import { AUTO_LOGOUT_OPTIONS } from './settingsModel'

export default function SecuritySettingsCard({ autoLogout, onAutoLogoutChange, onChangePassword, onEnable2FA }) {
  return (
    <SettingsSection
      testId="security-settings"
      icon={Shield}
      title="Security Settings"
      description="Manage your password and security preferences"
    >
      <div className="divide-y divide-gray-200">
        <div className="pb-5">
          <p className="font-medium text-primary">Change Password</p>
          <p className="mt-1 text-sm text-text-secondary">Update your password to keep your account secure</p>
          <Button type="button" variant="outline" className="mt-4 bg-white" onClick={onChangePassword}>Change Password</Button>
        </div>
        <div className="py-5">
          <p className="font-medium text-primary">Two-Factor Authentication</p>
          <p className="mt-1 text-sm text-text-secondary">Add an extra layer of security to your account</p>
          <Button type="button" variant="outline" className="mt-4 bg-white" onClick={onEnable2FA}>Enable 2FA (Coming Soon)</Button>
        </div>
        <div className="pt-5">
          <p className="font-medium text-primary">Session Management</p>
          <p className="mt-1 text-sm text-text-secondary">Manage your active sessions and login security</p>
          <div className="mt-5 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <p className="pb-2 text-sm text-text-primary">Auto-logout after inactivity</p>
            <Select
              aria-label="Auto-logout after inactivity"
              value={autoLogout}
              onChange={(event) => onAutoLogoutChange(event.target.value)}
              options={AUTO_LOGOUT_OPTIONS}
              className="border-transparent"
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}

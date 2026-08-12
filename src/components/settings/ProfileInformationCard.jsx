import { UserRound } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import SettingsSection from './SettingsSection'
import { SETTINGS_ACCOUNT } from './settingsModel'

export default function ProfileInformationCard({ fullName, onFullNameChange, onSubmit, error }) {
  return (
    <SettingsSection
      testId="profile-information"
      icon={UserRound}
      title="Profile Information"
      description="Update your personal information and details"
    >
      <form onSubmit={onSubmit} className="max-w-sm space-y-5">
        <Input
          label="Full Name"
          aria-label="Full Name"
          value={fullName}
          onChange={(event) => onFullNameChange(event.target.value)}
          error={error}
          className="border-transparent bg-gray-50"
        />
        <div>
          <Input
            label="Email Address"
            aria-label="Email Address"
            value={SETTINGS_ACCOUNT.email}
            readOnly
            className="border-transparent bg-gray-50 text-ellipsis"
          />
          <p className="mt-1 text-xs text-text-secondary">Email cannot be changed</p>
        </div>
        <div>
          <Input
            label="Role"
            aria-label="Role"
            value={SETTINGS_ACCOUNT.role}
            readOnly
            className="border-transparent bg-gray-50"
          />
          <p className="mt-1 text-xs text-text-secondary">Role is assigned by administrator</p>
        </div>
        <Button type="submit" className="mt-1">Update Profile</Button>
      </form>
    </SettingsSection>
  )
}

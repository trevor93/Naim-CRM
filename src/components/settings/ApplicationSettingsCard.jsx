import { SlidersHorizontal } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import SettingsSection from './SettingsSection'
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  RETENTION_OPTIONS,
  ROLE_OPTIONS,
} from './settingsModel'

export default function ApplicationSettingsCard({ application, onChange }) {
  return (
    <SettingsSection
      testId="application-settings"
      icon={SlidersHorizontal}
      title="Application Settings"
      description="General application preferences"
    >
      <div className="space-y-5">
        <Input
          label="Application Name"
          aria-label="Application Name"
          value={application.name}
          onChange={(event) => onChange('name', event.target.value)}
          className="border-transparent"
        />
        <Select
          label="Default User Role"
          aria-label="Default User Role"
          value={application.defaultRole}
          onChange={(event) => onChange('defaultRole', event.target.value)}
          options={ROLE_OPTIONS}
          className="border-transparent"
        />
        <Select
          label="Data Retention (Days)"
          aria-label="Data Retention (Days)"
          value={application.retention}
          onChange={(event) => onChange('retention', event.target.value)}
          options={RETENTION_OPTIONS}
          className="border-transparent"
        />
        <Select
          label="Default Country"
          aria-label="Default Country"
          value={application.country}
          onChange={(event) => onChange('country', event.target.value)}
          options={COUNTRY_OPTIONS}
          className="border-transparent"
        />
        <Select
          label="Default Currency"
          aria-label="Default Currency"
          value={application.currency}
          onChange={(event) => onChange('currency', event.target.value)}
          options={CURRENCY_OPTIONS}
          className="border-transparent"
        />
      </div>
    </SettingsSection>
  )
}

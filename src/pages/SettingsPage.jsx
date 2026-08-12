import { useRef, useState } from 'react'
import Layout from '../components/layout/Layout'
import AccountInformationCard from '../components/settings/AccountInformationCard'
import AddUserModal from '../components/settings/AddUserModal'
import ApplicationSettingsCard from '../components/settings/ApplicationSettingsCard'
import ChangePasswordModal from '../components/settings/ChangePasswordModal'
import NotificationPreferencesCard from '../components/settings/NotificationPreferencesCard'
import ProfileInformationCard from '../components/settings/ProfileInformationCard'
import SecuritySettingsCard from '../components/settings/SecuritySettingsCard'
import SettingsConfirmationModal from '../components/settings/SettingsConfirmationModal'
import SettingsManagementCard from '../components/settings/SettingsManagementCard'
import SettingsSaveBanner from '../components/settings/SettingsSaveBanner'
import UserManagementCard from '../components/settings/UserManagementCard'
import { toExportableSettings } from '../components/settings/settingsModel'
import { importSettings, readSettings, resetSettings, writeSettings } from '../services/settingsService'
import { useToast } from '../contexts/ToastContext'

export default function SettingsPage() {
  const toast = useToast()
  const [settings, setSettings] = useState(() => readSettings())
  const [saved, setSaved] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [userModal, setUserModal] = useState({ open: false, user: null })
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const importInputRef = useRef(null)

  function persist(next) {
    setSaved(false)
    const normalized = writeSettings(next)
    setSettings(normalized)
    setSaved(true)
    return normalized
  }

  function updateApplication(field, value) {
    persist({
      ...settings,
      application: { ...settings.application, [field]: value },
    })
  }

  function updateNotification(field, value) {
    persist({
      ...settings,
      notifications: { ...settings.notifications, [field]: value },
    })
  }

  function updateAutoLogout(value) {
    persist({
      ...settings,
      security: { ...settings.security, autoLogout: value },
    })
  }

  function handleProfileSubmit(event) {
    event.preventDefault()
    if (!settings.profile.fullName.trim()) {
      setProfileError('Full name is required')
      return
    }
    setProfileError('')
    persist({
      ...settings,
      profile: { fullName: settings.profile.fullName.trim() },
    })
    toast.success('Profile updated!')
  }

  function handleUserSave(user) {
    const exists = settings.users.some((candidate) => candidate.id === user.id)
    const users = exists
      ? settings.users.map((candidate) => candidate.id === user.id ? user : candidate)
      : [...settings.users, user]
    persist({ ...settings, users })
    setUserModal({ open: false, user: null })
    toast.success('User saved!')
  }

  function requestDeleteUser(user) {
    setConfirmation({
      type: 'delete-user',
      user,
      title: 'Delete User',
      description: 'This removes the locally saved user from Settings.',
      confirmLabel: 'Delete User',
    })
  }

  function requestReset() {
    setConfirmation({
      type: 'reset',
      title: 'Reset Settings',
      description: 'This restores the screenshot defaults and removes locally added users.',
      confirmLabel: 'Reset to Defaults',
    })
  }

  function handleConfirm() {
    if (confirmation?.type === 'delete-user') {
      persist({
        ...settings,
        users: settings.users.filter((user) => user.id !== confirmation.user.id),
      })
      toast.success('User deleted!')
    } else if (confirmation?.type === 'reset') {
      setSettings(resetSettings())
      setProfileError('')
      setSaved(true)
      toast.success('Settings reset to defaults')
    }
    setConfirmation(null)
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(toExportableSettings(settings), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'naim-crm-settings.json'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    toast.success('Settings exported!')
  }

  async function handleImport(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = JSON.parse(await file.text())
      setSettings(importSettings(imported))
      setProfileError('')
      setSaved(true)
      toast.success('Settings imported!')
    } catch {
      toast.error('Invalid settings file')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <Layout title="Admin Dashboard">
      <section className="min-w-0 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-text-secondary sm:text-base">Manage your account settings and preferences</p>
        </div>

        <SettingsSaveBanner saved={saved} />

        <UserManagementCard
          users={settings.users}
          onAdd={() => setUserModal({ open: true, user: null })}
          onEdit={(user) => setUserModal({ open: true, user })}
          onDelete={requestDeleteUser}
        />

        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,2.08fr)_minmax(300px,1fr)]">
          <div className="min-w-0 space-y-6">
            <ProfileInformationCard
              fullName={settings.profile.fullName}
              onFullNameChange={(fullName) => {
                setProfileError('')
                setSettings((current) => ({ ...current, profile: { fullName } }))
                setSaved(false)
              }}
              onSubmit={handleProfileSubmit}
              error={profileError}
            />
            <SecuritySettingsCard
              autoLogout={settings.security.autoLogout}
              onAutoLogoutChange={updateAutoLogout}
              onChangePassword={() => setPasswordOpen(true)}
              onEnable2FA={() => toast.info('Two-factor authentication is coming soon')}
            />
            <NotificationPreferencesCard
              notifications={settings.notifications}
              onChange={updateNotification}
            />
          </div>

          <div className="min-w-0 space-y-6">
            <ApplicationSettingsCard application={settings.application} onChange={updateApplication} />
            <AccountInformationCard />
            <SettingsManagementCard
              onExport={handleExport}
              onImport={handleImport}
              onReset={requestReset}
              importInputRef={importInputRef}
            />
          </div>
        </div>
      </section>

      <AddUserModal
        isOpen={userModal.open}
        user={userModal.user}
        onClose={() => setUserModal({ open: false, user: null })}
        onSave={handleUserSave}
      />
      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSuccess={() => {
          setPasswordOpen(false)
          toast.success('Password updated securely')
        }}
      />
      <SettingsConfirmationModal
        isOpen={Boolean(confirmation)}
        title={confirmation?.title || ''}
        description={confirmation?.description || ''}
        confirmLabel={confirmation?.confirmLabel || ''}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirm}
      />
    </Layout>
  )
}

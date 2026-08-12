import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import { ROLE_OPTIONS, STATUS_OPTIONS } from './settingsModel'

const emptyForm = { name: '', role: 'Broker', status: 'Active', lastLogin: '', permissions: '' }

export default function AddUserModal({ isOpen, user, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isOpen) return
    setForm(user ? {
      name: user.name,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      permissions: user.permissions,
    } : emptyForm)
    setErrors({})
  }, [isOpen, user])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      name: form.name.trim() ? '' : 'Full name is required',
      lastLogin: form.lastLogin.trim() ? '' : 'Last login is required',
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.lastLogin) return
    onSave({
      id: user?.id || `local-user-${Date.now()}`,
      name: form.name.trim(),
      role: form.role,
      status: form.status,
      lastLogin: form.lastLogin.trim(),
      permissions: form.permissions.trim() || 'Standard',
    })
  }

  const editing = Boolean(user)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit User' : 'Add User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" aria-label="Full Name" autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} error={errors.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Role" aria-label="Role" value={form.role} onChange={(event) => update('role', event.target.value)} options={ROLE_OPTIONS} />
          <Select label="Status" aria-label="Status" value={form.status} onChange={(event) => update('status', event.target.value)} options={STATUS_OPTIONS} />
        </div>
        <Input label="Last Login" aria-label="Last Login" value={form.lastLogin} onChange={(event) => update('lastLogin', event.target.value)} error={errors.lastLogin} />
        <Input label="Permissions" aria-label="Permissions" value={form.permissions} onChange={(event) => update('permissions', event.target.value)} />
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">{editing ? 'Save Changes' : 'Add User'}</Button>
        </div>
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setConfirmation('')
      setErrors({})
    }
  }, [isOpen])

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      password: password.length < 8 ? 'Password must be at least 8 characters' : '',
      confirmation: password !== confirmation ? 'Passwords do not match' : '',
    }
    setErrors(nextErrors)
    if (nextErrors.password || nextErrors.confirmation) return
    setPassword('')
    setConfirmation('')
    onSuccess()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          aria-label="New Password"
          type="password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          aria-label="Confirm Password"
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          error={errors.confirmation}
        />
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Change Password</Button>
        </div>
      </form>
    </Modal>
  )
}

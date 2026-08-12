import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

const EMPTY_FORM = { recipient: '', subject: '', message: '' }

export default function EmailComposerModal({ isOpen, onClose, onSend }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState(EMPTY_FORM)

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM)
      setErrors(EMPTY_FORM)
    }
  }, [isOpen])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    if (value.trim()) setErrors((current) => ({ ...current, [field]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      recipient: form.recipient.trim() ? '' : 'Recipient is required',
      subject: form.subject.trim() ? '' : 'Subject is required',
      message: form.message.trim() ? '' : 'Message is required',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSend({
      recipient: form.recipient.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Email">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Recipient"
          aria-label="Recipient"
          type="email"
          autoFocus
          value={form.recipient}
          error={errors.recipient}
          onChange={(event) => updateField('recipient', event.target.value)}
          placeholder="candidate@example.com"
        />
        <Input
          label="Subject"
          aria-label="Subject"
          value={form.subject}
          error={errors.subject}
          onChange={(event) => updateField('subject', event.target.value)}
          placeholder="Email subject"
        />
        <Textarea
          label="Message"
          aria-label="Message"
          value={form.message}
          error={errors.message}
          onChange={(event) => updateField('message', event.target.value)}
          placeholder="Write your message..."
          rows={6}
        />
        <div className="flex justify-end gap-3 border-t border-cream pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Send Email</Button>
        </div>
      </form>
    </Modal>
  )
}

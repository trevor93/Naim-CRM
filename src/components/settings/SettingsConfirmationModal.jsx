import Button from '../ui/Button'
import Modal from '../ui/Modal'

export default function SettingsConfirmationModal({ isOpen, title, description, confirmLabel, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-6 text-text-secondary">{description}</p>
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

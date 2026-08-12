import { Award, FileText, Folder, Shield } from 'lucide-react'
import MedicalDocumentSection from './MedicalDocumentSection'

export const LICENSE_SECTIONS = [
  { id: 'business', type: 'Business License', title: 'Business Licenses', subtitle: 'Business operation licenses and permits', icon: Shield },
  { id: 'professional', type: 'Professional Certification', title: 'Professional Certifications', subtitle: 'Industry certifications and quality standards', icon: Award },
  { id: 'regulatory', type: 'Regulatory Document', title: 'Regulatory Documents', subtitle: 'Compliance and regulatory documentation', icon: FileText },
  { id: 'other', type: 'Other License or Certification', title: 'Other Documents', subtitle: 'Additional licenses and certifications', icon: Folder },
]

export default function LicensesCertificationsPanel({ documentsBySection, selectedBySection, onToggle, onToggleAll, onUpload, onPreview, onEdit, onDownload, onDelete }) {
  return (
    <div className="mt-6 space-y-6">
      {LICENSE_SECTIONS.map((section) => (
        <MedicalDocumentSection key={section.id} section={section} documents={documentsBySection[section.id] || []} selectedIds={selectedBySection[section.id] || new Set()} onToggle={(id) => onToggle(section.id, id)} onToggleAll={() => onToggleAll(section.id)} onUpload={(file) => onUpload(file, section, 'manual')} onCamera={(file) => onUpload(file, section, 'camera')} onPreview={onPreview} onEdit={onEdit} onDownload={onDownload} onDelete={onDelete} />
      ))}
    </div>
  )
}

import { FileText, Folder, Medal, Shield } from 'lucide-react'
import MedicalDocumentSection from './MedicalDocumentSection'

export const MEDICAL_SECTIONS = [
  { id: 'examination', type: 'Medical Examination Report', title: 'Medical Examination Reports', subtitle: 'Pre-employment medical examination reports and health certificates', icon: FileText },
  { id: 'certificate', type: 'Health Certificate', title: 'Health Certificates', subtitle: 'Medical clearance certificates and health documentation', icon: Shield },
  { id: 'vaccination', type: 'Vaccination Record', title: 'Vaccination Records', subtitle: 'Vaccination certificates and immunization records', icon: Medal },
  { id: 'other', type: 'Other Medical Document', title: 'Other Medical Documents', subtitle: 'Additional medical reports and health-related documents', icon: Folder },
]

export default function MedicalReportsPanel({ documentsBySection, selectedBySection, onToggle, onToggleAll, onUpload, onPreview, onEdit, onDownload, onDelete }) {
  return (
    <div className="mt-6 space-y-6">
      <aside className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-5 text-blue-900">
        <h2 className="text-sm font-semibold text-blue-900">Medical Reports Hub</h2>
        <p className="mt-2 text-xs leading-6 text-blue-700">Manage medical examination reports, health certificates, vaccination records, and other health-related documents. Ensure compliance with employment health requirements and maintain organized medical records for all candidates.</p>
      </aside>
      {MEDICAL_SECTIONS.map((section) => (
        <MedicalDocumentSection key={section.id} section={section} documents={documentsBySection[section.id] || []} selectedIds={selectedBySection[section.id] || new Set()} onToggle={(id) => onToggle(section.id, id)} onToggleAll={() => onToggleAll(section.id)} onUpload={(file) => onUpload(file, section, 'manual')} onCamera={(file) => onUpload(file, section, 'camera')} onPreview={onPreview} onEdit={onEdit} onDownload={onDownload} onDelete={onDelete} />
      ))}
    </div>
  )
}

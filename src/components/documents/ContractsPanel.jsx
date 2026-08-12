import { Building2, FileText, Files, Folder } from 'lucide-react'
import MedicalDocumentSection from './MedicalDocumentSection'

export const CONTRACT_SECTIONS = [
  { id: 'candidate', type: 'Candidate Contract', title: 'Candidate Contracts', subtitle: 'Employment contracts and agreements for candidates', icon: FileText },
  { id: 'company', type: 'Company Contract', title: 'Company Contracts', subtitle: 'Service agreements and contracts with client companies', icon: Building2 },
  { id: 'employee', type: 'Employee Contract', title: 'Employee Contracts', subtitle: 'Internal employee contracts and HR documents', icon: Files },
  { id: 'other', type: 'Other Contract', title: 'Other Contracts', subtitle: 'Miscellaneous contracts and legal agreements', icon: Folder },
]

export default function ContractsPanel({ documentsBySection, selectedBySection, onToggle, onToggleAll, onUpload, onPreview, onEdit, onDownload, onDelete }) {
  return (
    <div className="mt-6 space-y-6">
      {CONTRACT_SECTIONS.map((section) => (
        <MedicalDocumentSection key={section.id} section={section} documents={documentsBySection[section.id] || []} selectedIds={selectedBySection[section.id] || new Set()} onToggle={(id) => onToggle(section.id, id)} onToggleAll={() => onToggleAll(section.id)} onUpload={(file) => onUpload(file, section, 'manual')} onCamera={(file) => onUpload(file, section, 'camera')} onPreview={onPreview} onEdit={onEdit} onDownload={onDownload} onDelete={onDelete} />
      ))}
    </div>
  )
}

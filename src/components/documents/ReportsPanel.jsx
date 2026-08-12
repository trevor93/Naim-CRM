import { BarChart3, FileBarChart, FileText, Shield } from 'lucide-react'
import MedicalDocumentSection from './MedicalDocumentSection'

export const REPORT_SECTIONS = [
  { id: 'financial', type: 'Financial Report', title: 'Financial Reports', subtitle: 'Monthly, quarterly, and annual financial reports', icon: BarChart3 },
  { id: 'performance', type: 'Performance Report', title: 'Performance Reports', subtitle: 'Staff performance and business metrics reports', icon: FileText },
  { id: 'compliance', type: 'Compliance Report', title: 'Compliance Reports', subtitle: 'Regulatory compliance and audit reports', icon: Shield },
  { id: 'analytics', type: 'Analytics Report', title: 'Analytics Reports', subtitle: 'Data analytics and business intelligence reports', icon: FileBarChart },
]

export default function ReportsPanel({ documentsBySection, selectedBySection, onToggle, onToggleAll, onUpload, onPreview, onEdit, onDownload, onDelete }) {
  return (
    <div className="mt-6 space-y-6">
      <aside className="rounded-lg border border-green-200 bg-green-50 px-4 py-5 text-green-900">
        <h2 className="text-sm font-semibold text-green-900">Reports & Analytics</h2>
        <p className="mt-2 text-xs leading-6 text-green-700">Store and manage all business reports including financial statements, performance metrics, compliance documents, and analytics reports. Maintain organized records for audits and strategic planning.</p>
      </aside>
      {REPORT_SECTIONS.map((section) => (
        <MedicalDocumentSection key={section.id} section={section} documents={documentsBySection[section.id] || []} selectedIds={selectedBySection[section.id] || new Set()} onToggle={(id) => onToggle(section.id, id)} onToggleAll={() => onToggleAll(section.id)} onUpload={(file) => onUpload(file, section, 'manual')} onCamera={(file) => onUpload(file, section, 'camera')} onPreview={onPreview} onEdit={onEdit} onDownload={onDownload} onDelete={onDelete} />
      ))}
    </div>
  )
}

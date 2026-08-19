import { Files, FileText, Image, Megaphone } from 'lucide-react'
import MedicalDocumentSection from './MedicalDocumentSection'

export const MARKETING_SECTIONS = [
  { id: 'materials', type: 'Marketing Material', title: 'Marketing Materials', subtitle: 'Brochures, flyers, and promotional materials', icon: Megaphone },
  { id: 'advertisements', type: 'Advertisement', title: 'Advertisements', subtitle: 'Job advertisements and recruitment campaigns', icon: FileText },
  { id: 'brand', type: 'Brand Asset', title: 'Brand Assets', subtitle: 'Logos, brand guidelines, and visual identity materials', icon: Image },
  { id: 'social', type: 'Social Media Content', title: 'Social Media Content', subtitle: 'Social media posts, campaigns, and content calendars', icon: Files },
]

export default function AdvertsMarketingPanel({ documentsBySection, selectedBySection, onToggle, onToggleAll, onUpload, onPreview, onEdit, onDownload, onDelete, onDownloadSelected, onDeleteSelected }) {
  return (
    <div className="mt-6 space-y-6">
      <aside className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-5 text-orange-900">
        <h2 className="text-sm font-semibold text-orange-900">Marketing & Advertising Hub</h2>
        <p className="mt-2 text-xs leading-6 text-orange-700">Centralize all your marketing materials, job advertisements, brand assets, and social media content. Keep track of promotional campaigns and maintain consistent branding across all recruitment efforts.</p>
      </aside>
      {MARKETING_SECTIONS.map((section) => (
        <MedicalDocumentSection key={section.id} section={section} documents={documentsBySection[section.id] || []} selectedIds={selectedBySection[section.id] || new Set()} onToggle={(id) => onToggle(section.id, id)} onToggleAll={() => onToggleAll(section.id)} onUpload={(file) => onUpload(file, section, 'manual')} onCamera={(file) => onUpload(file, section, 'camera')} onPreview={onPreview} onEdit={onEdit} onDownload={onDownload} onDelete={onDelete} onDownloadSelected={() => onDownloadSelected(section.id)} onDeleteSelected={() => onDeleteSelected(section.id)} />
      ))}
    </div>
  )
}

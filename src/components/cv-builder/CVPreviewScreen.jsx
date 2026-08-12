import { Eye, Printer, Save } from 'lucide-react'
import Button from '../ui/Button'
import Template1Preview from './templates/Template1Preview'
import Template2Preview from './templates/Template2Preview'
import Template3Preview from './templates/Template3Preview'
import Template4Preview from './templates/Template4Preview'
import Template5Preview from './templates/Template5Preview'

function GenericCVPreview({ draft }) {
  return (
    <div className="cv-template-scroll">
      <article className="cv-template-print-area mx-auto w-[760px] border border-slate-200 bg-[#fffdf6] p-8 text-slate-800 shadow-sm">
        <div className="border-b-4 border-[#8b6914] pb-5 text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-[#8b6914]">NAIM INVESTMENTS</p>
          <h2 className="mt-3 text-2xl font-bold">{draft.fullName}</h2>
          <p className="mt-1 text-sm text-slate-500">{draft.position} · {draft.workCity}</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5">
          <div><p className="text-xs font-bold text-[#8b6914]">CONTACT</p><p className="mt-2 text-sm">{draft.contact}</p><p className="text-sm">{draft.email}</p></div>
          <div><p className="text-xs font-bold text-[#8b6914]">PASSPORT</p><p className="mt-2 text-sm">{draft.passportNumber}</p><p className="text-sm">{draft.nationality || 'Nationality not specified'}</p></div>
          <div className="col-span-2"><p className="text-xs font-bold text-[#8b6914]">SKILLS</p><p className="mt-2 text-sm">{draft.skills.join(' · ')}</p></div>
          <div className="col-span-2"><p className="text-xs font-bold text-[#8b6914]">REMARKS</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{draft.remarks}</p></div>
        </div>
      </article>
    </div>
  )
}

export default function CVPreviewScreen({ draft, onEdit, onSave }) {
  return (
    <section data-testid="cv-preview-screen" className="cv-preview-screen mx-auto min-w-0 max-w-[1254px] animate-fade-in">
      <header className="cv-preview-heading mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#9a7010] sm:text-3xl">CV Builder with Multiple Templates</h1>
        <p className="mt-2 text-xs text-slate-600 sm:text-sm">Create professional CVs with our easy-to-use builder</p>
      </header>

      <div className="cv-preview-toolbar mb-8 flex flex-col gap-5 bg-white px-4 py-4 shadow-[0_5px_12px_rgba(0,0,0,0.14)] sm:px-6 lg:flex-row lg:items-center">
        <h2 className="min-w-0 flex-1 break-words text-base font-bold text-black sm:text-lg">
          CV Preview - {draft.fullName}
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={onEdit} className="min-h-[72px] min-w-[100px] flex-col border-[#ead09c] text-[#8b6914]">
            <Eye className="h-4 w-4" aria-hidden="true" /> Edit
          </Button>
          <Button type="button" variant="outline" onClick={onSave} className="min-h-[72px] min-w-[100px] flex-col border-[#ead09c] text-[#8b6914]">
            <Save className="h-4 w-4" aria-hidden="true" /> Save Draft
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()} className="min-h-[72px] min-w-[150px] flex-col border-[#ead09c] text-[#8b6914]">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print/Download
          </Button>
        </div>
      </div>

      {draft.template === '1' && <Template1Preview draft={draft} />}
      {draft.template === '2' && <Template2Preview draft={draft} />}
      {draft.template === '3' && <Template3Preview draft={draft} />}
      {draft.template === '4' && <Template4Preview draft={draft} />}
      {draft.template === '5' && <Template5Preview draft={draft} />}
      {!['1', '2', '3', '4', '5'].includes(draft.template) && <GenericCVPreview draft={draft} />}
    </section>
  )
}

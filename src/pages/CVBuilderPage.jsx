import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bot,
  Camera,
  Check,
  Eye,
  Image,
  Music2,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react'
import CVPreviewScreen from '../components/cv-builder/CVPreviewScreen'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../contexts/ToastContext'
import {
  clearCVBuilderDraft,
  cvDraftFromCandidate,
  CV_SELECT_OPTIONS,
  loadCVBuilderDraft,
  saveCVBuilderDraft,
} from '../services/cvBuilderService'

const TEMPLATES = [
  ['1', 'Template 1', 'NAIM INVESTMENT LIMITED', '(Green Headers)'],
  ['2', 'Template 2', 'MODERN LAYOUT', '(Blue Headers)'],
  ['3', 'Template 3', 'NAIM INVESTMENTS', '(Maroon/Gold Headers)'],
  ['4', 'Template 4', 'NAIM INVESTMENTS', '2 PAGES', '(Arabic Style)'],
  ['5', 'Template 5', 'DOMESTIC HELPER', '(Almehan Layout)'],
]

function Section({ title, note, tone = 'default', children }) {
  const tones = {
    default: 'border-[#e1d9a8] bg-white',
    yellow: 'border-[#e2cf74] bg-[#fffde7]',
    rose: 'border-[#e9b8bc] bg-[#fff1f2]',
  }
  return (
    <section className={`rounded-lg border p-5 shadow-[0_3px_8px_rgba(86,67,13,0.13)] ${tones[tone]}`}>
      <h2 className={`text-sm font-bold ${tone === 'rose' ? 'text-[#9b111e]' : 'text-[#8b6914]'}`}>{title}</h2>
      {note && <p className="mt-1 text-[11px] italic text-slate-500">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '', dir, className = '', children }) {
  const id = `cv-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label className={`block min-w-0 ${className}`} htmlFor={id}>
      <span className="mb-1.5 block text-[11px] font-medium text-slate-800">{label}</span>
      {children || (
        <input
          id={id}
          aria-label={label}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          dir={dir}
          className="h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-[#b98a17] focus:ring-2 focus:ring-[#d8b85a]/20"
        />
      )}
    </label>
  )
}

function SelectField({ label, value, onChange, options, placeholder = 'Select' }) {
  const id = `cv-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className="mb-1.5 block text-[11px] font-medium text-slate-800">{label}</span>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#b98a17] focus:ring-2 focus:ring-[#d8b85a]/20"
      >
        {/* Stage passes placeholder={null}: it always holds one of its choices. */}
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function TextAreaField({ label, value, onChange, placeholder = '', rows = 3 }) {
  const id = `cv-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-[11px] font-medium text-slate-800">{label}</span>
      <textarea
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs leading-5 text-slate-800 outline-none focus:border-[#b98a17] focus:ring-2 focus:ring-[#d8b85a]/20"
      />
    </label>
  )
}

function UploadChoice({ label, cameraLabel, name, onFile, wide = false }) {
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const choose = (event) => {
    const file = event.target.files?.[0]
    if (file) onFile(file.name)
    event.target.value = ''
  }
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="mb-2 text-[11px] font-medium text-slate-800">{label}</p>
      <div className="rounded-md border border-dashed border-slate-300 bg-white">
        <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 px-3 py-3 text-[11px] text-slate-500">
          <Upload className="h-3.5 w-3.5" /> Choose {label}
        </button>
        <button type="button" onClick={() => cameraRef.current?.click()} className="flex w-full items-center justify-center gap-2 border-t border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-[11px] text-blue-600">
          <Camera className="h-3.5 w-3.5" /> {cameraLabel}
        </button>
      </div>
      {name && <p className="mt-1 break-all text-[10px] text-emerald-700">{name}</p>}
      <input ref={fileRef} type="file" className="sr-only" aria-label={`Choose ${label}`} onChange={choose} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" aria-label={cameraLabel} onChange={choose} />
    </div>
  )
}

function PhotoCard({ title, name, onFile }) {
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const choose = (event) => {
    const file = event.target.files?.[0]
    if (file) onFile(file.name)
    event.target.value = ''
  }
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-400 bg-white p-5 text-center">
      <Camera className="h-10 w-10 text-[#9b7111]" />
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      {name && <p className="mt-1 max-w-full break-all text-[10px] text-emerald-700">{name}</p>}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded bg-[#8b6914] px-3 py-1.5 text-[11px] font-medium text-white">Choose Photo</button>
        <button type="button" onClick={() => cameraRef.current?.click()} className="rounded bg-blue-100 px-3 py-1.5 text-[11px] font-medium text-blue-600">Take Photo</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label={`Choose ${title}`} onChange={choose} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" aria-label={`Take ${title}`} onChange={choose} />
    </div>
  )
}

export default function CVBuilderPage() {
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => loadCVBuilderDraft())
  const [previewOpen, setPreviewOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)

  // The Candidates page "Create/Edit CV" action hands a candidate over in
  // route state. Merge it into the draft, then clear the state so a refresh
  // or back-navigation doesn't silently re-apply it.
  const handoffCandidate = location.state?.candidate
  const handledHandoffRef = useRef(null)
  useEffect(() => {
    if (!handoffCandidate || handledHandoffRef.current === handoffCandidate) return
    handledHandoffRef.current = handoffCandidate
    const prefill = cvDraftFromCandidate(handoffCandidate)
    setDraft((current) => {
      const next = { ...current, ...prefill }
      if (next.autoSave) saveCVBuilderDraft(next)
      return next
    })
    toast.success(`CV loaded for ${handoffCandidate.name || 'candidate'}`)
    navigate('/cv-builder', { replace: true, state: null })
  }, [handoffCandidate, navigate, toast])

  useEffect(() => {
    if (!draft.autoSave) return undefined
    const timer = window.setTimeout(() => saveCVBuilderDraft(draft), 250)
    return () => window.clearTimeout(timer)
  }, [draft])

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const setFile = (key, name) => setDraft((current) => ({ ...current, files: { ...current.files, [key]: name } }))

  function saveDraft() {
    setDraft(saveCVBuilderDraft(draft))
    toast.success('Draft saved')
  }

  function addSkill() {
    const skill = draft.newSkill.trim().toUpperCase()
    if (!skill) return
    if (draft.skills.includes(skill)) return toast.info('Skill already added')
    setDraft((current) => ({ ...current, newSkill: '', skills: [...current.skills, skill] }))
  }

  function removeSkill(skill) {
    setDraft((current) => ({ ...current, skills: current.skills.filter((candidate) => candidate !== skill) }))
  }

  function resetStorage() {
    setDraft(clearCVBuilderDraft())
    setClearOpen(false)
    toast.success('CV Builder storage cleared')
  }

  function saveAsCandidate() {
    saveCVBuilderDraft(draft)
    toast.success('Candidate saved from CV Builder')
  }

  function chooseAutofill(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setFile('autofill', file.name)
    toast.success('CV uploaded for AI extraction')
    event.target.value = ''
  }

  if (previewOpen) {
    return (
      <Layout title="Admin Dashboard">
        <CVPreviewScreen draft={draft} onEdit={() => setPreviewOpen(false)} onSave={saveDraft} />
      </Layout>
    )
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="mx-auto max-w-6xl min-w-0 animate-fade-in">
        <header className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-[#9a7010] sm:text-3xl">CV Builder with Multiple Templates</h1>
          <p className="mt-2 text-xs text-slate-500 sm:text-sm">Create professional CVs with our easy-to-use builder</p>
        </header>

        <div data-testid="cv-builder-panel" className="overflow-hidden rounded-xl border border-[#e2d99f] bg-[#fffde7] shadow-[0_8px_20px_rgba(87,68,16,0.12)]">
          <div className="flex flex-col gap-4 border-b border-[#e2d99f] bg-white px-5 py-4 sm:flex-row sm:items-center">
            <h2 className="text-sm font-bold text-[#8b6914] sm:text-base">Professional CV Builder - Saudi Recruitment</h2>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <label className="inline-flex items-center gap-2 text-[11px] text-slate-600">
                <span className="relative inline-flex h-5 w-10 items-center">
                  <input type="checkbox" aria-label="Auto-save" checked={draft.autoSave} onChange={(event) => update('autoSave', event.target.checked)} className="peer sr-only" />
                  <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-green-500" />
                  <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
                Auto-save
              </label>
              <Button type="button" size="sm" onClick={saveDraft} className="rounded-md bg-[#8b6914] hover:bg-[#6b520f]"><Save className="h-3.5 w-3.5" /> Save Draft</Button>
              <Button type="button" size="sm" variant="success" onClick={() => setPreviewOpen(true)} className="rounded-md"><Eye className="h-3.5 w-3.5" /> Preview CV</Button>
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            <Section title="Upload CV for Auto-fill" tone="yellow">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1 text-[11px] text-slate-700">
                  <span className="mb-2 block">Select CV File(s) (PDF, JPG, PNG) - Multiple files supported</span>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" aria-label="Choose CV files" onChange={chooseAutofill} className="block w-full rounded-md border border-slate-300 bg-white text-[11px] file:mr-3 file:border-0 file:bg-[#8b6914] file:px-3 file:py-2.5 file:text-white" />
                </label>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-medium text-green-600"><Bot className="h-3 w-3" /> AI Extraction</span>
              </div>
              <button type="button" onClick={() => document.querySelector('[aria-label="Choose CV files"]')?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-[11px] text-blue-600"><Camera className="h-4 w-4" /> Take Photo of CV</button>
              <p className="mt-3 text-[10px] text-slate-500">💡 Tip: Upload one or multiple CV files and we&apos;ll automatically extract and merge candidate information to fill the form. You can edit any field after auto-fill.</p>
            </Section>

            <Section title="Select CV Template">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {TEMPLATES.map(([id, name, ...lines]) => (
                  <label key={id} className={`relative cursor-pointer rounded-md border-2 bg-white p-3 text-center transition ${draft.template === id ? 'border-[#a77b13] bg-[#fff9df]' : 'border-slate-200 hover:border-amber-300'}`}>
                    <input type="radio" name="cv-template" aria-label={`CV template ${id}`} checked={draft.template === id} onChange={() => update('template', id)} className="sr-only" />
                    <span className="block text-xs font-bold text-slate-900">{name}</span>
                    <span className="mt-4 flex min-h-20 flex-col items-center justify-center rounded border border-slate-200 bg-[#fdfdfd] px-1 text-[9px] font-medium leading-4 text-slate-800">
                      {lines.map((line) => <span key={line}>{line}</span>)}
                    </span>
                    {draft.template === id && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-[#8b6914]" />}
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Company Letterhead Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company Logo" value="" onChange={() => {}}><input id="cv-company-logo" aria-label="Company Logo" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && setFile('companyLogo', event.target.files[0].name)} className="block h-10 w-full rounded-md border border-slate-300 bg-white text-[11px] file:h-full file:border-0 file:bg-slate-100 file:px-3" /></Field>
                <Field label="Company Name" value={draft.companyName} onChange={(value) => update('companyName', value)} />
                <Field label="Company Name (Arabic)" value={draft.companyNameArabic} onChange={(value) => update('companyNameArabic', value)} dir="rtl" />
                <Field label="Location" value={draft.companyLocation} onChange={(value) => update('companyLocation', value)} />
                <Field label="Contact Number" value={draft.companyPhone} onChange={(value) => update('companyPhone', value)} />
              </div>
            </Section>

            <Section title="Position Information">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Position" value={draft.position} onChange={(value) => update('position', value)} />
                <Field label="Position (Arabic)" value={draft.positionArabic} onChange={(value) => update('positionArabic', value)} dir="rtl" />
                <Field label="Salary" value={draft.salary} onChange={(value) => update('salary', value)} />
              </div>
            </Section>

            <Section title="Passport Details">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Passport Number" value={draft.passportNumber} onChange={(value) => update('passportNumber', value)} />
                <Field label="Date Issued" value={draft.dateIssued} onChange={(value) => update('dateIssued', value)} type="date" />
                <Field label="Date Expiry" value={draft.dateExpiry} onChange={(value) => update('dateExpiry', value)} type="date" />
                <Field label="Place Issued" value={draft.placeIssued} onChange={(value) => update('placeIssued', value)} placeholder="e.g. NAIROBI" />
              </div>
            </Section>

            <Section title="Personal Information">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Full Name" value={draft.fullName} onChange={(value) => update('fullName', value)} />
                <Field label="Full Name (Arabic)" value={draft.fullNameArabic} onChange={(value) => update('fullNameArabic', value)} dir="rtl" />
                <Field label="Address" value={draft.address} onChange={(value) => update('address', value)} placeholder="e.g. MOMBASA, KENYA" />
                <Field label="Nationality" value={draft.nationality} onChange={(value) => update('nationality', value)} placeholder="e.g. KENYAN" />
                <SelectField label="Religion" value={draft.religion} onChange={(value) => update('religion', value)} options={CV_SELECT_OPTIONS.religion} placeholder="Select Religion" />
                <Field label="Date of Birth" value={draft.dateOfBirth} onChange={(value) => update('dateOfBirth', value)} type="date" />
                <Field label="Place of Birth" value={draft.placeOfBirth} onChange={(value) => update('placeOfBirth', value)} placeholder="e.g. KWALE, KENYA" />
                <Field label="Father's Name" value={draft.fatherName} onChange={(value) => update('fatherName', value)} placeholder="e.g. HASSAN KOMBO" />
                <Field label="Mother's Name" value={draft.motherName} onChange={(value) => update('motherName', value)} placeholder="e.g. UMAZI KOMBO" />
              </div>
            </Section>

            <Section title="Physical Details">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Age" value={draft.age} onChange={(value) => update('age', value)} placeholder="e.g. 25" />
                <Field label="Height" value={draft.height} onChange={(value) => update('height', value)} placeholder="e.g. 5.3 FT" />
                <Field label="Weight" value={draft.weight} onChange={(value) => update('weight', value)} placeholder="e.g. 58.5 KG" />
              </div>
            </Section>

            <Section title="Family Status">
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField label="Civil Status" value={draft.civilStatus} onChange={(value) => update('civilStatus', value)} options={CV_SELECT_OPTIONS.civilStatus} placeholder="Select Status" />
                <Field label="Spouse" value={draft.spouse} onChange={(value) => update('spouse', value)} placeholder="Select" />
                <Field label="Number of Kids" value={draft.numberOfKids} onChange={(value) => update('numberOfKids', value)} placeholder="e.g. 1 KID" />
              </div>
            </Section>

            <Section title="Education & Experience">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField label="Education Level" value={draft.educationLevel} onChange={(value) => update('educationLevel', value)} options={CV_SELECT_OPTIONS.educationLevel} placeholder="Select Level" />
                <SelectField label="English Level" value={draft.englishLevel} onChange={(value) => update('englishLevel', value)} options={CV_SELECT_OPTIONS.englishLevel} placeholder="Select Level" />
                <SelectField label="Arabic Level" value={draft.arabicLevel} onChange={(value) => update('arabicLevel', value)} options={CV_SELECT_OPTIONS.arabicLevel} placeholder="Select Level" />
                <Field label="Work Position" value={draft.workPosition} onChange={(value) => update('workPosition', value)} />
                <Field label="Work Country" value={draft.workCountry} onChange={(value) => update('workCountry', value)} placeholder="e.g. SAUDI ARABIA" />
                <Field label="Work Years" value={draft.workYears} onChange={(value) => update('workYears', value)} placeholder="e.g. 2 YEARS" />
              </div>
            </Section>

            <Section title="Other Information" note="(These are details that appear only in the Candidates page and not the CV preview)" tone="yellow">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Contact" value={draft.contact} onChange={(value) => update('contact', value)} />
                <Field label="Email" value={draft.email} onChange={(value) => update('email', value)} type="email" />
                <Field label="Emergency Contact" value={draft.emergencyContact} onChange={(value) => update('emergencyContact', value)} placeholder="e.g. +254700000000" />
                <Field label="Work Company" value={draft.workCompany} onChange={(value) => update('workCompany', value)} placeholder="e.g. ALJABRIYAH RECRUITMENT OFFICE" />
                <Field label="Work City" value={draft.workCity} onChange={(value) => update('workCity', value)} />
                <SelectField label="Stage" value={draft.stage} onChange={(value) => update('stage', value)} options={CV_SELECT_OPTIONS.stage} placeholder={null} />
              </div>
            </Section>

            {draft.template === '3' && (
              <Section title="EXTRA INFORMATION FOR TEMPLATE 3" tone="rose">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Reference Number" value={draft.referenceNumber} onChange={(value) => update('referenceNumber', value)} placeholder="e.g. 001" />
                  <Field label="Date" value={draft.referenceDate} onChange={(value) => update('referenceDate', value)} placeholder="e.g. 18/JUL/2025" />
                  <Field label="Destination" value={draft.destination} onChange={(value) => update('destination', value)} placeholder="e.g. SAUDI ARABIA" />
                  <Field label="Next of Kin Name" value={draft.nextOfKin} onChange={(value) => update('nextOfKin', value)} />
                  <Field label="Kinship" value={draft.kinship} onChange={(value) => update('kinship', value)} placeholder="e.g. SISTER" />
                  <Field label="Other Emergency Info" value={draft.otherEmergencyInfo} onChange={(value) => update('otherEmergencyInfo', value)} placeholder="e.g. 0728735569 (WILLIAM CUZ, BRO)" />
                  <Field label="ID Number" value={draft.idNumber} onChange={(value) => update('idNumber', value)} />
                  <Field label="Complexion" value={draft.complexion} onChange={(value) => update('complexion', value)} placeholder="e.g. Fair, Medium, Dark" />
                  <Field label="Education Period" value={draft.educationPeriod} onChange={(value) => update('educationPeriod', value)} placeholder="e.g. 1994-2007" />
                  <Field label="Additional Education Info" value={draft.additionalEducation} onChange={(value) => update('additionalEducation', value)} className="sm:col-span-2 lg:col-span-3" />
                  <TextAreaField label="Hobbies" value={draft.hobbies} onChange={(value) => update('hobbies', value)} rows={4} />
                  <TextAreaField label="Medical History/Sickness" value={draft.medicalHistory} onChange={(value) => update('medicalHistory', value)} placeholder="Enter any medical history or conditions" rows={4} />
                </div>
              </Section>
            )}

            <Section title="Remarks" tone="yellow">
              <TextAreaField label="Additional Remarks" value={draft.remarks} onChange={(value) => update('remarks', value)} rows={4} />
            </Section>

            <Section title="Skills Selection">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input aria-label="New skill" value={draft.newSkill} onChange={(event) => update('newSkill', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill() } }} placeholder="Enter new skill..." className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-xs outline-none focus:border-[#b98a17]" />
                <Button type="button" size="sm" onClick={addSkill} className="rounded-md bg-[#8b6914] hover:bg-[#6b520f]"><Plus className="h-3.5 w-3.5" /> Add Skills</Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {draft.skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                    <input type="checkbox" aria-label={skill} checked readOnly className="h-4 w-4 accent-blue-600" />
                    <span className="min-w-0 flex-1 break-words text-[11px] font-medium text-slate-700">{skill}</span>
                    <button type="button" aria-label={`Remove ${skill}`} onClick={() => removeSkill(skill)} className="text-red-400 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Photo Upload">
              <div className="grid gap-5 sm:grid-cols-2">
                <PhotoCard title="Profile Photo" name={draft.files.profilePhoto} onFile={(name) => setFile('profilePhoto', name)} />
                <PhotoCard title="Full Body Photo" name={draft.files.fullBodyPhoto} onFile={(name) => setFile('fullBodyPhoto', name)} />
              </div>
            </Section>

            <Section title="Document Upload">
              <div className="grid gap-5 sm:grid-cols-2">
                <UploadChoice label="Passport Document" cameraLabel="Take Photo of Passport" name={draft.files.passport} onFile={(name) => setFile('passport', name)} />
                <UploadChoice label="ID Document" cameraLabel="Take Photo of ID" name={draft.files.idDocument} onFile={(name) => setFile('idDocument', name)} />
                <UploadChoice label="Qualification Certificates" cameraLabel="Take Photo of Certificates" name={draft.files.qualifications} onFile={(name) => setFile('qualifications', name)} />
                <UploadChoice label="Good Conduct Certificates" cameraLabel="Take Photo of Certificates" name={draft.files.goodConduct} onFile={(name) => setFile('goodConduct', name)} />
                <UploadChoice label="Other Documents (PDF, Word, Excel, Images)" cameraLabel="Take Photo of Documents" name={draft.files.otherDocuments} onFile={(name) => setFile('otherDocuments', name)} wide />
              </div>
            </Section>

            <Section title="Media Upload">
              <p className="mb-2 text-[11px] font-medium text-slate-800">Images, Videos & Music</p>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-5 py-5 text-[11px] text-slate-500">
                <Image className="h-3.5 w-3.5" /><Video className="h-3.5 w-3.5" /><Music2 className="h-3.5 w-3.5" /> Choose Media Files (Images, Videos, Music)
                <input type="file" multiple accept="image/*,video/*,audio/*" className="sr-only" aria-label="Choose Media Files" onChange={(event) => setFile('media', [...event.target.files].map((file) => file.name).join(', '))} />
              </label>
              {draft.files.media && <p className="mt-1 break-all text-[10px] text-emerald-700">{draft.files.media}</p>}
            </Section>

            <div className="grid gap-3 rounded-lg border border-[#e1d9a8] bg-white p-4 shadow-[0_3px_8px_rgba(86,67,13,0.13)] sm:grid-cols-2 lg:grid-cols-4">
              <Button type="button" variant="outline" onClick={saveDraft} className="border-[#d8bd68] text-[#8b6914]"><Save className="h-4 w-4" /> Save Draft</Button>
              <Button type="button" variant="outline" onClick={saveAsCandidate} className="border-[#d8bd68] text-[#8b6914]"><Plus className="h-4 w-4" /> Save as Candidate</Button>
              <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)} className="border-[#d8bd68] text-[#8b6914]"><Eye className="h-4 w-4" /> Preview & Print CV</Button>
              <Button type="button" variant="outline" onClick={() => setClearOpen(true)} className="border-[#d8bd68] text-[#8b6914]"><Trash2 className="h-4 w-4" /> Clear Storage</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={clearOpen} onClose={() => setClearOpen(false)} title="Clear CV Builder Storage" size="sm">
        <p className="text-sm leading-6 text-slate-600">This clears the saved local CV draft and restores the reference candidate information.</p>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={() => setClearOpen(false)}>Cancel</Button>
          <Button type="button" variant="danger" onClick={resetStorage}>Clear Storage</Button>
        </div>
      </Modal>
    </Layout>
  )
}

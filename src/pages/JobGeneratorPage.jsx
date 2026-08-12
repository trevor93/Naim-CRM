import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Link2, MapPin, Paperclip, Trash2, Upload, Users } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import { useToast } from '../contexts/ToastContext'
import { getCandidates } from '../services/candidateService'
import { demoCandidatesList } from '../services/demoData'
import { addJob } from '../services/jobService'
import { isSupabaseConfigured } from '../supabase/client'

const QUALIFICATIONS = ['Primary School', 'Secondary School', 'High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD/Doctorate']
const POSITIONS = [
  'Housemaids', 'Waiters/Waitress', 'Baristas', 'Cleaners', 'Caregivers', 'Drivers', 'Truck Drivers',
  'Security Services', 'Emergency Services', 'Nurses', 'Teachers', 'Plant Technicians', 'Erectors',
  'Fabrication Foreman', 'Fabricator', 'Fitter', 'CNC Machine Operator', 'Welder', 'Forman - Steel factory',
  'Welder (stainless steel)', 'Steel structure draftsman', 'Helper', 'Diesel Engine Mechanic',
  'Hydraulic Mechanic', 'Tyre Man', 'Auto Electrician', 'Mechanic Helper', 'Mechanic Foreman',
  'Car Denter', 'Car Painter', 'Helper (Painting)', 'Central - AC Tech.', 'Mobile crane driver', 'Other',
]
const CITIES = {
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
  UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'],
  Kuwait: ['Kuwait City', 'Hawalli', 'Salmiya', 'Jahra', 'Ahmadi'],
  Qatar: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Dukhan'],
  Bahrain: ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town'],
  Oman: ['Muscat', 'Salalah', 'Nizwa', 'Sur', 'Sohar'],
}
const INITIAL = {
  genders: [], qualifications: [], positions: [], salary: '', company: '', vacancies: '1',
  accommodation: '', ageRange: '', nationality: '', dutyHours: '', workDays: '', overtime: '',
  transport: '', contractPeriod: '', experience: '', details: '', customPosition: '', specifyOne: '', specifyTwo: '',
}

function CheckGroup({ legend, values, selected, onToggle, error }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-primary">{legend}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {values.map((value) => (
          <label key={value} className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="h-4 w-4 rounded border-slate-300 accent-primary" />
            <span>{value}</span>
          </label>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </fieldset>
  )
}

function RadioGroup({ legend, name, values, value, onChange }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-primary">{legend}</legend>
      <div className="flex flex-wrap gap-6">
        {values.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="radio" name={name} value={option} checked={value === option} onChange={(e) => onChange(e.target.value)} className="accent-primary" />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function CandidateModal({ open, onClose, candidates, linked, setLinked }) {
  const linkedIds = new Set(linked.map((candidate) => candidate.id))
  const available = candidates.filter((candidate) => !linkedIds.has(candidate.id))
  const CandidateCard = ({ candidate, action }) => (
    <article className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="min-w-0"><p className="break-words text-sm font-semibold text-primary">{candidate.name}</p><p className="text-xs text-text-secondary">{candidate.position || 'No position'}</p><p className="break-all text-xs text-text-muted">{candidate.email}</p></div>
      {action}
    </article>
  )
  return (
    <Modal isOpen={open} onClose={onClose} title="Select Candidates to Link" size="full">
      <div className="grid gap-6 md:grid-cols-2">
        <section><h3 className="mb-3 font-semibold text-primary">Available Candidates</h3><div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">{available.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} action={<button type="button" aria-label={`Link ${candidate.name}`} onClick={() => setLinked((items) => [...items, candidate])} className="shrink-0 font-semibold text-amber-600">+ Link</button>} />)}</div></section>
        <section><h3 className="mb-3 font-semibold text-primary">Linked Candidates ({linked.length})</h3><div className="max-h-[430px] space-y-2 overflow-y-auto">{linked.length ? linked.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} action={<button type="button" aria-label={`Unlink ${candidate.name}`} onClick={() => setLinked((items) => items.filter((item) => item.id !== candidate.id))} className="shrink-0 text-sm font-semibold text-red-600">Unlink</button>} />) : <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 text-center"><Users className="h-10 w-10 text-slate-300" /><p className="mt-3 font-medium text-text-secondary">No candidates linked yet.</p><p className="text-sm text-text-muted">Select candidates from the left to link them.</p></div>}</div></section>
      </div>
      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4"><Button variant="outline" onClick={onClose}>Done</Button></div>
    </Modal>
  )
}

export default function JobGeneratorPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [locations, setLocations] = useState([])
  const [locationError, setLocationError] = useState('')
  const [files, setFiles] = useState([])
  const [linked, setLinked] = useState([])
  const [candidates, setCandidates] = useState(demoCandidatesList)
  const [candidateOpen, setCandidateOpen] = useState(false)
  const [disclosures, setDisclosures] = useState([false, false])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const genderRef = useRef(null)
  const positionRef = useRef(null)
  const companyRef = useRef(null)
  const salaryRef = useRef(null)
  const vacancyRef = useRef(null)
  const countryRef = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    getCandidates({ pageSize: 100 }).then((result) => setCandidates(result.data || [])).catch(() => { setCandidates([]); toast.error('Failed to load candidates') })
  }, [toast])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const toggle = (key, value) => setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))
  const availableCities = useMemo(() => CITIES[country] || [], [country])

  function addLocation() {
    if (!country || !city) { setLocationError('Select both a country and city'); (!country ? countryRef.current : document.querySelector('[aria-label="Select City"]'))?.focus(); return }
    if (locations.some((item) => item.country === country && item.city === city)) { setLocationError('This location has already been added'); return }
    setLocations((items) => [...items, { country, city }]); setLocationError(''); setCountry(''); setCity('')
  }

  function chooseFiles(event) {
    const allowed = /^(image|video)\//
    const next = [...event.target.files].filter((file) => allowed.test(file.type) || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type))
    if (next.length !== event.target.files.length) toast.error('Unsupported file selection')
    setFiles((items) => [...items, ...next.map((file) => ({ name: file.name, type: file.type, size: file.size }))])
    event.target.value = ''
  }

  function validate() {
    const next = {}
    if (!form.genders.length) next.genders = 'Select at least one gender'
    if (!form.positions.length && !form.customPosition.trim() && !form.specifyOne.trim() && !form.specifyTwo.trim()) next.positions = 'Select or specify at least one position'
    if (!form.company.trim()) next.company = 'Company name is required'
    if (!form.salary.trim() || Number(form.salary) <= 0) next.salary = 'Enter a valid salary'
    if (!Number.isInteger(Number(form.vacancies)) || Number(form.vacancies) < 1) next.vacancies = 'Enter at least one vacancy'
    if (!locations.length) next.locations = 'Add at least one location'
    setErrors(next)
    const first = Object.keys(next)[0]
    const refs = { genders: genderRef, positions: positionRef, company: companyRef, salary: salaryRef, vacancies: vacancyRef, locations: countryRef }
    refs[first]?.current?.focus()
    return !first
  }

  async function generate(event) {
    event.preventDefault()
    if (!validate()) return
    const roles = [...form.positions, form.specifyOne, form.specifyTwo, form.customPosition].filter((item) => item.trim())
    const primary = locations[0]
    const otherLocations = locations.slice(1).map((item) => `${item.city}, ${item.country}`)
    const details = [form.details.trim(), otherLocations.length ? `Additional locations: ${otherLocations.join('; ')}` : ''].filter(Boolean).join('\n')
    const salary = Number(form.salary)
    const requirements = [...form.qualifications, form.specifyOne, form.specifyTwo].filter(Boolean).join(', ')
    const payload = {
      title: roles.join(', '), gender: form.genders.join(', '), country: primary.country, city: primary.city,
      location: `${primary.city}, ${primary.country}`, company: form.company.trim(), salary_min: salary, salary_max: salary,
      currency: 'SAR', status: 'Active', requirements, experience: form.experience.trim(), accommodation: form.accommodation,
      age_range: form.ageRange.trim(), nationality: form.nationality.trim(), duty_hours: form.dutyHours.trim(), work_days: form.workDays.trim(),
      overtime: form.overtime, transport: form.transport, contract_period: form.contractPeriod.trim(), contract_duration: form.contractPeriod.trim(),
      vacancies_left: Number(form.vacancies), linked_candidates: linked.length, uploads: JSON.stringify(files), additional_details: details,
      description: `${roles.join(', ')} at ${form.company.trim()} in ${primary.city}, ${primary.country}. ${form.vacancies} vacancies available.`,
    }
    setSubmitting(true)
    try {
      const generatedJob = isSupabaseConfigured ? await addJob(payload) : { ...payload, id: `generated-${Date.now()}`, created_at: new Date().toISOString(), linked_candidate_ids: linked.map((candidate) => candidate.id) }
      toast.success('Job created!')
      navigate('/jobs', { state: { generatedJob, exposeGeneratedJob: true } })
    } catch { toast.error('Failed to create job') } finally { setSubmitting(false) }
  }

  const field = (label, key, props = {}) => <Input label={label} aria-label={label} value={form[key]} onChange={(e) => update(key, e.target.value)} {...props} />

  return (
    <Layout title="Admin Dashboard">
      <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
        <header><h1 className="text-3xl font-bold text-primary">Job Generator</h1><p className="mt-2 text-text-secondary">Create job postings quickly with ready-made sections and checkboxes</p></header>
        <Card className="border-slate-200 p-0" padding={false}>
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5"><span className="rounded-lg bg-amber-50 p-2 text-amber-600"><FileText className="h-5 w-5" /></span><h2 className="text-xl font-bold text-primary">Quick Job Builder</h2></div>
          <form onSubmit={generate} noValidate className="p-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div ref={genderRef} tabIndex={-1} className="space-y-7 outline-none">
                <CheckGroup legend="Gender" values={['Male', 'Female']} selected={form.genders} onToggle={(value) => toggle('genders', value)} error={errors.genders} />
                <CheckGroup legend="Qualifications" values={QUALIFICATIONS} selected={form.qualifications} onToggle={(value) => toggle('qualifications', value)} />
                <fieldset className="space-y-3"><legend className="flex items-center gap-2 text-sm font-semibold text-primary"><MapPin className="h-4 w-4 text-amber-600" /> Locations</legend><div className="grid gap-3 sm:grid-cols-2"><Select ref={countryRef} aria-label="Select Country" value={country} onChange={(e) => { setCountry(e.target.value); setCity(''); setLocationError('') }} options={Object.keys(CITIES)} placeholder="Select Country" /><Select aria-label="Select City" value={city} onChange={(e) => { setCity(e.target.value); setLocationError('') }} options={availableCities} placeholder="Select City" disabled={!country} /></div><Button type="button" variant="outline" onClick={addLocation}>Add Location</Button>{(locationError || errors.locations) && <p role="alert" className="text-xs text-danger">{locationError || errors.locations}</p>}<div className="flex flex-wrap gap-2">{locations.map((item) => <span key={`${item.country}-${item.city}`} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs text-primary">{item.city}, {item.country}<button type="button" aria-label={`Remove ${item.country}, ${item.city}`} onClick={() => setLocations((items) => items.filter((location) => location !== item))}><Trash2 className="h-3 w-3 text-red-500" /></button></span>)}</div></fieldset>
                {field('Salary', 'salary', { ref: salaryRef, type: 'number', min: '0', error: errors.salary, placeholder: 'Enter salary in SAR' })}
                {field('Company Name', 'company', { ref: companyRef, error: errors.company, placeholder: 'Enter company name' })}
                {field('Number of Vacancies', 'vacancies', { ref: vacancyRef, type: 'number', min: '1', error: errors.vacancies })}
                <RadioGroup legend="Accommodation" name="accommodation" values={['Yes', 'No']} value={form.accommodation} onChange={(value) => update('accommodation', value)} />
                {field('Age Maximum Range', 'ageRange', { placeholder: 'e.g. 35 years' })}
                {field('Nationality', 'nationality', { placeholder: 'e.g. Any' })}
                {field('Duty Hours', 'dutyHours', { placeholder: 'e.g. 8 hours' })}
                {field('Work Days', 'workDays', { placeholder: 'e.g. 6 days per week' })}
                <RadioGroup legend="Overtime" name="overtime" values={['Available', 'Not Available']} value={form.overtime} onChange={(value) => update('overtime', value)} />
                <RadioGroup legend="Transport Provision" name="transport" values={['Provided', 'Not Provided']} value={form.transport} onChange={(value) => update('transport', value)} />
                {field('Contract Period', 'contractPeriod', { placeholder: 'e.g. 2 years' })}
              </div>
              <div ref={positionRef} tabIndex={-1} className="space-y-7 outline-none">
                <fieldset className="space-y-3"><legend className="text-sm font-semibold text-primary">Positions</legend><div className="space-y-2">{POSITIONS.map((position, index) => <div key={position}>{index === 9 && <div className="mb-2"><button type="button" aria-expanded={disclosures[0]} onClick={() => setDisclosures(([one, two]) => [!one, two])} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-text-secondary">Specify... <ChevronDown className="h-4 w-4" /></button>{disclosures[0] && <Input autoFocus aria-label="First specified position" value={form.specifyOne} onChange={(e) => update('specifyOne', e.target.value)} placeholder="Specify..." className="mt-2" />}</div>}{index === 12 && <div className="mb-2"><button type="button" aria-expanded={disclosures[1]} onClick={() => setDisclosures(([one, two]) => [one, !two])} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-text-secondary">Specify... <ChevronDown className="h-4 w-4" /></button>{disclosures[1] && <Input autoFocus aria-label="Second specified position" value={form.specifyTwo} onChange={(e) => update('specifyTwo', e.target.value)} placeholder="Specify..." className="mt-2" />}</div>}<label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={form.positions.includes(position)} onChange={() => toggle('positions', position)} className="h-4 w-4 rounded accent-primary" />{position}</label></div>)}</div>{errors.positions && <p role="alert" className="text-xs text-danger">{errors.positions}</p>}<Input label="Specify position..." aria-label="Specify position" value={form.customPosition} onChange={(e) => update('customPosition', e.target.value)} placeholder="Specify position..." /></fieldset>
                {field('Experience', 'experience', { placeholder: 'Enter required experience' })}
                <Textarea label="Additional Details" aria-label="Additional Details" value={form.details} onChange={(e) => update('details', e.target.value)} placeholder="Enter any additional job details" rows={5} />
                <section className="space-y-3"><h3 className="text-sm font-semibold text-primary">Upload Files</h3><label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-5 py-8 text-center hover:border-amber-300"><Upload className="h-7 w-7 text-amber-600" /><span className="mt-2 text-sm font-medium text-primary">Choose Files</span><span className="text-xs text-text-muted">Images, PDFs, documents, or videos</span><input type="file" multiple className="sr-only" aria-label="Choose Files" accept="image/*,video/*,.pdf,.doc,.docx" onChange={chooseFiles} /></label><div className="space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="flex min-w-0 items-center gap-2 break-all"><Paperclip className="h-4 w-4 shrink-0" />{file.name}</span><button type="button" aria-label={`Remove file ${file.name}`} onClick={() => setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4 text-red-500" /></button></div>)}</div></section>
                <section className="space-y-3"><h3 className="text-sm font-semibold text-primary">Link Candidates</h3><button type="button" onClick={() => setCandidateOpen(true)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-primary hover:border-amber-300"><span className="flex items-center gap-2"><Link2 className="h-4 w-4 text-amber-600" />Select Candidates</span><span className="rounded-full bg-amber-50 px-2 py-1 text-xs">{linked.length} linked</span></button></section>
              </div>
            </div>
            <div className="mt-10 flex justify-center border-t border-slate-100 pt-7"><Button type="submit" loading={submitting} aria-busy={submitting} size="lg" className="min-w-52 bg-amber-500 hover:bg-amber-600">Generate Job</Button></div>
          </form>
        </Card>
      </div>
      <CandidateModal open={candidateOpen} onClose={() => setCandidateOpen(false)} candidates={candidates} linked={linked} setLinked={setLinked} />
    </Layout>
  )
}

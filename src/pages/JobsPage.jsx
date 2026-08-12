import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import { PageSpinner } from '../components/ui/Spinner'
import { addJob, deleteJob, getJobs, updateJob } from '../services/jobService'
import { demoJobs } from '../services/demoData'
import { isSupabaseConfigured } from '../supabase/client'
import { useToast } from '../contexts/ToastContext'
import {
  ArrowUpDown, Briefcase, Edit3, Eye, Plus, Search, Trash2,
} from 'lucide-react'

const JOB_STATUSES = ['Active', 'Draft', 'Closed']
const GENDERS = ['Any', 'Male', 'Female']
const CURRENCY_CODES = ['KES', 'USD', 'KWD', 'SAR', 'AED', 'QAR']
const ACCOMMODATION_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
]
const OVERTIME_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'Available', label: 'Available' },
]
const TRANSPORT_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'Provided', label: 'Provided' },
]
const COUNTRIES = [
  'Kuwait', 'Saudi Arabia', 'UAE', 'Qatar', 'Bahrain', 'Oman',
  'Kenya', 'Jordan', 'Lebanon', 'Ethiopia', 'Philippines', 'India',
  'Nepal', 'Sri Lanka', 'Bangladesh', 'Ghana', 'Nigeria', 'Egypt',
]

const EMPTY_FORM = {
  title: '', negotiable: false, gender: 'Any', salary_min: '', salary_max: '', currency: 'KWD',
  city: '', country: '', company: '', experience: '', accommodation: '', age_range: '',
  nationality: 'Any', duty_hours: '', work_days: '', overtime: '', transport: '',
  contract_period: '', vacancies_left: 1, linked_candidates: 0, uploads: '',
  additional_details: '', description: '', requirements: '', responsibilities: '',
  schedule: '', contract_duration: '', status: 'Active',
}

const statusClasses = {
  Active: 'border-green-200 bg-green-50 text-green-700',
  Draft: 'border-amber-200 bg-amber-50 text-amber-700',
  Closed: 'border-gray-200 bg-gray-100 text-gray-600',
}

function toFinite(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeJob(job) {
  const base = { ...EMPTY_FORM, ...job }
  const explicitNeg = job && Object.prototype.hasOwnProperty.call(job, 'negotiable') ? Boolean(job.negotiable) : null
  const inferredNeg = !toFinite(job?.salary_min, 0) && !toFinite(job?.salary_max, 0)
  return {
    ...base,
    negotiable: explicitNeg === null ? inferredNeg : explicitNeg,
    vacancies_left: toFinite(job?.vacancies_left, 1),
    linked_candidates: toFinite(job?.linked_candidates, 0),
  }
}

function displaySalary(job) {
  if (!job) return ''
  if (job.negotiable) return 'Negotiable'
  const min = toFinite(job.salary_min, 0)
  const max = toFinite(job.salary_max, 0)
  if (min > 0 && max > 0) return `${min} - ${max} ${job.currency || ''}`.trim()
  if (min > 0) return `${min} ${job.currency || ''}`.trim()
  if (max > 0) return `${max} ${job.currency || ''}`.trim()
  return ''
}

function textOr(value, fallback) {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  return value
}

function genderAwareSpecified(job, field) {
  const value = job?.[field]
  if (value !== null && value !== undefined) {
    if (typeof value === 'string' && value.trim() !== '') return value
    if (typeof value !== 'string') return value
  }
  const femaleHint = (job?.gender && String(job.gender).toLowerCase().includes('female'))
    || (job?.title && String(job.title).toLowerCase().includes('female'))
  return femaleHint ? 'Not specified (Female)' : 'Not specified'
}

function PillSelect({ label, value, options, classes, onChange }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-8 max-w-32 rounded-full border px-2 text-[11px] font-medium outline-none ${classes[value] || ''}`}
    >
      {options.map((opt) => <option key={opt}>{opt}</option>)}
   </select>
  )
}

function Pill({ children, classes }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${classes || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
      {children}
   </span>
  )
}

function toServicePayload(job) {
  const orNull = (value) => (value === '' || value === undefined ? null : value)
  const numOrNull = (value, fallback) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
  }
  const data = { ...job }
  if (data.negotiable) {
    data.salary_min = null
    data.salary_max = null
  } else {
    data.salary_min = numOrNull(data.salary_min, null)
    data.salary_max = numOrNull(data.salary_max, null)
  }
  return {
    title: data.title || null,
    company: orNull(data.company),
    location: orNull(data.location),
    city: orNull(data.city),
    country: orNull(data.country),
    type: orNull(data.type),
    salary_min: data.salary_min,
    salary_max: data.salary_max,
    currency: orNull(data.currency),
    status: JOB_STATUSES.includes(data.status) ? data.status : 'Active',
    posted_date: orNull(data.posted_date),
    gender: orNull(data.gender),
    experience: orNull(data.experience),
    accommodation: orNull(data.accommodation),
    age_range: orNull(data.age_range),
    nationality: orNull(data.nationality),
    duty_hours: orNull(data.duty_hours),
    work_days: orNull(data.work_days),
    overtime: orNull(data.overtime),
    transport: orNull(data.transport),
    contract_period: orNull(data.contract_period),
    vacancies_left: numOrNull(data.vacancies_left, 1),
    linked_candidates: numOrNull(data.linked_candidates, 0),
    uploads: orNull(data.uploads),
    additional_details: orNull(data.additional_details),
    description: orNull(data.description),
    requirements: orNull(data.requirements),
    responsibilities: orNull(data.responsibilities),
    schedule: orNull(data.schedule),
    contract_duration: orNull(data.contract_duration),
  }
}

export default function JobsPage() {
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const generatedJob = location.state?.generatedJob
  const toastRef = useRef(toast)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [viewJob, setViewJob] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!isSupabaseConfigured) {
        const records = generatedJob
          ? [normalizeJob(generatedJob), ...demoJobs.map(normalizeJob)]
          : demoJobs.map(normalizeJob)
        setJobs(records)
        if (generatedJob && location.state?.exposeGeneratedJob) setViewJob(normalizeJob(generatedJob))
        setLoading(false)
        if (generatedJob) navigate('/jobs', { replace: true, state: null })
        return
      }
      try {
        const r = await getJobs({ pageSize: 100 })
        if (active) setJobs((r.data || []).map(normalizeJob))
      } catch {
        toastRef.current.error('Failed to load jobs')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [generatedJob, location.state?.exposeGeneratedJob, navigate])

  const usedCompanyOptions = useMemo(() => {
    const seen = new Map()
    for (const job of jobs) {
      const c = (job.company || '').toString().trim()
      if (c) seen.set(c, true)
    }
    return [...seen.keys()]
  }, [jobs])

  const usedCountryOptions = useMemo(() => {
    const seen = new Map()
    for (const job of jobs) {
      const c = (job.country || '').toString().trim()
      if (c) seen.set(c, true)
    }
    return [...seen.keys()]
  }, [jobs])

  const availableCount = jobs.length

  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return jobs.filter((job) => {
      const text = [job.title, job.company, job.country, job.city]
        .some((value) => `${value || ''}`.toLowerCase().includes(query))
      return text
        && (!statusFilter || job.status === statusFilter)
        && (!companyFilter || job.company === companyFilter)
        && (!countryFilter || job.country === countryFilter)
    })
  }, [jobs, search, statusFilter, companyFilter, countryFilter])

  const allVisibleSelected = visibleJobs.length > 0 && visibleJobs.every((job) => selectedIds.has(job.id))
  const someVisibleSelected = !allVisibleSelected && visibleJobs.some((job) => selectedIds.has(job.id))

  function openForm(job = null) {
    setEditingJob(job)
    setForm(job ? { ...EMPTY_FORM, ...normalizeJob(job) } : EMPTY_FORM)
    setErrors({})
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingJob(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!form.title.trim()) {
      setErrors({ title: 'Title is required' })
      return
    }
    setErrors({})
    const previous = jobs
    const trimmedTitle = form.title.trim()
    const optimistic = normalizeJob({
      ...form,
      title: trimmedTitle,
      id: editingJob?.id || `job-${Date.now()}`,
    })
    setJobs((current) => editingJob
      ? current.map((item) => (item.id === editingJob.id ? { ...optimistic, id: editingJob.id } : item))
      : [...current, optimistic])
    closeForm()
    if (!isSupabaseConfigured) {
      toastRef.current.success(editingJob ? 'Job updated!' : 'Job created!')
      return
    }
    try {
      const saved = editingJob
        ? await updateJob(editingJob.id, toServicePayload(optimistic))
        : await addJob(toServicePayload(optimistic))
      const normalized = normalizeJob({ ...optimistic, ...saved, id: saved?.id || optimistic.id })
      setJobs((current) => current.map((item) => (item.id === optimistic.id ? normalized : item)))
      toastRef.current.success(editingJob ? 'Job updated!' : 'Job created!')
    } catch {
      setJobs(previous)
      toastRef.current.error(editingJob ? 'Failed to update job' : 'Failed to create job')
    }
  }

  async function updateStatus(job, value) {
    if (!JOB_STATUSES.includes(value)) return
    const previous = jobs
    setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: value } : item)))
    if (!isSupabaseConfigured) {
      toastRef.current.success('Status updated')
      return
    }
    try {
      await updateJob(job.id, { status: value })
      toastRef.current.success('Status updated')
    } catch {
      setJobs(previous)
      toastRef.current.error('Failed to update job')
    }
  }

  async function removeJob(job) {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this job?')) return
    const previous = jobs
    setJobs((current) => current.filter((item) => item.id !== job.id))
    setSelectedIds((current) => {
      const next = new Set(current)
      next.delete(job.id)
      return next
    })
    if (!isSupabaseConfigured) {
      toastRef.current.success('Job deleted')
      return
    }
    try {
      await deleteJob(job.id)
      toastRef.current.success('Job deleted')
    } catch {
      setJobs(previous)
      toastRef.current.error('Failed to delete job')
    }
  }

  function toggleSelection(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds(new Set())
      return
    }
    const next = new Set(selectedIds)
    visibleJobs.forEach((job) => next.add(job.id))
    setSelectedIds(next)
  }

  if (loading) return <Layout title="Admin Dashboard"><PageSpinner /></Layout>

  const selectAllRefCallback = (element) => {
    if (element) element.indeterminate = someVisibleSelected
  }

  const desktopColumns = [
    { key: 'checkbox', label: '', width: 'w-8' },
    { key: 'title', label: 'Position' },
    { key: 'gender', label: 'Gender' },
    { key: 'salary', label: 'Salary' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'company', label: 'Company Name' },
    { key: 'experience', label: 'Experience' },
    { key: 'accommodation', label: 'Accommodation' },
    { key: 'age_range', label: 'Age Range' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'duty_hours', label: 'Duty Hours' },
    { key: 'work_days', label: 'Work Days' },
    { key: 'overtime', label: 'Overtime' },
    { key: 'transport', label: 'Transport' },
    { key: 'contract_period', label: 'Contract Period' },
    { key: 'vacancies', label: 'Vacancies Left' },
    { key: 'linked', label: 'Linked Candidates' },
    { key: 'uploads', label: 'Uploads' },
    { key: 'status', label: 'Status' },
    { key: 'additional', label: 'Additional Details' },
    { key: 'actions', label: 'Actions', width: 'w-28' },
  ]

  return (
    <Layout title="Admin Dashboard">
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-primary">Job Openings</h1>
          <p className="mt-2 text-base text-text-secondary">Manage available job positions and track applications</p>
       </header>

        <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="flex items-center gap-3 text-2xl font-bold leading-tight text-primary">
                <Briefcase className="h-5 w-5 text-orange-500" />
                <span>Available Positions</span>
             </h2>
              <span
                aria-label={`Available Positions: ${availableCount}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
              >
                ({availableCount})
             </span>
              <button
                type="button"
                onClick={() => openForm()}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gold-light/50 px-5 py-2 text-sm font-semibold text-primary hover:bg-cream-light"
              >
                <Plus className="h-4 w-4" />
                Add Job
             </button>
           </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  aria-label="Search jobs"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search jobs, companies, locations..."
                  className="h-10 w-full rounded-lg border-0 pl-9 pr-3 text-sm outline-none ring-1 ring-transparent focus:ring-gold-light sm:w-72"
                />
             </label>
              <select
                aria-label="Filter jobs by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-lg border-0 px-3 text-sm outline-none"
              >
                <option value="">All Status</option>
                {JOB_STATUSES.map((s) => <option key={s}>{s}</option>)}
             </select>
              <select
                aria-label="Filter jobs by company"
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
                className="h-10 rounded-lg border-0 px-3 text-sm outline-none"
              >
                <option value="">All Companies</option>
                {usedCompanyOptions.map((c) => <option key={c}>{c}</option>)}
             </select>
              <select
                aria-label="Filter jobs by country"
                value={countryFilter}
                onChange={(event) => setCountryFilter(event.target.value)}
                className="h-10 rounded-lg border-0 px-3 text-sm outline-none"
              >
                <option value="">All Countries</option>
                {usedCountryOptions.map((c) => <option key={c}>{c}</option>)}
             </select>
           </div>
         </div>

          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
            <input
              id="select-all-jobs"
              type="checkbox"
              aria-label="Select all jobs"
              checked={allVisibleSelected}
              ref={selectAllRefCallback}
              onChange={selectAllVisible}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="select-all-jobs" className="text-sm font-medium text-text-secondary">Select All</label>
         </div>

          <div aria-label="Jobs collection" className="mt-4">
            {visibleJobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">No jobs found</p>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full min-w-max border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-text-secondary">
                        {desktopColumns.map((col) => (
                          <th key={col.key} className={`px-3 py-2 font-semibold ${col.width || ''}`}>
                            {col.key === 'title' ? (
                              <span className="inline-flex items-center gap-1">{col.label}<ArrowUpDown className="h-3 w-3 inline" /></span>
                            ) : col.label}
                         </th>
                        ))}
                     </tr>
                   </thead>
                    <tbody>
                      {visibleJobs.map((job, index) => (
                        <tr key={job.id} className="border-b border-slate-100 align-top">
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              aria-label={`Select job ${job.title}`}
                              checked={selectedIds.has(job.id)}
                              onChange={() => toggleSelection(job.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                         </td>
                          <td className="px-3 py-3">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-light/20 text-xs font-bold text-primary">{index + 1}.</span>
                              <span className="font-medium leading-snug">{job.title}</span>
                           </div>
                         </td>
                          <td className="px-3 py-3 text-text-secondary">{job.gender || 'Any'}</td>
                          <td className="px-3 py-3 text-text-secondary">{displaySalary(job) || '-'}</td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.city, 'N/A')}</td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.country, 'N/A')}</td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.company, 'N/A')}</td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.experience, 'Not specified')}</td>
                          <td className="px-3 py-3 text-text-secondary">{job.accommodation || 'Not specified'}</td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.age_range, 'Not specified')}</td>
                          <td className="px-3 py-3 text-text-secondary">{job.nationality || 'Any'}</td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.duty_hours, 'Not specified')}</td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.work_days, 'Not specified')}</td>
                          <td className="px-3 py-3">
                            {(() => {
                              const value = job.overtime || genderAwareSpecified(job, 'overtime')
                              const valueLower = String(value).toLowerCase()
                              const classes = valueLower === 'available' || valueLower === 'provided'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                              return <Pill classes={classes}>{value}</Pill>
                            })()}
                         </td>
                          <td className="px-3 py-3">
                            {(() => {
                              const value = job.transport || genderAwareSpecified(job, 'transport')
                              const valueLower = String(value).toLowerCase()
                              const classes = valueLower === 'available' || valueLower === 'provided'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                              return <Pill classes={classes}>{value}</Pill>
                            })()}
                         </td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.contract_period, 'Not specified')}</td>
                          <td className="px-3 py-3">
                            <Pill classes="border-amber-200 bg-amber-50 text-amber-700">{job.vacancies_left} left</Pill>
                         </td>
                          <td className="px-3 py-3">
                            <Pill classes="border-indigo-200 bg-indigo-50 text-indigo-700">{job.linked_candidates} linked</Pill>
                         </td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.uploads, 'None')}</td>
                          <td className="px-3 py-3">
                            <PillSelect
                              label={`Status for ${job.title}`}
                              value={job.status}
                              options={JOB_STATUSES}
                              classes={statusClasses}
                              onChange={(value) => updateStatus(job, value)}
                            />
                         </td>
                          <td className="px-3 py-3 text-text-secondary">{textOr(job.additional_details, 'None')}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label={`View ${job.title}`}
                                onClick={() => setViewJob(job)}
                                className="rounded p-1 text-amber-600 hover:bg-amber-50"
                              >
                                <Eye className="h-4 w-4" />
                             </button>
                              <button
                                type="button"
                                aria-label={`Edit ${job.title}`}
                                onClick={() => openForm(job)}
                                className="rounded p-1 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit3 className="h-4 w-4" />
                             </button>
                              <button
                                type="button"
                                aria-label={`Delete ${job.title}`}
                                onClick={() => removeJob(job)}
                                className="rounded p-1 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                         </td>
                       </tr>
                      ))}
                   </tbody>
                 </table>
               </div>

                <div className="lg:hidden space-y-3">
                  {visibleJobs.map((job, index) => {
                    const overtimeValue = job.overtime || genderAwareSpecified(job, 'overtime')
                    const transportValue = job.transport || genderAwareSpecified(job, 'transport')
                    const overtimeLower = String(overtimeValue).toLowerCase()
                    const transportLower = String(transportValue).toLowerCase()
                    const overtimeClasses = overtimeLower === 'available' || overtimeLower === 'provided'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                    const transportClasses = transportLower === 'available' || transportLower === 'provided'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                    return (
                      <article key={job.id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            aria-label={`Select job ${job.title}`}
                            checked={selectedIds.has(job.id)}
                            onChange={() => toggleSelection(job.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                          />
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-light/20 text-xs font-bold text-primary">{index + 1}.</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-primary">{job.title}</p>
                            <p className="text-xs text-text-secondary">{job.gender || 'Any'} Â· {displaySalary(job) || '-'}</p>
                         </div>
                       </div>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-text-secondary">
                          <div><dt className="font-medium">City</dt><dd>{String(textOr(job.city, 'N/A'))}</dd></div>
                          <div><dt className="font-medium">Country</dt><dd>{String(textOr(job.country, 'N/A'))}</dd></div>
                          <div><dt className="font-medium">Company</dt><dd>{String(textOr(job.company, 'N/A'))}</dd></div>
                          <div><dt className="font-medium">Experience</dt><dd>{String(textOr(job.experience, 'Not specified'))}</dd></div>
                          <div><dt className="font-medium">Accommodation</dt><dd>{String(job.accommodation || 'Not specified')}</dd></div>
                          <div><dt className="font-medium">Age Range</dt><dd>{String(textOr(job.age_range, 'Not specified'))}</dd></div>
                          <div><dt className="font-medium">Nationality</dt><dd>{String(job.nationality || 'Any')}</dd></div>
                          <div><dt className="font-medium">Duty Hours</dt><dd>{String(textOr(job.duty_hours, 'Not specified'))}</dd></div>
                          <div><dt className="font-medium">Work Days</dt><dd>{String(textOr(job.work_days, 'Not specified'))}</dd></div>
                          <div><dt className="font-medium">Contract Period</dt><dd>{String(textOr(job.contract_period, 'Not specified'))}</dd></div>
                          <div><dt className="font-medium">Uploads</dt><dd>{String(textOr(job.uploads, 'None'))}</dd></div>
                          <div><dt className="font-medium">Additional Details</dt><dd>{String(textOr(job.additional_details, 'None'))}</dd></div>
                       </dl>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Pill classes={overtimeClasses}>OT: {overtimeValue}</Pill>
                          <Pill classes={transportClasses}>Tr: {transportValue}</Pill>
                          <Pill classes="border-amber-200 bg-amber-50 text-amber-700">{job.vacancies_left} left</Pill>
                          <Pill classes="border-indigo-200 bg-indigo-50 text-indigo-700">{job.linked_candidates} linked</Pill>
                          <PillSelect
                            label={`Status for ${job.title}`}
                            value={job.status}
                            options={JOB_STATUSES}
                            classes={statusClasses}
                            onChange={(value) => updateStatus(job, value)}
                          />
                       </div>
                        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            aria-label={`View ${job.title}`}
                            onClick={() => setViewJob(job)}
                            className="rounded p-1 text-amber-600 hover:bg-amber-50"
                          >
                            <Eye className="h-4 w-4" />
                         </button>
                          <button
                            type="button"
                            aria-label={`Edit ${job.title}`}
                            onClick={() => openForm(job)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="h-4 w-4" />
                         </button>
                          <button
                            type="button"
                            aria-label={`Delete ${job.title}`}
                            onClick={() => removeJob(job)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </article>
                    )
                  })}
               </div>
              </>
            )}
         </div>
       </section>
     </div>

      <Modal isOpen={showForm} onClose={closeForm} title={editingJob ? 'Edit Job' : 'New Job'} size="xl">
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <Input
            label="Job Title"
            aria-label="Job Title"
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            error={errors.title}
            required
            autoFocus
          />
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <input
              type="checkbox"
              aria-label="Negotiable"
              checked={Boolean(form.negotiable)}
              onChange={(event) => updateForm('negotiable', event.target.checked)}
            />
            Negotiable
         </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Min Salary"
              aria-label="Min Salary"
              type="number"
              value={form.salary_min}
              disabled={form.negotiable}
              onChange={(event) => updateForm('salary_min', event.target.value)}
            />
            <Input
              label="Max Salary"
              aria-label="Max Salary"
              type="number"
              value={form.salary_max}
              disabled={form.negotiable}
              onChange={(event) => updateForm('salary_max', event.target.value)}
            />
            <Select
              aria-label="Currency"
              label="Currency"
              value={form.currency}
              disabled={form.negotiable}
              onChange={(event) => updateForm('currency', event.target.value)}
              options={CURRENCY_CODES}
            />
            <Select
              aria-label="Gender"
              label="Gender"
              value={form.gender}
              onChange={(event) => updateForm('gender', event.target.value)}
              options={GENDERS}
            />
            <Input
              label="City"
              aria-label="City"
              value={form.city}
              onChange={(event) => updateForm('city', event.target.value)}
            />
            <Select
              aria-label="Country"
              label="Country"
              value={form.country}
              onChange={(event) => updateForm('country', event.target.value)}
              options={COUNTRIES}
              placeholder="Select country"
            />
            <Input
              label="Company Name"
              aria-label="Company Name"
              value={form.company}
              onChange={(event) => updateForm('company', event.target.value)}
            />
            <Input
              label="Experience"
              aria-label="Experience"
              value={form.experience}
              onChange={(event) => updateForm('experience', event.target.value)}
            />
            <Select
              aria-label="Accommodation"
              label="Accommodation"
              value={form.accommodation}
              onChange={(event) => updateForm('accommodation', event.target.value)}
              options={ACCOMMODATION_OPTIONS}
            />
            <Input
              label="Age Range"
              aria-label="Age Range"
              value={form.age_range}
              onChange={(event) => updateForm('age_range', event.target.value)}
            />
            <Input
              label="Nationality"
              aria-label="Nationality"
              value={form.nationality}
              onChange={(event) => updateForm('nationality', event.target.value)}
            />
            <Input
              label="Duty Hours"
              aria-label="Duty Hours"
              value={form.duty_hours}
              onChange={(event) => updateForm('duty_hours', event.target.value)}
            />
            <Input
              label="Work Days"
              aria-label="Work Days"
              value={form.work_days}
              onChange={(event) => updateForm('work_days', event.target.value)}
            />
            <Select
              aria-label="Overtime"
              label="Overtime"
              value={form.overtime}
              onChange={(event) => updateForm('overtime', event.target.value)}
              options={OVERTIME_OPTIONS}
            />
            <Select
              aria-label="Transport"
              label="Transport"
              value={form.transport}
              onChange={(event) => updateForm('transport', event.target.value)}
              options={TRANSPORT_OPTIONS}
            />
            <Input
              label="Contract Period"
              aria-label="Contract Period"
              value={form.contract_period}
              onChange={(event) => updateForm('contract_period', event.target.value)}
            />
            <Input
              label="Vacancies Left"
              aria-label="Vacancies Left"
              type="number"
              value={form.vacancies_left}
              onChange={(event) => updateForm('vacancies_left', event.target.value)}
            />
         </div>
          <Textarea
            label="Additional Details"
            aria-label="Additional Details"
            value={form.additional_details}
            onChange={(event) => updateForm('additional_details', event.target.value)}
            className="md:col-span-2"
          />
          <Textarea
            label="Description"
            aria-label="Description"
            value={form.description}
            onChange={(event) => updateForm('description', event.target.value)}
            className="md:col-span-2"
          />
          <Textarea
            label="Requirements"
            aria-label="Requirements"
            value={form.requirements}
            onChange={(event) => updateForm('requirements', event.target.value)}
            className="md:col-span-2"
          />
          <Select
            aria-label="Status"
            label="Status"
            value={form.status}
            onChange={(event) => updateForm('status', event.target.value)}
            options={JOB_STATUSES}
          />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit">{editingJob ? 'Update Job' : 'Create Job'}</Button>
         </div>
       </form>
     </Modal>

      <Modal isOpen={Boolean(viewJob)} onClose={() => setViewJob(null)} title="Job Details" size="lg">
        {viewJob && (
          <div className="space-y-3 text-sm">
            <h3 className="text-lg font-semibold text-primary">{viewJob.title}</h3>
            <p className="text-text-secondary">{viewJob.company || 'Company not specified'}</p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-text-muted">Gender</dt><dd>{String(viewJob.gender || 'Any')}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Salary</dt><dd>{String(displaySalary(viewJob) || '—')}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">City</dt><dd>{String(textOr(viewJob.city, 'N/A'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Country</dt><dd>{String(textOr(viewJob.country, 'N/A'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Experience</dt><dd>{String(textOr(viewJob.experience, 'Not specified'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Accommodation</dt><dd>{String(viewJob.accommodation || 'Not specified')}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Age Range</dt><dd>{String(textOr(viewJob.age_range, 'Not specified'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Nationality</dt><dd>{String(viewJob.nationality || 'Any')}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Duty Hours</dt><dd>{String(textOr(viewJob.duty_hours, 'Not specified'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Work Days</dt><dd>{String(textOr(viewJob.work_days, 'Not specified'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Overtime</dt><dd>{String(viewJob.overtime || genderAwareSpecified(viewJob, 'overtime'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Transport</dt><dd>{String(viewJob.transport || genderAwareSpecified(viewJob, 'transport'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Contract Period</dt><dd>{String(textOr(viewJob.contract_period, 'Not specified'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Vacancies Left</dt><dd>{String(viewJob.vacancies_left)}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Linked Candidates</dt><dd>{String(viewJob.linked_candidates)}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Uploads</dt><dd>{String(textOr(viewJob.uploads, 'None'))}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Status</dt><dd>{String(viewJob.status)}</dd></div>
              <div><dt className="text-xs uppercase text-text-muted">Additional Details</dt><dd>{String(textOr(viewJob.additional_details, 'None'))}</dd></div>
           </dl>
            {(viewJob.description || viewJob.requirements) && (
              <div className="space-y-2">
                {viewJob.description && (
                  <div>
                    <p className="text-xs uppercase text-text-muted">Description</p>
                    <p className="whitespace-pre-line text-text-secondary">{viewJob.description}</p>
                 </div>
                )}
                {viewJob.requirements && (
                  <div>
                    <p className="text-xs uppercase text-text-muted">Requirements</p>
                    <p className="whitespace-pre-line text-text-secondary">{viewJob.requirements}</p>
                 </div>
                )}
             </div>
            )}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button variant="ghost" onClick={() => setViewJob(null)}>Close</Button>
           </div>
         </div>
        )}
     </Modal>
   </Layout>
  )
}

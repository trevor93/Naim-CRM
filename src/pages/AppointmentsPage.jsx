import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import { PageSpinner } from '../components/ui/Spinner'
import { addAppointment, deleteAppointment, getAppointments, updateAppointment } from '../services/appointmentService'
import { demoAppointments } from '../services/demoData'
import { isSupabaseConfigured } from '../supabase/client'
import { useToast } from '../contexts/ToastContext'
import {
  AlertCircle, CalendarDays, CheckCircle2, Clock3, Edit3, Mail, MapPin,
  Phone, Plus, Search, Trash2, UserRound,
} from 'lucide-react'

const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show']
const PERSISTED_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']
const STAGES = ['Onboarding', 'Interviewing', 'Offer', 'Hired', 'Rejected']
const TYPES = ['Initial Interview', 'Follow-up', 'Medical', 'Document Collection', 'Visa', 'Other']
const EMPTY_FORM = {
  title: '', type: 'Initial Interview', candidate_id: '', date: '', time: '', location: '',
  coordinator: '', candidateEmail: '', candidatePhone: '', stage: 'Interviewing',
  status: 'Scheduled', notes: '',
}

const stageClasses = {
  Onboarding: 'border-blue-200 bg-blue-50 text-blue-700',
  Interviewing: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  Offer: 'border-purple-200 bg-purple-50 text-purple-700',
  Hired: 'border-green-200 bg-green-50 text-green-700',
  Rejected: 'border-red-200 bg-red-50 text-red-700',
}
const statusClasses = {
  Scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
  Completed: 'border-green-200 bg-green-50 text-green-700',
  Cancelled: 'border-red-200 bg-red-50 text-red-700',
  Rescheduled: 'border-amber-200 bg-amber-50 text-amber-700',
  'No Show': 'border-orange-200 bg-orange-50 text-orange-700',
}

function normalizeAppointment(appointment) {
  return {
    ...EMPTY_FORM,
    ...appointment,
    title: appointment.title || appointment.candidates?.name || 'Untitled appointment',
    type: appointment.type || 'Initial Interview',
    candidateName: appointment.candidateName || appointment.candidates?.name || appointment.title || 'Unassigned',
    candidateEmail: appointment.candidateEmail || appointment.candidates?.email || '',
    candidatePhone: appointment.candidatePhone || appointment.candidates?.phone || '',
    location: appointment.location || 'Naim Investments Office - Room A',
    coordinator: appointment.coordinator || 'Ali',
    stage: appointment.stage || 'Interviewing',
    status: appointment.status || 'Scheduled',
  }
}

function toServicePayload(appointment) {
  const payload = {
    title: appointment.title.trim(),
    date: appointment.date,
    time: appointment.time || null,
    type: appointment.type,
    status: appointment.status,
    notes: appointment.notes || null,
  }
  if (appointment.candidate_id) payload.candidate_id = appointment.candidate_id
  return payload
}

function formatAppointmentDate(value) {
  if (!value) return 'No date'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(year, month - 1, day))
}

function PillSelect({ label, value, options, classes, onChange }) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`h-8 max-w-32 rounded-full border px-2 text-[11px] font-medium outline-none ${classes[value]}`}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  )
}

export default function AppointmentsPage() {
  const toast = useToast()
  const toastRef = useRef(toast)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function loadAppointments() {
      if (!isSupabaseConfigured) {
        setAppointments(demoAppointments.map(normalizeAppointment))
        setLoading(false)
        return
      }
      try {
        const result = await getAppointments({ pageSize: 100 })
        setAppointments((result.data || []).map(normalizeAppointment))
      } catch {
        toastRef.current.error('Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [])

  const counts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      today: appointments.filter((item) => item.date === today).length,
      upcoming: appointments.filter((item) => item.date > today && !['Completed', 'Cancelled', 'No Show'].includes(item.status)).length,
      completed: appointments.filter((item) => item.status === 'Completed').length,
      noShows: appointments.filter((item) => item.status === 'No Show').length,
    }
  }, [appointments])

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase()
    return appointments.filter((item) => {
      const matchesSearch = !query || [item.title, item.type, item.candidateEmail, item.candidatePhone, item.location, item.coordinator]
        .some((value) => `${value || ''}`.toLowerCase().includes(query))
      return matchesSearch && (!dateFilter || item.date === dateFilter) && (!statusFilter || item.status === statusFilter) && (!stageFilter || item.stage === stageFilter)
    })
  }, [appointments, dateFilter, search, stageFilter, statusFilter])

  function openForm(appointment = null) {
    setEditingAppointment(appointment)
    setForm(appointment ? { ...EMPTY_FORM, ...appointment } : EMPTY_FORM)
    setErrors({})
    setShowForm(true)
  }

  async function saveAppointment(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Candidate or title is required'
    if (!form.date) nextErrors.date = 'Date is required'
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    if (isSupabaseConfigured && !PERSISTED_STATUSES.includes(form.status)) {
      toast.error('No Show is not supported by the current appointment database schema')
      return
    }

    const previous = appointments
    const optimistic = normalizeAppointment({ ...form, title: form.title.trim(), id: editingAppointment?.id || `appointment-${Date.now()}` })
    setAppointments((current) => editingAppointment
      ? current.map((item) => item.id === editingAppointment.id ? optimistic : item)
      : [...current, optimistic])
    setShowForm(false)

    if (!isSupabaseConfigured) {
      toast.success(editingAppointment ? 'Appointment updated!' : 'Appointment scheduled!')
      return
    }
    try {
      const saved = editingAppointment
        ? await updateAppointment(editingAppointment.id, toServicePayload(optimistic))
        : await addAppointment(toServicePayload(optimistic))
      const normalized = normalizeAppointment({ ...optimistic, ...saved })
      setAppointments((current) => current.map((item) => item.id === optimistic.id ? normalized : item))
      toast.success(editingAppointment ? 'Appointment updated!' : 'Appointment scheduled!')
    } catch {
      setAppointments(previous)
      toast.error(editingAppointment ? 'Failed to update appointment' : 'Failed to schedule appointment')
    }
  }

  async function updateField(appointment, field, value) {
    if (field === 'status' && isSupabaseConfigured && !PERSISTED_STATUSES.includes(value)) {
      toast.error('No Show is not supported by the current appointment database schema')
      return
    }
    const previous = appointments
    setAppointments((current) => current.map((item) => item.id === appointment.id ? { ...item, [field]: value } : item))
    if (!isSupabaseConfigured || field === 'stage') return
    try { await updateAppointment(appointment.id, { status: value }) }
    catch { setAppointments(previous); toast.error('Failed to update appointment') }
  }

  async function removeAppointment(appointment) {
    if (!confirm('Delete this appointment?')) return
    const previous = appointments
    setAppointments((current) => current.filter((item) => item.id !== appointment.id))
    setSelectedIds((current) => { const next = new Set(current); next.delete(appointment.id); return next })
    if (!isSupabaseConfigured) { toast.success('Appointment deleted'); return }
    try { await deleteAppointment(appointment.id); toast.success('Appointment deleted') }
    catch { setAppointments(previous); toast.error('Failed to delete appointment') }
  }

  function toggleSelection(id) {
    setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  if (loading) return <Layout title="Appointments"><PageSpinner /></Layout>

  const metrics = [
    { label: "Today's Appointments", value: counts.today, icon: CalendarDays, color: 'text-primary' },
    { label: 'Upcoming', value: counts.upcoming, icon: Clock3, color: 'text-blue-600' },
    { label: 'Completed', value: counts.completed, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'No Shows', value: counts.noShows, icon: AlertCircle, color: 'text-orange-600' },
  ]

  const AppointmentControls = ({ appointment }) => (
    <>
      <PillSelect label={`Stage for ${appointment.title}`} value={appointment.stage} options={STAGES} classes={stageClasses} onChange={(value) => updateField(appointment, 'stage', value)} />
      <PillSelect label={`Status for ${appointment.title}`} value={appointment.status} options={STATUSES} classes={statusClasses} onChange={(value) => updateField(appointment, 'status', value)} />
    </>
  )

  return (
    <Layout title="Admin Dashboard">
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-primary">Appointments</h1>
          <p className="mt-2 text-base text-text-secondary">Schedule and manage candidate interviews and meetings</p>
        </header>

        <section aria-label="Appointment summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <article key={label} aria-label={`${label}: ${value}`} className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-text-secondary">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="flex items-center gap-3 text-2xl font-bold leading-tight text-primary"><CalendarDays className="h-5 w-5 text-secondary" />All<br />Appointments</h2>
              <button type="button" onClick={() => openForm()} className="inline-flex h-19 items-center gap-3 rounded-xl border-2 border-gold-light/50 px-7 text-sm font-semibold text-primary hover:bg-cream-light"><Plus className="h-4 w-4" />Schedule<br />Appointment</button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input aria-label="Search appointments" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search appointments..." className="h-10 w-full rounded-lg border-0 pl-9 pr-3 text-sm outline-none ring-1 ring-transparent focus:ring-gold-light sm:w-72" /></label>
              <input type="date" aria-label="Filter appointments by date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-10 rounded-lg border-0 px-3 text-sm outline-none" />
              <select aria-label="Filter appointments by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border-0 px-3 text-sm outline-none"><option value="">All Status</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
              <select aria-label="Filter appointments by stage" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="h-10 rounded-lg border-0 px-3 text-sm outline-none"><option value="">All Stages</option>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select>
            </div>
          </div>

          <div aria-label="Appointment collection" className="mt-6 space-y-4">
            {visibleAppointments.map((appointment, index) => (
              <article key={appointment.id} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                <div className="hidden grid-cols-[auto_auto_minmax(210px,1fr)_auto] items-start gap-3 lg:grid">
                  <input type="checkbox" aria-label={`Select appointment ${appointment.title}`} checked={selectedIds.has(appointment.id)} onChange={() => toggleSelection(appointment.id)} className="mt-1 h-4 w-4 accent-primary" />
                  <span className="inline-flex h-7 min-w-8 items-center justify-center rounded bg-cream px-2 font-semibold text-primary">{index + 1}.</span>
                  <div><p className="font-bold text-primary">{appointment.title}</p><p className="text-xs text-text-secondary">{appointment.type}</p></div>
                  <div className="flex items-center gap-3"><AppointmentControls appointment={appointment} /><button type="button" aria-label={`Edit ${appointment.title}`} onClick={() => openForm(appointment)} className="text-secondary"><Edit3 className="h-4 w-4" /></button><button type="button" aria-label={`Delete ${appointment.title}`} onClick={() => removeAppointment(appointment)} className="text-red-500"><Trash2 className="h-4 w-4" /></button></div>
                </div>
                <div className="mt-5 hidden grid-cols-4 gap-x-5 gap-y-4 pl-17 text-sm text-text-secondary lg:grid">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatAppointmentDate(appointment.date)}</span>
                  <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{appointment.time || 'No time'}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{appointment.location}</span>
                  <span className="flex items-center gap-2"><UserRound className="h-4 w-4" />{appointment.coordinator}</span>
                  <a href={`mailto:${appointment.candidateEmail}`} className="flex items-center gap-2 text-blue-600"><Mail className="h-4 w-4 text-text-secondary" />{appointment.candidateEmail}</a>
                  <span></span>
                  <a href={`tel:${appointment.candidatePhone}`} className="flex items-center gap-2 text-green-600"><Phone className="h-4 w-4 text-text-secondary" />{appointment.candidatePhone}</a>
                </div>

                <div className="lg:hidden">
                  <div className="flex items-start gap-3"><input type="checkbox" aria-label={`Select appointment ${appointment.title}`} checked={selectedIds.has(appointment.id)} onChange={() => toggleSelection(appointment.id)} className="mt-1 h-4 w-4 accent-primary" /><span className="rounded bg-cream px-2 py-1 text-sm font-semibold text-primary">{index + 1}.</span><div className="min-w-0 flex-1"><p className="font-bold text-primary">{appointment.title}</p><p className="text-xs text-text-secondary">{appointment.type}</p></div></div>
                  <div className="mt-4 flex flex-wrap gap-2"><AppointmentControls appointment={appointment} /></div>
                  <div className="mt-4 grid gap-3 text-xs text-text-secondary sm:grid-cols-2"><span>{formatAppointmentDate(appointment.date)} · {appointment.time || 'No time'}</span><span>{appointment.location}</span><span>{appointment.coordinator}</span><span className="break-all">{appointment.candidateEmail} · {appointment.candidatePhone}</span></div>
                  <div className="mt-4 flex gap-4"><button type="button" aria-label={`Edit ${appointment.title}`} onClick={() => openForm(appointment)} className="text-secondary"><Edit3 className="h-4 w-4" /></button><button type="button" aria-label={`Delete ${appointment.title}`} onClick={() => removeAppointment(appointment)} className="text-red-500"><Trash2 className="h-4 w-4" /></button></div>
                </div>
              </article>
            ))}
            {visibleAppointments.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No appointments found.</p>}
          </div>
        </section>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}>
        <form onSubmit={saveAppointment} className="space-y-4" noValidate>
          <Input label="Candidate or Title" aria-label="Candidate or Title" value={form.title} error={errors.title} onChange={(event) => { setForm({ ...form, title: event.target.value }); if (event.target.value.trim()) setErrors({ ...errors, title: '' }) }} />
          <Select label="Appointment Type" aria-label="Appointment Type" value={form.type} options={TYPES} onChange={(event) => setForm({ ...form, type: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2"><Input label="Date" aria-label="Date" type="date" value={form.date} error={errors.date} onChange={(event) => { setForm({ ...form, date: event.target.value }); if (event.target.value) setErrors({ ...errors, date: '' }) }} /><Input label="Time" aria-label="Time" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2"><Input label="Location" aria-label="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /><Input label="Coordinator" aria-label="Coordinator" value={form.coordinator} onChange={(event) => setForm({ ...form, coordinator: event.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2"><Input label="Email" aria-label="Email" type="email" value={form.candidateEmail} onChange={(event) => setForm({ ...form, candidateEmail: event.target.value })} /><Input label="Phone" aria-label="Phone" value={form.candidatePhone} onChange={(event) => setForm({ ...form, candidatePhone: event.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2"><Select label="Stage" aria-label="Stage" value={form.stage} options={STAGES} onChange={(event) => setForm({ ...form, stage: event.target.value })} /><Select label="Status" aria-label="Status" value={form.status} options={STATUSES} onChange={(event) => setForm({ ...form, status: event.target.value })} /></div>
          <Textarea label="Notes" aria-label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <div className="flex justify-end gap-3 border-t border-cream pt-4"><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">{editingAppointment ? 'Update' : 'Schedule'}</Button></div>
        </form>
      </Modal>
    </Layout>
  )
}

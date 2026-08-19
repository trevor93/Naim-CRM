import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BriefcaseBusiness, CalendarDays, CalendarPlus, CheckSquare,
  Eye, Mail, Search, UserRound, UserRoundPlus, Users,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { PageSpinner } from '../components/ui/Spinner'
import EmailComposerModal from '../components/receptionist/EmailComposerModal'
import StatusMenu from '../components/receptionist/StatusMenu'
import { useToast } from '../contexts/ToastContext'
import { isSupabaseConfigured } from '../supabase/client'
import { getCandidates, updateCandidate } from '../services/candidateService'
import { getJobs } from '../services/jobService'
import { getTasks, getTaskCounts, updateTask } from '../services/taskService'
import { getAppointments } from '../services/appointmentService'
import { demoCandidates, demoJobs, demoTasks, demoTotalCandidates } from '../services/demoData'

const QUICK_ACTIONS = [
  { label: 'Create CV', to: '/cv-builder', icon: UserRound },
  { label: 'Add Candidate', to: '/candidates?add=1', icon: UserRoundPlus },
  { label: 'View Candidate', to: '/candidates', icon: Search },
  { label: 'Schedule Appointment', to: '/appointments?add=1', icon: CalendarPlus },
  { label: 'View Tasks', to: '/tasks', icon: Eye },
]

const CANDIDATE_STATUSES = [
  { value: 'Onboarding', dotClass: 'bg-blue-400', badgeClass: 'border border-blue-200 bg-blue-100 text-blue-700' },
  { value: 'Interviewing', dotClass: 'bg-yellow-400', badgeClass: 'border border-yellow-200 bg-yellow-100 text-yellow-700' },
  { value: 'Offer', dotClass: 'bg-purple-500', badgeClass: 'border border-purple-200 bg-purple-100 text-purple-700' },
  { value: 'Hired', dotClass: 'bg-green-400', badgeClass: 'border border-green-200 bg-green-100 text-green-700' },
  { value: 'Rejected', dotClass: 'bg-red-400', badgeClass: 'border border-red-200 bg-red-100 text-red-700' },
]

const TASK_STATUSES = [
  { value: 'Pending', dotClass: 'bg-yellow-300', badgeClass: 'border border-yellow-200 bg-yellow-50 text-yellow-700' },
  { value: 'In Progress', dotClass: 'bg-blue-300', badgeClass: 'border border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'Completed', dotClass: 'bg-green-300', badgeClass: 'border border-green-200 bg-green-50 text-green-700' },
  { value: 'Overdue', dotClass: 'bg-red-300', badgeClass: 'border border-red-200 bg-red-50 text-red-700' },
]

const JOB_STATUS_STYLES = {
  Active: 'border border-green-200 bg-green-50 text-green-700',
  Closed: 'border border-gray-200 bg-gray-100 text-gray-700',
  Draft: 'border border-slate-200 bg-slate-100 text-slate-700',
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?'
}

function SectionHeader({ icon: Icon, title, count, actionLabel, onAction }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {title}
        {count && <span className="text-xs font-normal text-text-secondary">{count}</span>}
      </h2>
      {actionLabel && (
        <button type="button" onClick={onAction} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover">
          {actionLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default function ReceptionistViewPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState([])
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [jobs, setJobs] = useState([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [tasks, setTasks] = useState([])
  const [totalAppointments, setTotalAppointments] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [taskFilter, setTaskFilter] = useState('')
  const [emailOpen, setEmailOpen] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      if (!isSupabaseConfigured) {
        setCandidates(demoCandidates.slice(0, 5))
        setTotalCandidates(demoTotalCandidates)
        setJobs(demoJobs.slice(0, 2))
        setTotalJobs(demoJobs.length)
        setTasks(demoTasks)
        setTotalAppointments(1)
        setPendingTasks(demoTasks.filter((task) => task.status === 'Pending').length)
        setLoading(false)
        return
      }
      try {
        const [candidateResult, jobResult, taskResult, appointmentResult, counts] = await Promise.all([
          getCandidates({ pageSize: 5 }),
          getJobs({ pageSize: 2 }),
          getTasks({ pageSize: 10 }),
          getAppointments({ pageSize: 1 }),
          getTaskCounts(),
        ])
        setCandidates(candidateResult.data || [])
        setTotalCandidates(candidateResult.count || 0)
        setJobs(jobResult.data || [])
        setTotalJobs(jobResult.count || 0)
        setTasks(taskResult.data || [])
        setTotalAppointments(appointmentResult.count || 0)
        setPendingTasks(counts.Pending || 0)
      } catch {
        toast.error('Failed to load receptionist dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [toast])

  const visibleTasks = useMemo(
    () => tasks.filter((task) => !taskFilter || task.status === taskFilter).slice(0, 3),
    [taskFilter, tasks],
  )

  async function changeCandidateStatus(candidateId, value) {
    const previous = candidates
    setCandidates((current) => current.map((candidate) => candidate.id === candidateId ? { ...candidate, stage: value, status: value } : candidate))
    if (!isSupabaseConfigured) return
    try {
      await updateCandidate(candidateId, { stage: value, status: value })
    } catch {
      setCandidates(previous)
      toast.error('Failed to update candidate status')
    }
  }

  async function changeTaskStatus(taskId, value) {
    const previous = tasks
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status: value } : task))
    setPendingTasks((current) => {
      const oldStatus = previous.find((task) => task.id === taskId)?.status
      if (oldStatus === 'Pending' && value !== 'Pending') return Math.max(0, current - 1)
      if (oldStatus !== 'Pending' && value === 'Pending') return current + 1
      return current
    })
    if (!isSupabaseConfigured) return
    try {
      await updateTask(taskId, { status: value })
    } catch {
      setTasks(previous)
      toast.error('Failed to update task status')
    }
  }

  if (loading) return <Layout title="Receptionist View"><PageSpinner /></Layout>

  const metrics = [
    { label: 'Total Candidates', value: totalCandidates, icon: Users },
    { label: 'Total Jobs', value: totalJobs, icon: BriefcaseBusiness },
    { label: 'Total Appointments', value: totalAppointments, icon: CalendarDays },
    { label: 'Pending Tasks', value: pendingTasks, icon: CheckSquare },
  ]

  return (
    <Layout title="Receptionist View">
      <div className="mx-auto max-w-[1260px] space-y-6 pb-8 animate-fade-in">
        <header>
          <h1 className="text-3xl font-bold text-primary">Receptionist View</h1>
          <p className="mt-2 text-base text-text-secondary">Manage daily reception activities and candidate interactions</p>
        </header>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-10">
          <h2 className="mb-5 text-xl font-bold text-primary">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button key={action.label} type="button" onClick={() => navigate(action.to)} className="flex min-h-24 items-center justify-center gap-3 rounded-xl border-2 border-gold-light/60 bg-white px-4 py-4 text-sm font-bold text-primary transition-colors hover:bg-cream-warm">
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />{action.label}
                </button>
              )
            })}
            <button type="button" onClick={() => setEmailOpen(true)} className="flex min-h-24 items-center justify-center gap-3 rounded-xl border-2 border-gold-light/60 bg-white px-4 py-4 text-sm font-bold text-primary transition-colors hover:bg-cream-warm">
              <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />Send Email
            </button>
          </div>
        </section>

        <section aria-label="Receptionist summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <article key={metric.label} className="rounded-2xl border border-gray-100 bg-white px-10 py-9 shadow-card">
                <div className="flex items-center justify-between text-primary">
                  <p className="text-sm font-medium">{metric.label}</p><Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-bold text-primary">{metric.value}</p>
                <p className="mt-1 text-xs text-text-secondary">Live data</p>
              </article>
            )
          })}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-10">
          <SectionHeader icon={Users} title="Recent Candidates" count={`(${totalCandidates})`} actionLabel="View All Candidates" onAction={() => navigate('/candidates')} />
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <article key={candidate.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-gold-light/40 bg-cream-warm px-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary">{index + 1}.</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">{initials(candidate.name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-primary">{candidate.name}</p>
                  <p className="truncate text-xs text-text-secondary">{candidate.position || 'N/A'} • {candidate.phone || 'N/A'} • {candidate.country || candidate.country_applying_to || 'N/A'}</p>
                  <p className="truncate text-xs text-text-secondary">Passport: {candidate.passport_number || 'N/A'} • Salary: {candidate.salary || 'N/A'}</p>
                </div>
                <StatusMenu ariaLabel={`Candidate status for ${candidate.name}`} value={candidate.stage || candidate.status || 'Onboarding'} options={CANDIDATE_STATUSES} onChange={(value) => changeCandidateStatus(candidate.id, value)} />
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-10">
          <SectionHeader icon={BriefcaseBusiness} title="Recent Jobs" count={`(${totalJobs})`} actionLabel="View All Jobs" onAction={() => navigate('/jobs')} />
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <article key={job.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-gold-light/40 bg-cream-warm px-3 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary">{index + 1}.</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white"><BriefcaseBusiness className="h-4 w-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-primary">{job.title}</p>
                  <p className="truncate text-xs text-text-secondary">{job.company || 'N/A'} • {job.location || 'N/A'} • {job.type || 'N/A'}</p>
                  <p className="truncate text-xs text-text-secondary">{job.salary_min === job.salary_max ? `${job.salary_min || 'N/A'} ${job.currency || ''}` : `${job.salary_min || 'N/A'} - ${job.salary_max || 'N/A'} ${job.currency || ''}`} • Posted {job.posted_date ? new Date(job.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${JOB_STATUS_STYLES[job.status] || 'border border-gray-200 bg-gray-100 text-gray-700'}`}>{job.status || 'Draft'}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-10">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-primary"><CheckSquare className="h-5 w-5" aria-hidden="true" />My Task Progress</h2>
              <p className="mt-3 text-sm text-text-secondary">Summary of tasks assigned to you. Status can be changed directly.</p>
            </div>
            <label className="sr-only" htmlFor="task-filter">Filter tasks by status</label>
            <select id="task-filter" aria-label="Filter tasks by status" value={taskFilter} onChange={(event) => setTaskFilter(event.target.value)} className="min-w-44 rounded-lg border border-transparent bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none">
              <option value="">All Statuses</option>
              {TASK_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.value}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            {visibleTasks.map((task, index) => (
              <article key={task.id} className="flex min-w-0 items-center gap-3 rounded-lg bg-white px-4 py-5 shadow-card">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-text-primary">{task.title}</p>
                  <p className="truncate text-sm text-text-secondary">Assigned To: {task.assignee || 'Unassigned'}</p>
                </div>
                <StatusMenu ariaLabel={`Task status for ${task.title}`} value={task.status || 'Pending'} options={TASK_STATUSES} onChange={(value) => changeTaskStatus(task.id, value)} />
              </article>
            ))}
            {visibleTasks.length === 0 && <p className="py-8 text-center text-sm text-text-secondary">No tasks match this status.</p>}
          </div>
        </section>
      </div>

      <EmailComposerModal isOpen={emailOpen} onClose={() => setEmailOpen(false)} onSend={() => { toast.success('Email sent successfully'); setEmailOpen(false) }} />
    </Layout>
  )
}

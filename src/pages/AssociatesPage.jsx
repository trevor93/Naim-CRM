import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import AssociateQuickActions from '../components/associates/AssociateQuickActions'
import RecentCandidatesCard from '../components/associates/RecentCandidatesCard'
import RecentJobsCard from '../components/associates/RecentJobsCard'
import AssociatesTasksCard from '../components/associates/AssociatesTasksCard'
import { useToast } from '../contexts/ToastContext'
import { demoCandidates, demoJobs, demoTasks, demoTotalCandidates } from '../services/demoData'
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, matchOptionLabel } from '../utils/taskOptions'

const candidateSeed = demoCandidates.map((candidate) => ({ ...candidate, company: 'No company', salary: 'Ksh 1,100.00', phone: '+000-000-0000', stage: 'Onboarding' }))
const jobSeed = demoJobs.map((job) => ({ ...job, meta: job.id === 'j1' ? 'N/A - N/A SAR  ·  Posted 9/22/2025' : '350 - 450 KWD  ·  Posted 1/7/2024' }))
const details = { t1: 'Confirm offer details for Mary Wanjiru', t2: 'Book appointment at approved medical center' }
// The shared demo tasks store priorities in caps; the pills read as Title Case.
const taskSeed = demoTasks.map((task) => ({
  ...task,
  details: details[task.id] || '',
  priority: matchOptionLabel(TASK_PRIORITY_OPTIONS, task.priority),
  status: matchOptionLabel(TASK_STATUS_OPTIONS, task.status),
}))

export default function AssociatesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [candidates, setCandidates] = useState(candidateSeed)
  const [tasks, setTasks] = useState(taskSeed)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [priorityFilter, setPriorityFilter] = useState('All Priority')

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    // The filter options are upper-cased in the template while the pills are
    // Title Case, so both sides are lowered before comparing.
    const wantedStatus = statusFilter === 'All Status' ? null : statusFilter.toLowerCase()
    const wantedPriority = priorityFilter === 'All Priority' ? null : priorityFilter.toLowerCase()
    return tasks.filter((task) => {
      const matchesSearch = !query || [task.title, task.details, task.assignee, task.category].some((value) => value?.toLowerCase().includes(query))
      return matchesSearch && (!wantedStatus || task.status?.toLowerCase() === wantedStatus) && (!wantedPriority || task.priority?.toLowerCase() === wantedPriority)
    })
  }, [tasks, search, statusFilter, priorityFilter])
  const allSelected = filteredTasks.length > 0 && filteredTasks.every((task) => selectedIds.has(task.id))
  // Derived from the task list rather than the id set, so an id left behind by an
  // archived task can never inflate the count on the bulk bar.
  const selectedTasks = useMemo(() => tasks.filter((task) => selectedIds.has(task.id)), [tasks, selectedIds])

  function updateStage(id, stage) { setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, stage } : candidate)) }
  function updateTask(id, field, value) { setTasks((current) => current.map((task) => task.id === id ? { ...task, [field]: value } : task)) }
  function toggleTask(id) { setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  function toggleAll() { setSelectedIds((current) => allSelected ? new Set([...current].filter((id) => !filteredTasks.some((task) => task.id === id))) : new Set([...current, ...filteredTasks.map((task) => task.id)])) }
  function deleteSelected() {
    const count = selectedTasks.length
    if (!count) return
    const plural = count === 1 ? '' : 's'
    if (!window.confirm(`Delete ${count} selected task${plural}? This cannot be undone.`)) return
    const doomedIds = new Set(selectedTasks.map((task) => task.id))
    setTasks((current) => current.filter((task) => !doomedIds.has(task.id)))
    setSelectedIds((current) => new Set([...current].filter((id) => !doomedIds.has(id))))
    toast.success(`${count} task${plural} deleted`)
  }
  function archiveCompleted() {
    const completed = tasks.filter((task) => task.status === 'Completed')
    if (!completed.length) return toast.info('There are no completed tasks to archive.')
    if (!window.confirm(`Archive ${completed.length} completed task${completed.length === 1 ? '' : 's'}?`)) return
    const archivedIds = new Set(completed.map((task) => task.id))
    setTasks((current) => current.filter((task) => !archivedIds.has(task.id)))
    setSelectedIds((current) => new Set([...current].filter((id) => !archivedIds.has(id))))
    toast.success('Completed tasks archived')
  }

  return (
    <Layout title="Admin Dashboard">
      <div id="associates-task-management-page" className="mx-auto max-w-[1260px] animate-fade-in px-2 pb-8 pt-6 sm:px-4 lg:px-6">
        <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div><h1 className="text-2xl font-bold text-primary">Associates Task Management</h1><p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">Task management system for associates with full task lifecycle tracking</p></div>
          <AssociateQuickActions onAddCandidate={() => navigate('/cv-builder')} onViewCandidates={() => navigate('/candidates')} onBookAppointment={() => navigate('/appointments?action=book')} onViewJobs={() => navigate('/jobs')} />
        </header>
        <div className="space-y-6">
          <RecentCandidatesCard candidates={candidates} total={demoTotalCandidates} onViewAll={() => navigate('/candidates')} onStageChange={updateStage} />
          <RecentJobsCard jobs={jobSeed} onViewAll={() => navigate('/jobs')} />
          <AssociatesTasksCard tasks={filteredTasks} selectedIds={selectedIds} selectedCount={selectedTasks.length} allSelected={allSelected} search={search} statusFilter={statusFilter} priorityFilter={priorityFilter} onSearch={setSearch} onStatusFilter={setStatusFilter} onPriorityFilter={setPriorityFilter} onToggle={toggleTask} onToggleAll={toggleAll} onUpdate={updateTask} onArchive={archiveCompleted} onDeleteSelected={deleteSelected} />
        </div>
      </div>
    </Layout>
  )
}

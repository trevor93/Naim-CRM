import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import AssociateQuickActions from '../components/associates/AssociateQuickActions'
import RecentCandidatesCard from '../components/associates/RecentCandidatesCard'
import RecentJobsCard from '../components/associates/RecentJobsCard'
import AssociatesTasksCard from '../components/associates/AssociatesTasksCard'
import { useToast } from '../contexts/ToastContext'
import { demoCandidates, demoJobs, demoTasks, demoTotalCandidates } from '../services/demoData'

const candidateSeed = demoCandidates.map((candidate) => ({ ...candidate, company: 'No company', salary: 'Ksh 1,100.00', phone: '+000-000-0000', stage: 'Onboarding' }))
const jobSeed = demoJobs.map((job) => ({ ...job, meta: job.id === 'j1' ? 'N/A - N/A SAR  ·  Posted 9/22/2025' : '350 - 450 KWD  ·  Posted 1/7/2024' }))
const details = { t1: 'Confirm offer details for Mary Wanjiru', t2: 'Book appointment at approved medical center' }
const taskSeed = demoTasks.map((task) => ({ ...task, details: details[task.id] || '', priority: task.priority.toUpperCase() }))

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
    return tasks.filter((task) => {
      const matchesSearch = !query || [task.title, task.details, task.assignee, task.category].some((value) => value?.toLowerCase().includes(query))
      return matchesSearch && (statusFilter === 'All Status' || task.status === statusFilter) && (priorityFilter === 'All Priority' || task.priority === priorityFilter)
    })
  }, [tasks, search, statusFilter, priorityFilter])
  const allSelected = filteredTasks.length > 0 && filteredTasks.every((task) => selectedIds.has(task.id))

  function updateStage(id, stage) { setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, stage } : candidate)) }
  function updateTask(id, field, value) { setTasks((current) => current.map((task) => task.id === id ? { ...task, [field]: value } : task)) }
  function toggleTask(id) { setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  function toggleAll() { setSelectedIds((current) => allSelected ? new Set([...current].filter((id) => !filteredTasks.some((task) => task.id === id))) : new Set([...current, ...filteredTasks.map((task) => task.id)])) }
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
          <AssociateQuickActions onAddCandidate={() => navigate('/candidates?action=add')} onViewCandidates={() => navigate('/candidates')} onBookAppointment={() => navigate('/appointments?action=book')} onViewJobs={() => navigate('/jobs')} />
        </header>
        <div className="space-y-6">
          <RecentCandidatesCard candidates={candidates} total={demoTotalCandidates} onViewAll={() => navigate('/candidates')} onStageChange={updateStage} />
          <RecentJobsCard jobs={jobSeed} onViewAll={() => navigate('/jobs')} />
          <AssociatesTasksCard tasks={filteredTasks} selectedIds={selectedIds} allSelected={allSelected} search={search} statusFilter={statusFilter} priorityFilter={priorityFilter} onSearch={setSearch} onStatusFilter={setStatusFilter} onPriorityFilter={setPriorityFilter} onToggle={toggleTask} onToggleAll={toggleAll} onUpdate={updateTask} onArchive={archiveCompleted} />
        </div>
      </div>
    </Layout>
  )
}

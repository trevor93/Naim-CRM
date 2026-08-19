import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSearchQueryParam from '../hooks/useSearchQueryParam'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import DotSelect from '../components/ui/DotSelect'
import { PageSpinner } from '../components/ui/Spinner'
import { addTask, archiveTasks, deleteCompletedTasksBefore, deleteTask, getTasks, updateTask } from '../services/taskService'
import { demoTasks } from '../services/demoData'
import { isSupabaseConfigured } from '../supabase/client'
import { useToast } from '../contexts/ToastContext'
import { TASK_CATEGORY_OPTIONS, TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, matchOptionLabel } from '../utils/taskOptions'
import {
  AlertCircle, Archive, CalendarDays, CheckCircle2, CheckSquare,
  CircleDot, Clock3, Plus, Save, Search, Settings, SquarePen, Trash2, TriangleAlert, UserRound,
} from 'lucide-react'

const STATUSES = TASK_STATUS_OPTIONS.map((option) => option.label)
const PRIORITIES = TASK_PRIORITY_OPTIONS.map((option) => option.label)
const EMPTY_FORM = { title: '', description: '', assignee: '', created_by: 'Admin', due_date: '', priority: 'Medium', category: '', status: 'Pending' }

const AUTO_DELETE_STORAGE_KEY = 'tasks:autoDeleteSettings'
const AUTO_DELETE_DURATIONS = [
  { value: '7', label: '7 days (1 week)' },
  { value: '30', label: '30 days (1 month)' },
  { value: '60', label: '60 days (2 months)' },
  { value: '90', label: '90 days (3 months)' },
]

// The template's Priority dropdown offers High/Medium/Low only, so the retired
// "Urgent" value folds onto High instead of becoming a pill nothing can restore.
const RETIRED_PRIORITIES = { urgent: 'High' }

function getStoredAutoDeleteSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTO_DELETE_STORAGE_KEY))
    const days = AUTO_DELETE_DURATIONS.some((duration) => duration.value === stored?.days) ? stored.days : '30'
    // Auto-deletion stays off until the user ticks the box and runs it, which is
    // what the green dot on the Auto-Delete button reports.
    return { enabled: stored?.enabled === true, days }
  } catch {
    return { enabled: false, days: '30' }
  }
}

function normalizeTask(task) {
  const priority = `${task.priority || ''}`.toLowerCase()
  return {
    ...EMPTY_FORM,
    ...task,
    description: task.description || task.details || '',
    assignee: task.assignee || 'Unassigned',
    created_by: task.created_by || 'Admin',
    priority: RETIRED_PRIORITIES[priority] || matchOptionLabel(TASK_PRIORITY_OPTIONS, task.priority) || 'Medium',
    category: matchOptionLabel(TASK_CATEGORY_OPTIONS, task.category) || 'Follow-up',
    status: matchOptionLabel(TASK_STATUS_OPTIONS, task.status) || 'Pending',
  }
}

/** A completed task with no timestamp is dated by its due date, the only age it has. */
function completionDate(task) {
  return task.completed_at || task.updated_at || task.due_date || ''
}

function SortHeader({ label, field, sort, onSort }) {
  const active = sort.field === field
  return <button type="button" aria-label={`Sort by ${label}`} data-direction={active ? sort.direction : 'none'} onClick={() => onSort(field)} className="inline-flex items-center gap-1 font-semibold text-primary">{label}<span aria-hidden="true">{active ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span></button>
}

const FILTER_SELECT = 'h-10 rounded-lg border-0 px-3 text-sm text-text-primary outline-none ring-1 ring-transparent focus:ring-2 focus:ring-primary'
const FIELD_LABEL = 'mb-2 block text-sm font-semibold text-primary'
const FIELD_CONTROL = 'h-12 w-full rounded-xl bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gold-light'

function FieldLabel({ htmlFor, children, required }) {
  return <label htmlFor={htmlFor} className={FIELD_LABEL}>{children}{required && <span aria-hidden="true"> *</span>}</label>
}

export default function TasksPage() {
  const toast = useToast()
  const toastRef = useRef(toast)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useSearchQueryParam()
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [sort, setSort] = useState({ field: 'due_date', direction: 'asc' })
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [showAutoDelete, setShowAutoDelete] = useState(false)
  const [autoDeleteSettings, setAutoDeleteSettings] = useState(getStoredAutoDeleteSettings)
  const [autoDeleteDraft, setAutoDeleteDraft] = useState(autoDeleteSettings)
  const [autoDeleteBusy, setAutoDeleteBusy] = useState(false)
  const autoSweptRef = useRef(false)

  const loadTasks = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setTasks(demoTasks.map(normalizeTask))
      setLoading(false)
      return
    }
    try {
      const result = await getTasks({ pageSize: 100 })
      setTasks((result.data || []).map(normalizeTask))
    } catch {
      toastRef.current.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const counts = useMemo(() => ({
    Total: tasks.length,
    Pending: tasks.filter((task) => task.status === 'Pending').length,
    'In Progress': tasks.filter((task) => task.status === 'In Progress').length,
    Completed: tasks.filter((task) => task.status === 'Completed').length,
    Overdue: tasks.filter((task) => task.status === 'Overdue').length,
  }), [tasks])

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = tasks.filter((task) => {
      const matchesSearch = !query || [task.title, task.description, task.assignee, task.category].some((value) => `${value || ''}`.toLowerCase().includes(query))
      return matchesSearch && (!statusFilter || task.status === statusFilter) && (!priorityFilter || task.priority === priorityFilter)
    })
    return [...filtered].sort((left, right) => {
      const leftValue = sort.field === 'due_date' ? new Date(left.due_date || '9999-12-31').getTime() : `${left[sort.field] || ''}`.toLowerCase()
      const rightValue = sort.field === 'due_date' ? new Date(right.due_date || '9999-12-31').getTime() : `${right[sort.field] || ''}`.toLowerCase()
      const comparison = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [priorityFilter, search, sort, statusFilter, tasks])

  const allSelected = visibleTasks.length > 0 && visibleTasks.every((task) => selectedIds.has(task.id))
  const completedIds = tasks.filter((task) => task.status === 'Completed').map((task) => task.id)

  function openForm(task = null) {
    setEditingTask(task)
    setForm(task ? { ...EMPTY_FORM, ...task } : EMPTY_FORM)
    setFormErrors({})
    setShowForm(true)
  }

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => (current[field] ? { ...current, [field]: '' } : current))
  }

  async function saveTask(event) {
    event.preventDefault()
    const errors = {}
    if (!form.title.trim()) errors.title = 'Task title is required'
    if (!form.assignee.trim()) errors.assignee = 'Assigned to is required'
    if (!form.due_date) errors.due_date = 'Due date is required'
    if (Object.keys(errors).length) { setFormErrors(errors); return }

    const previous = tasks
    const next = {
      ...form,
      title: form.title.trim(),
      assignee: form.assignee.trim(),
      category: form.category || 'Follow-up',
      completed_at: form.status === 'Completed' ? (form.completed_at || new Date().toISOString()) : null,
    }
    if (editingTask) setTasks((current) => current.map((task) => task.id === editingTask.id ? { ...task, ...next } : task))
    else setTasks((current) => [...current, { ...next, id: `task-${Date.now()}` }])
    setShowForm(false)
    if (!isSupabaseConfigured) { toast.success(editingTask ? 'Task updated!' : 'Task created!'); return }
    try {
      if (editingTask) await updateTask(editingTask.id, next)
      else {
        const created = await addTask(next)
        setTasks((current) => current.map((task) => task.id.toString().startsWith('task-') ? normalizeTask(created) : task))
      }
      toast.success(editingTask ? 'Task updated!' : 'Task created!')
    } catch {
      setTasks(previous)
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task')
    }
  }

  async function updateField(id, field, value) {
    const previous = tasks
    const updates = { [field]: value }
    if (field === 'status') updates.completed_at = value === 'Completed' ? new Date().toISOString() : null
    setTasks((current) => current.map((task) => task.id === id ? { ...task, ...updates } : task))
    if (!isSupabaseConfigured) return
    try { await updateTask(id, updates) }
    catch { setTasks(previous); toast.error('Failed to update task') }
  }

  async function removeTask(task) {
    if (!confirm('Delete this task?')) return
    const previous = tasks
    setTasks((current) => current.filter((item) => item.id !== task.id))
    setSelectedIds((current) => { const next = new Set(current); next.delete(task.id); return next })
    if (!isSupabaseConfigured) { toast.success('Task deleted'); return }
    try { await deleteTask(task.id); toast.success('Task deleted') }
    catch { setTasks(previous); toast.error('Delete failed') }
  }

  function toggleTask(id) {
    setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allSelected) visibleTasks.forEach((task) => next.delete(task.id))
      else visibleTasks.forEach((task) => next.add(task.id))
      return next
    })
  }

  async function archiveCompleted() {
    if (!completedIds.length || !confirm('Archive all completed tasks?')) return
    const previous = tasks
    setTasks((current) => current.filter((task) => !completedIds.includes(task.id)))
    setSelectedIds((current) => { const next = new Set(current); completedIds.forEach((id) => next.delete(id)); return next })
    if (!isSupabaseConfigured) { toast.success('Completed tasks archived'); return }
    try { await archiveTasks(completedIds); toast.success('Completed tasks archived') }
    catch { setTasks(previous); toast.error('Failed to archive completed tasks') }
  }

  function applySort(field) {
    setSort((current) => ({ field, direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc' }))
  }

  function openAutoDeleteSettings() {
    setAutoDeleteDraft(autoDeleteSettings)
    setShowAutoDelete(true)
  }

  const sweepCompletedTasks = useCallback(async (settings) => {
    const cutoff = new Date(Date.now() - Number(settings.days) * 86400000).toISOString()
    if (isSupabaseConfigured) return deleteCompletedTasksBefore(cutoff)
    // Demo mode holds the tasks in component state, so the sweep runs here.
    let deleted = 0
    setTasks((current) => {
      const kept = current.filter((task) => {
        const expired = task.status === 'Completed' && completionDate(task) && completionDate(task) < cutoff
        return !expired
      })
      deleted = current.length - kept.length
      return deleted ? kept : current
    })
    return deleted
  }, [])

  async function executeAutoDelete() {
    const settings = { ...autoDeleteDraft }
    setAutoDeleteBusy(true)
    try {
      localStorage.setItem(AUTO_DELETE_STORAGE_KEY, JSON.stringify(settings))
      setAutoDeleteSettings(settings)
      autoSweptRef.current = true
      if (!settings.enabled) {
        setShowAutoDelete(false)
        toast.success('Task auto-deletion disabled')
        return
      }
      const deletedCount = await sweepCompletedTasks(settings)
      setShowAutoDelete(false)
      if (isSupabaseConfigured) await loadTasks()
      toast.success(deletedCount
        ? `Auto-deletion active — ${deletedCount} completed task(s) deleted`
        : `Auto-deletion active — no completed task is older than ${settings.days} days yet`)
    } catch {
      toast.error('Failed to execute task auto-deletion')
    } finally {
      setAutoDeleteBusy(false)
    }
  }

  // While the setting is on the sweep also runs when the page opens, so
  // auto-deletion keeps working without the user re-running it by hand.
  useEffect(() => {
    if (loading || autoSweptRef.current || !autoDeleteSettings.enabled) return
    autoSweptRef.current = true
    sweepCompletedTasks(autoDeleteSettings)
      .then((deletedCount) => {
        if (!deletedCount) return
        toastRef.current.success(`Auto-delete removed ${deletedCount} completed task(s)`)
        if (isSupabaseConfigured) loadTasks()
      })
      .catch(() => toastRef.current.error('Auto-delete sweep failed'))
  }, [autoDeleteSettings, loadTasks, loading, sweepCompletedTasks])

  if (loading) return <Layout title="Tasks"><PageSpinner /></Layout>

  const metrics = [
    { label: 'Total', value: counts.Total, icon: CheckSquare, color: 'text-primary' },
    { label: 'Pending', value: counts.Pending, icon: CircleDot, color: 'text-secondary' },
    { label: 'In Progress', value: counts['In Progress'], icon: Clock3, color: 'text-blue-600' },
    { label: 'Completed', value: counts.Completed, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Overdue', value: counts.Overdue, icon: AlertCircle, color: 'text-red-600' },
  ]

  function rowControls(task) {
    return [
      <DotSelect key="priority" label={`Priority for ${task.title}`} value={task.priority} options={TASK_PRIORITY_OPTIONS} menuClassName="w-32" onChange={(value) => updateField(task.id, 'priority', value)} />,
      <DotSelect key="category" label={`Category for ${task.title}`} value={task.category} options={TASK_CATEGORY_OPTIONS} menuClassName="w-44" onChange={(value) => updateField(task.id, 'category', value)} />,
      <DotSelect key="status" label={`Status for ${task.title}`} value={task.status} options={TASK_STATUS_OPTIONS} menuClassName="w-40" onChange={(value) => updateField(task.id, 'status', value)} />,
    ]
  }

  // `lineBox` matches the height of the title's first text line, so the icons
  // centre on that line rather than on the whole (often two-line) title block.
  function rowActions(task, lineBox = 'h-5') {
    return (
      <div className={`flex ${lineBox} shrink-0 items-center gap-8`}>
        <button type="button" aria-label={`Edit ${task.title}`} onClick={() => openForm(task)} className="text-blue-500 transition-colors hover:text-blue-600"><SquarePen className="h-4 w-4" /></button>
        <button type="button" aria-label={`Delete ${task.title}`} onClick={() => removeTask(task)} className="text-red-500 transition-colors hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
      </div>
    )
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-primary">Tasks</h1><p className="mt-2 text-base text-text-secondary">Manage and track all tasks across your recruitment process</p></div>
          <button
            type="button"
            onClick={openAutoDeleteSettings}
            title={autoDeleteSettings.enabled ? 'Auto-deletion is active' : 'Auto-deletion is off'}
            className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-gold-light/50 bg-white px-6 text-sm font-semibold text-primary hover:bg-cream-light"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Auto-Delete
            {autoDeleteSettings.enabled && (
              <>
                <span data-testid="auto-delete-active" className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                <span className="sr-only">(active)</span>
              </>
            )}
          </button>
        </header>

        <section aria-label="Task summary" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {metrics.map(({ label, value, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-gray-100 bg-white px-6 py-7 shadow-card"><div className="flex items-center justify-between"><div><p className="text-sm text-text-secondary">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div><Icon className={`h-8 w-8 ${color}`} /></div></article>)}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-card sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3"><h2 className="flex items-center gap-2 text-xl font-bold text-primary"><CheckSquare className="h-5 w-5" />All Tasks</h2><button type="button" onClick={() => openForm()} className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-gold-light/50 px-6 text-sm font-semibold text-primary hover:bg-cream-light"><Plus className="h-4 w-4" />Add Task</button></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input aria-label="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, assignees, categories..." className="h-10 w-full min-w-0 rounded-lg border-0 pl-9 pr-3 text-sm outline-none ring-1 ring-transparent focus:ring-gold-light sm:w-80" /></label>
              <select aria-label="Filter tasks by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={FILTER_SELECT}><option value="">All Status</option>{STATUSES.map((status) => <option key={status} value={status}>{status.toUpperCase()}</option>)}</select>
              <select aria-label="Filter tasks by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className={FILTER_SELECT}><option value="">All Priority</option>{PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority.toUpperCase()}</option>)}</select>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><label className="inline-flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox" aria-label="Select all tasks" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />Select All</label><button type="button" disabled={!completedIds.length} onClick={archiveCompleted} className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-gold-light/50 px-6 text-xs font-semibold text-primary hover:bg-cream-light disabled:cursor-not-allowed disabled:opacity-50"><Archive className="h-4 w-4" />Archive Completed</button></div>

          <div className="mt-4 hidden overflow-visible lg:block"><table className="w-full border-collapse text-left"><thead className="bg-slate-50 text-sm"><tr><th className="w-10 px-4 py-4"></th><th className="px-2 py-4"><SortHeader label="Task" field="title" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Assigned To" field="assignee" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Due Date" field="due_date" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Priority" field="priority" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Category" field="category" sort={sort} onSort={applySort} /></th><th className="px-2 py-4 font-semibold text-primary">Status</th></tr></thead><tbody>
            {visibleTasks.map((task, index) => (
              <tr key={task.id} className="border-b border-gray-100 text-sm">
                <td className="px-4 py-4"><input type="checkbox" aria-label={`Select task ${task.title}`} checked={selectedIds.has(task.id)} onChange={() => toggleTask(task.id)} className="h-4 w-4 accent-primary" /></td>
                <td className="px-2 py-4">
                  <div className="flex gap-2">
                    <span className="inline-flex h-7 min-w-8 items-center justify-center rounded bg-cream px-2 font-semibold text-primary">{index + 1}.</span>
                    {/* The text block is a fixed width and the icons are its sibling, so
                        the icons land in the same column on every row and the title keeps
                        the full width to wrap the way the template does. */}
                    <div className="flex items-start gap-16">
                      <div className="w-60">
                        <p className="font-semibold text-primary">{task.title}</p>
                        <p className="text-xs text-text-secondary">{task.description}</p>
                      </div>
                      {rowActions(task)}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4"><p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-gray-400" />{task.assignee}</p><p className="pl-6 text-[11px] text-text-muted">by {task.created_by}</p></td>
                <td className="px-2 py-4"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" />{task.due_date || 'No date'}</span></td>
                {rowControls(task).map((control) => <td key={control.key} className="px-2 py-4">{control}</td>)}
              </tr>
            ))}
          </tbody></table></div>

          <div className="mt-4 space-y-3 lg:hidden">{visibleTasks.map((task, index) => <article key={task.id} className="rounded-xl border border-gray-100 p-4 shadow-sm"><div className="flex items-start gap-3"><input type="checkbox" aria-label={`Select task ${task.title}`} checked={selectedIds.has(task.id)} onChange={() => toggleTask(task.id)} className="mt-1 h-4 w-4 accent-primary" /><span className="rounded bg-cream px-2 py-1 text-sm font-semibold text-primary">{index + 1}.</span><div className="min-w-0 flex-1"><div className="flex items-start gap-8"><p className="min-w-0 flex-1 font-semibold text-primary">{task.title}</p>{rowActions(task, 'h-6')}</div><p className="text-xs text-text-secondary">{task.description}</p><p className="mt-2 text-xs text-text-secondary">{task.assignee} · {task.due_date || 'No date'}</p><div className="mt-3 flex flex-wrap gap-2">{rowControls(task)}</div></div></div></article>)} </div>
          {visibleTasks.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No tasks found.</p>}
        </section>
      </div>

      {/* ── Add / Edit task modal ─────────────────────── */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingTask ? 'Edit Task' : 'Add New Task'} size="lg">
        <form onSubmit={saveTask} className="space-y-5" noValidate>
          <div>
            <FieldLabel htmlFor="task-title" required>Task Title</FieldLabel>
            <input id="task-title" value={form.title} onChange={(event) => setField('title', event.target.value)} className={FIELD_CONTROL} autoFocus />
            {formErrors.title && <p className="mt-1 text-xs text-danger">{formErrors.title}</p>}
          </div>

          <div>
            <FieldLabel htmlFor="task-description">Description</FieldLabel>
            <textarea id="task-description" rows={3} value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Task details and instructions..." className="w-full resize-none rounded-xl bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gold-light" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="task-assignee" required>Assigned To</FieldLabel>
              <input id="task-assignee" value={form.assignee} onChange={(event) => setField('assignee', event.target.value)} placeholder="Enter assignee name" className={FIELD_CONTROL} />
              {formErrors.assignee && <p className="mt-1 text-xs text-danger">{formErrors.assignee}</p>}
            </div>
            <div>
              <FieldLabel htmlFor="task-due-date" required>Due Date</FieldLabel>
              <input id="task-due-date" type="date" value={form.due_date} onChange={(event) => setField('due_date', event.target.value)} className={FIELD_CONTROL} />
              {formErrors.due_date && <p className="mt-1 text-xs text-danger">{formErrors.due_date}</p>}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
              <select id="task-priority" value={form.priority} onChange={(event) => setField('priority', event.target.value)} className={FIELD_CONTROL}>
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="task-category">Category</FieldLabel>
              <select id="task-category" value={form.category} onChange={(event) => setField('category', event.target.value)} className={`${FIELD_CONTROL} ${form.category ? '' : 'text-gray-400'}`}>
                <option value="">Select category</option>
                {TASK_CATEGORY_OPTIONS.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3.5 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="h-[52px] rounded-xl border-2 border-cream bg-white px-6 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-cream-warm">Cancel</button>
            <button type="submit" className="flex h-[52px] items-center gap-2 rounded-xl bg-secondary px-6 text-sm font-semibold text-white shadow-md transition-colors hover:bg-secondary-hover">
              <Save className="h-4 w-4" aria-hidden="true" />
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Auto-delete settings modal ────────────────── */}
      <Modal isOpen={showAutoDelete} onClose={() => setShowAutoDelete(false)} title="Auto-Deletion Settings" size="md" className="max-w-md overflow-hidden">
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3 text-[13px] font-medium text-[#8b6200]">
            <input
              type="checkbox"
              checked={autoDeleteDraft.enabled}
              onChange={(event) => setAutoDeleteDraft((current) => ({ ...current, enabled: event.target.checked }))}
              className="h-4 w-4 accent-blue-600"
            />
            Enable auto-deletion for completed tasks
          </label>

          <label htmlFor="task-auto-delete-days" className="block text-[13px] font-semibold text-[#8b6200]">
            Delete after (days):
          </label>
          <select
            id="task-auto-delete-days"
            value={autoDeleteDraft.days}
            disabled={!autoDeleteDraft.enabled}
            onChange={(event) => setAutoDeleteDraft((current) => ({ ...current, days: event.target.value }))}
            className="-mt-2 h-12 w-full max-w-48 rounded-xl border-2 border-gray-900 bg-white px-4 text-base text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {AUTO_DELETE_DURATIONS.map((duration) => (
              <option key={duration.value} value={duration.value}>{duration.label}</option>
            ))}
          </select>

          <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-amber-700">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold">Auto-Deletion Policy</p>
              <p className="mt-1 text-xs leading-4">
                Completed tasks will be automatically deleted after the specified number of days. This helps maintain a clean database and removes old records.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAutoDelete(false)}
              className="h-12 rounded-xl border-2 border-[#efe0c0] bg-white px-6 text-sm font-semibold text-[#8b6200] shadow-sm transition-colors hover:bg-cream-warm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeAutoDelete}
              disabled={autoDeleteBusy}
              className="flex h-12 items-center gap-2 rounded-xl bg-[#ca9000] px-6 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#b27f00] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {autoDeleteBusy ? 'Working…' : 'Execute Now'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

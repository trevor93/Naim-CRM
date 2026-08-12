import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import { PageSpinner } from '../components/ui/Spinner'
import { addTask, archiveTasks, deleteTask, getTasks, updateTask } from '../services/taskService'
import { demoTasks } from '../services/demoData'
import { isSupabaseConfigured } from '../supabase/client'
import { useToast } from '../contexts/ToastContext'
import {
  AlertCircle, Archive, CalendarDays, CheckCircle2, CheckSquare,
  CircleDot, Clock3, Edit3, Plus, Search, Settings, Trash2, UserRound,
} from 'lucide-react'

const STATUSES = ['Pending', 'In Progress', 'Completed', 'Overdue']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const CATEGORIES = ['Follow-up', 'Medical', 'Interview', 'Documentation', 'Administration', 'Other']
const EMPTY_FORM = { title: '', description: '', assignee: '', created_by: 'Admin', due_date: '', priority: 'Medium', category: 'Other', status: 'Pending' }

const priorityClasses = {
  Low: 'border-green-200 bg-green-50 text-green-700', Medium: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  High: 'border-red-200 bg-red-50 text-red-600', Urgent: 'border-red-300 bg-red-100 text-red-700',
}
const categoryClasses = {
  'Follow-up': 'border-yellow-200 bg-yellow-50 text-yellow-700', Medical: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  Interview: 'border-purple-200 bg-purple-50 text-purple-700', Documentation: 'border-blue-200 bg-blue-50 text-blue-700',
  Administration: 'border-gray-200 bg-gray-50 text-gray-700', Other: 'border-gray-200 bg-gray-50 text-gray-700',
}
const statusClasses = {
  Pending: 'border-yellow-200 bg-yellow-50 text-yellow-700', 'In Progress': 'border-blue-200 bg-blue-100 text-blue-700',
  Completed: 'border-green-200 bg-green-50 text-green-700', Overdue: 'border-red-200 bg-red-50 text-red-600',
}

function normalizeTask(task) {
  return {
    ...EMPTY_FORM,
    ...task,
    description: task.description || task.details || '',
    assignee: task.assignee || 'Unassigned',
    created_by: task.created_by || 'Admin',
    priority: `${task.priority || 'Medium'}`.replace(/^./, (letter) => letter.toUpperCase()).toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
    category: task.category || 'Other',
  }
}

function PillSelect({ label, value, options, classes, onChange }) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`h-8 max-w-28 rounded-full border px-2 text-[11px] font-medium outline-none ${classes[value] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  )
}

function SortHeader({ label, field, sort, onSort }) {
  const active = sort.field === field
  return <button type="button" aria-label={`Sort by ${label}`} data-direction={active ? sort.direction : 'none'} onClick={() => onSort(field)} className="inline-flex items-center gap-1 font-semibold text-primary">{label}<span aria-hidden="true">{active ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span></button>
}

export default function TasksPage() {
  const toast = useToast()
  const toastRef = useRef(toast)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [sort, setSort] = useState({ field: 'due_date', direction: 'asc' })
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [titleError, setTitleError] = useState('')
  const [showAutoDelete, setShowAutoDelete] = useState(false)
  const [autoDeleteDays, setAutoDeleteDays] = useState(() => localStorage.getItem('tasks:autoDeleteDays') || '30')

  useEffect(() => {
    async function loadTasks() {
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
    }
    loadTasks()
  }, [])

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
    setTitleError('')
    setShowForm(true)
  }

  async function saveTask(event) {
    event.preventDefault()
    if (!form.title.trim()) { setTitleError('Title is required'); return }
    const previous = tasks
    const next = { ...form, title: form.title.trim(), completed_at: form.status === 'Completed' ? (form.completed_at || new Date().toISOString()) : null }
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

  if (loading) return <Layout title="Tasks"><PageSpinner /></Layout>

  const metrics = [
    { label: 'Total', value: counts.Total, icon: CheckSquare, color: 'text-primary' },
    { label: 'Pending', value: counts.Pending, icon: CircleDot, color: 'text-secondary' },
    { label: 'In Progress', value: counts['In Progress'], icon: Clock3, color: 'text-blue-600' },
    { label: 'Completed', value: counts.Completed, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Overdue', value: counts.Overdue, icon: AlertCircle, color: 'text-red-600' },
  ]

  const TaskControls = ({ task }) => <>
    <PillSelect label={`Priority for ${task.title}`} value={task.priority} options={PRIORITIES} classes={priorityClasses} onChange={(value) => updateField(task.id, 'priority', value)} />
    <PillSelect label={`Category for ${task.title}`} value={task.category} options={CATEGORIES} classes={categoryClasses} onChange={(value) => updateField(task.id, 'category', value)} />
    <PillSelect label={`Status for ${task.title}`} value={task.status} options={STATUSES} classes={statusClasses} onChange={(value) => updateField(task.id, 'status', value)} />
  </>

  return (
    <Layout title="Admin Dashboard">
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-primary">Tasks</h1><p className="mt-2 text-base text-text-secondary">Manage and track all tasks across your recruitment process</p></div>
          <button type="button" onClick={() => setShowAutoDelete(true)} className="inline-flex h-13 items-center gap-2 rounded-xl border-2 border-gold-light/50 bg-white px-6 text-sm font-semibold text-primary hover:bg-cream-light"><Settings className="h-4 w-4" />Auto-Delete</button>
        </header>

        <section aria-label="Task summary" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {metrics.map(({ label, value, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-gray-100 bg-white px-6 py-7 shadow-card"><div className="flex items-center justify-between"><div><p className="text-sm text-text-secondary">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div><Icon className={`h-8 w-8 ${color}`} /></div></article>)}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-card sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3"><h2 className="flex items-center gap-2 text-xl font-bold text-primary"><CheckSquare className="h-5 w-5" />All Tasks</h2><button type="button" onClick={() => openForm()} className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-gold-light/50 px-6 text-sm font-semibold text-primary hover:bg-cream-light"><Plus className="h-4 w-4" />Add Task</button></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input aria-label="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, assignees, categories..." className="h-10 w-full min-w-0 rounded-lg border-0 pl-9 pr-3 text-sm outline-none ring-1 ring-transparent focus:ring-gold-light sm:w-80" /></label>
              <select aria-label="Filter tasks by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border-0 px-3 text-sm outline-none"><option value="">All Status</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
              <select aria-label="Filter tasks by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="h-10 rounded-lg border-0 px-3 text-sm outline-none"><option value="">All Priority</option>{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><label className="inline-flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox" aria-label="Select all tasks" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />Select All</label><button type="button" disabled={!completedIds.length} onClick={archiveCompleted} className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-gold-light/50 px-6 text-xs font-semibold text-primary hover:bg-cream-light disabled:cursor-not-allowed disabled:opacity-50"><Archive className="h-4 w-4" />Archive Completed</button></div>

          <div className="mt-4 hidden overflow-visible lg:block"><table className="w-full border-collapse text-left"><thead className="bg-slate-50 text-sm"><tr><th className="w-10 px-4 py-4"></th><th className="px-2 py-4"><SortHeader label="Task" field="title" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Assigned To" field="assignee" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Due Date" field="due_date" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Priority" field="priority" sort={sort} onSort={applySort} /></th><th className="px-2 py-4"><SortHeader label="Category" field="category" sort={sort} onSort={applySort} /></th><th className="px-2 py-4 font-semibold text-primary">Status</th></tr></thead><tbody>
            {visibleTasks.map((task, index) => <tr key={task.id} className="border-b border-gray-100 text-sm"><td className="px-4 py-4"><input type="checkbox" aria-label={`Select task ${task.title}`} checked={selectedIds.has(task.id)} onChange={() => toggleTask(task.id)} className="h-4 w-4 accent-primary" /></td><td className="px-2 py-4"><div className="flex gap-2"><span className="inline-flex h-7 min-w-8 items-center justify-center rounded bg-cream px-2 font-semibold text-primary">{index + 1}.</span><div className="min-w-0"><p className="font-semibold text-primary">{task.title}</p><p className="max-w-80 text-xs text-text-secondary">{task.description}</p><div className="mt-1 flex gap-3"><button type="button" aria-label={`Edit ${task.title}`} onClick={() => openForm(task)} className="text-blue-500"><Edit3 className="h-3 w-3" /></button><button type="button" aria-label={`Delete ${task.title}`} onClick={() => removeTask(task)} className="text-red-500"><Trash2 className="h-3 w-3" /></button></div></div></div></td><td className="px-2 py-4"><p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-gray-400" />{task.assignee}</p><p className="pl-6 text-[11px] text-text-muted">by {task.created_by}</p></td><td className="px-2 py-4"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" />{task.due_date || 'No date'}</span></td><td className="px-2 py-4"><PillSelect label={`Priority for ${task.title}`} value={task.priority} options={PRIORITIES} classes={priorityClasses} onChange={(value) => updateField(task.id, 'priority', value)} /></td><td className="px-2 py-4"><PillSelect label={`Category for ${task.title}`} value={task.category} options={CATEGORIES} classes={categoryClasses} onChange={(value) => updateField(task.id, 'category', value)} /></td><td className="px-2 py-4"><PillSelect label={`Status for ${task.title}`} value={task.status} options={STATUSES} classes={statusClasses} onChange={(value) => updateField(task.id, 'status', value)} /></td></tr>)}
          </tbody></table></div>

          <div className="mt-4 space-y-3 lg:hidden">{visibleTasks.map((task, index) => <article key={task.id} className="rounded-xl border border-gray-100 p-4 shadow-sm"><div className="flex items-start gap-3"><input type="checkbox" aria-label={`Select task ${task.title}`} checked={selectedIds.has(task.id)} onChange={() => toggleTask(task.id)} className="mt-1 h-4 w-4 accent-primary" /><span className="rounded bg-cream px-2 py-1 text-sm font-semibold text-primary">{index + 1}.</span><div className="min-w-0 flex-1"><p className="font-semibold text-primary">{task.title}</p><p className="text-xs text-text-secondary">{task.description}</p><p className="mt-2 text-xs text-text-secondary">{task.assignee} · {task.due_date || 'No date'}</p><div className="mt-3 flex flex-wrap gap-2"><TaskControls task={task} /></div><div className="mt-3 flex gap-4"><button type="button" aria-label={`Edit ${task.title}`} onClick={() => openForm(task)} className="text-blue-500"><Edit3 className="h-4 w-4" /></button><button type="button" aria-label={`Delete ${task.title}`} onClick={() => removeTask(task)} className="text-red-500"><Trash2 className="h-4 w-4" /></button></div></div></div></article>)} </div>
          {visibleTasks.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No tasks found.</p>}
        </section>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingTask ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={saveTask} className="space-y-4" noValidate><Input label="Title" aria-label="Title" value={form.title} error={titleError} onChange={(event) => { setForm({ ...form, title: event.target.value }); if (event.target.value.trim()) setTitleError('') }} /><Textarea label="Description" aria-label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><Input label="Assigned To" aria-label="Assigned To" value={form.assignee} onChange={(event) => setForm({ ...form, assignee: event.target.value })} /><Input label="Due Date" aria-label="Due Date" type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /><div className="grid gap-3 sm:grid-cols-3"><Select label="Priority" aria-label="Priority" value={form.priority} options={PRIORITIES} onChange={(event) => setForm({ ...form, priority: event.target.value })} /><Select label="Category" aria-label="Category" value={form.category} options={CATEGORIES} onChange={(event) => setForm({ ...form, category: event.target.value })} /><Select label="Status" aria-label="Status" value={form.status} options={STATUSES} onChange={(event) => setForm({ ...form, status: event.target.value })} /></div><div className="flex justify-end gap-3 border-t border-cream pt-4"><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">{editingTask ? 'Update Task' : 'Create Task'}</Button></div></form>
      </Modal>

      <Modal isOpen={showAutoDelete} onClose={() => setShowAutoDelete(false)} title="Auto-Delete Settings" size="sm"><div className="space-y-5"><Select label="Delete completed tasks after" aria-label="Delete completed tasks after" value={autoDeleteDays} onChange={(event) => setAutoDeleteDays(event.target.value)} options={[{ value: 'disabled', label: 'Disabled' }, { value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]} /><p className="text-xs leading-5 text-text-secondary">Completed tasks older than the selected retention period will be eligible for automatic deletion.</p><div className="flex justify-end gap-3 border-t border-cream pt-4"><Button type="button" variant="ghost" onClick={() => setShowAutoDelete(false)}>Cancel</Button><Button type="button" onClick={() => { localStorage.setItem('tasks:autoDeleteDays', autoDeleteDays); toast.success('Auto-delete settings saved'); setShowAutoDelete(false) }}>Save Settings</Button></div></div></Modal>
    </Layout>
  )
}

import { Archive, CalendarDays, CheckSquare, Search, UserRound } from 'lucide-react'

const pillClasses = {
  HIGH: 'border-red-200 bg-red-50 text-red-600', MEDIUM: 'border-yellow-200 bg-yellow-50 text-yellow-700', LOW: 'border-green-200 bg-green-50 text-green-700',
  Completed: 'border-green-200 bg-green-50 text-green-700', 'In Progress': 'border-blue-200 bg-blue-50 text-blue-700', Pending: 'border-gray-200 bg-gray-50 text-gray-700',
  'Follow-up': 'border-yellow-200 bg-yellow-50 text-yellow-700', Medical: 'border-yellow-200 bg-yellow-50 text-yellow-700', Interview: 'border-purple-200 bg-purple-50 text-purple-700',
}

function PillSelect({ label, value, options, onChange }) {
  return <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`h-8 rounded-full border px-2 text-[11px] outline-none ${pillClasses[value] || 'border-gray-200 bg-gray-50'}`}>{options.map((option) => <option key={option}>{option}</option>)}</select>
}

export default function AssociatesTasksCard({ tasks, selectedIds, allSelected, search, statusFilter, priorityFilter, onSearch, onStatusFilter, onPriorityFilter, onToggle, onToggleAll, onUpdate, onArchive }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white px-5 py-8 shadow-card sm:px-6 sm:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary"><CheckSquare className="h-5 w-5" /> All Tasks</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input aria-label="Search tasks" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search tasks, assignees, categories..." className="h-10 w-full rounded-lg border-0 pl-9 pr-3 text-sm outline-none ring-1 ring-transparent focus:ring-gold-light sm:w-80" /></label>
          <select aria-label="Filter by status" value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)} className="h-10 rounded-lg border-0 px-3 text-sm outline-none"><option>All Status</option><option>Completed</option><option>In Progress</option><option>Pending</option></select>
          <select aria-label="Filter by priority" value={priorityFilter} onChange={(e) => onPriorityFilter(e.target.value)} className="h-10 rounded-lg border-0 px-3 text-sm outline-none"><option>All Priority</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><label className="inline-flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox" aria-label="Select all tasks" checked={allSelected} onChange={onToggleAll} className="h-4 w-4 accent-primary" /> Select All</label><button type="button" onClick={onArchive} className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-gold-light/50 px-6 text-xs font-semibold text-primary hover:bg-cream-light"><Archive className="h-4 w-4" /> Archive Completed</button></div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[930px] border-collapse text-left"><thead className="bg-slate-50 text-sm font-semibold text-primary"><tr><th className="w-10 px-4 py-4"></th><th className="px-2 py-4">Task ↕</th><th className="px-2 py-4">Assigned To ↕</th><th className="px-2 py-4">Due Date ↕</th><th className="px-2 py-4">Priority ↕</th><th className="px-2 py-4">Category ↕</th><th className="px-2 py-4">Status</th></tr></thead><tbody>
          {tasks.map((task, index) => <tr key={task.id} className="border-b border-gray-100 text-sm"><td className="px-4 py-4"><input type="checkbox" aria-label={`Select task ${task.title}`} checked={selectedIds.has(task.id)} onChange={() => onToggle(task.id)} className="h-4 w-4 accent-primary" /></td><td className="px-2 py-4"><div className="flex gap-2"><span className="inline-flex h-7 min-w-8 items-center justify-center rounded bg-cream px-2 font-semibold text-primary">{index + 1}.</span><div><p className="font-semibold text-primary">{task.title}</p><p className="text-xs text-text-secondary">{task.details}</p></div></div></td><td className="px-2 py-4"><p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-gray-400" />{task.assignee}</p><p className="pl-6 text-[11px] text-text-muted">by {task.created_by}</p></td><td className="px-2 py-4"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" />{task.due_date}</span></td><td className="px-2 py-4"><PillSelect label={`Priority for ${task.title}`} value={task.priority} options={['HIGH','MEDIUM','LOW']} onChange={(value) => onUpdate(task.id, 'priority', value)} /></td><td className="px-2 py-4"><PillSelect label={`Category for ${task.title}`} value={task.category} options={['Follow-up','Medical','Interview']} onChange={(value) => onUpdate(task.id, 'category', value)} /></td><td className="px-2 py-4"><PillSelect label={`Status for ${task.title}`} value={task.status} options={['Completed','In Progress','Pending']} onChange={(value) => onUpdate(task.id, 'status', value)} /></td></tr>)}
        </tbody></table>
      </div>
    </section>
  )
}

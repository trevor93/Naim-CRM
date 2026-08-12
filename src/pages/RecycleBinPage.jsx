import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckSquare,
  Clock3,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { PageSpinner } from '../components/ui/Spinner'
import { useToast } from '../contexts/ToastContext'
import {
  deleteRecycleBinItem,
  loadRecycleBinItems,
  restoreRecycleBinItem,
} from '../services/recycleBinService'

function PermanentDeleteModal({ item, onClose, onConfirm }) {
  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title="Permanently Delete Item" size="sm">
      <p className="text-sm leading-6 text-text-secondary">
        This item will be permanently removed and cannot be restored.
      </p>
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={onConfirm}>Delete Permanently</Button>
      </div>
    </Modal>
  )
}

function DeletedItemRow({ item, index, selected, onSelect, onRestore, onDelete }) {
  return (
    <article
      data-testid="recycle-bin-item"
      className="grid min-w-0 grid-cols-[auto_auto_auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-[#d8dee8] bg-[#f8fafc] px-4 py-4 sm:grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] sm:px-5"
    >
      <input
        type="checkbox"
        aria-label={`Select deleted item ${item.name} ${item.email}`}
        checked={selected}
        onChange={(event) => onSelect(item.id, event.target.checked)}
        className="h-3.5 w-3.5 rounded border-gray-400 accent-primary"
      />
      <span className="flex h-7 min-w-8 items-center justify-center rounded bg-[#f2e6c9] px-2 text-sm font-semibold text-[#8d6810]">
        {index + 1}.
      </span>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
        <Users className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="break-words text-sm font-semibold text-slate-950 sm:text-base">{item.name}</h3>
          <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            {item.type}
          </span>
        </div>
        <p className="mt-1 break-words text-xs text-slate-600 sm:text-sm">
          Email: {item.email}, Phone: {item.phone}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            Deleted about 2 months ago
          </span>
          <span>{item.deleted_by}</span>
        </div>
      </div>
      <div className="col-start-4 flex justify-end gap-4 sm:col-start-5 sm:row-start-1">
        <button
          type="button"
          aria-label={`Restore ${item.name} ${item.email}`}
          title="Restore item"
          onClick={() => onRestore(item)}
          className="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${item.name} ${item.email}`}
          title="Delete permanently"
          onClick={() => onDelete(item)}
          className="rounded p-2 text-red-500 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export default function RecycleBinPage() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    let active = true
    loadRecycleBinItems()
      .then((data) => active && setItems(data))
      .catch(() => active && toast.error('Failed to load deleted items'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [toast])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesType = type === 'all' || item.type === type
      const matchesSearch = !query || [item.name, item.email, item.phone, item.type]
        .some((value) => value.toLowerCase().includes(query))
      return matchesType && matchesSearch
    })
  }, [items, search, type])

  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id))

  function handleSelect(id, checked) {
    setSelectedIds((current) => checked
      ? [...new Set([...current, id])]
      : current.filter((selectedId) => selectedId !== id))
  }

  function handleSelectAll() {
    const visibleIds = filteredItems.map((item) => item.id)
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])])
  }

  async function handleRestore(item) {
    try {
      await restoreRecycleBinItem(item)
      setItems((current) => current.filter((candidate) => candidate.id !== item.id))
      setSelectedIds((current) => current.filter((id) => id !== item.id))
      toast.success('Item restored')
    } catch {
      toast.error('Restore failed')
    }
  }

  async function handleDelete() {
    const item = pendingDelete
    if (!item) return
    try {
      await deleteRecycleBinItem(item)
      setItems((current) => current.filter((candidate) => candidate.id !== item.id))
      setSelectedIds((current) => current.filter((id) => id !== item.id))
      setPendingDelete(null)
      toast.success('Item permanently deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="min-w-0 animate-fade-in">
        <header className="mb-7">
          <h1 className="text-3xl font-bold text-primary">Recycle Bin</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Recover recently deleted items. Items are automatically deleted after 30 days.
          </p>
        </header>

        <section
          data-testid="recycle-bin-panel"
          className="min-w-0 rounded-2xl border border-gray-100 bg-white px-5 py-8 shadow-[0_8px_22px_rgba(15,23,42,0.10)] sm:px-8 lg:px-12 lg:py-12"
        >
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2 text-primary">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-xl font-bold">Deleted Items</h2>
            </div>
            <label className="relative min-w-0 flex-1 lg:max-w-sm">
              <span className="sr-only">Search deleted items</span>
              <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search deleted items"
                placeholder="Search deleted items..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full border-0 bg-transparent py-2 pl-7 pr-3 text-sm text-text-primary outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="lg:ml-auto">
              <span className="sr-only">Deleted item type</span>
              <select
                aria-label="Deleted item type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full min-w-36 rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 lg:w-auto"
              >
                <option value="all">All Types</option>
                <option value="candidate">Candidates</option>
              </select>
            </label>
          </div>

          <div className="mt-8 rounded-lg border border-[#d8dee8] bg-[#f8fafc] px-3 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectAll}
              className="bg-white"
            >
              <CheckSquare className="h-4 w-4" aria-hidden="true" />
              Select All
            </Button>
          </div>

          {loading ? (
            <PageSpinner />
          ) : (
            <div className="mt-4 space-y-3">
              {filteredItems.map((item) => (
                <DeletedItemRow
                  key={item.id}
                  item={item}
                  index={items.findIndex((candidate) => candidate.id === item.id)}
                  selected={selectedIds.includes(item.id)}
                  onSelect={handleSelect}
                  onRestore={handleRestore}
                  onDelete={setPendingDelete}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-slate-500">
                  No deleted items match your search.
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-4 text-amber-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold">Auto-deletion Policy</h3>
              <p className="mt-1 text-xs leading-5">
                Items in the recycle bin are automatically deleted after 30 days. Restore important items before they are permanently removed.
              </p>
            </div>
          </div>
        </section>
      </div>

      <PermanentDeleteModal
        item={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Layout>
  )
}

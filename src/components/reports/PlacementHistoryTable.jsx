import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import Card from '../ui/Card'
import { formatSalary } from './reportsData'

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'candidate', label: 'Candidate' },
  { key: 'position', label: 'Position' },
  { key: 'country', label: 'Country' },
  { key: 'salary', label: 'Salary' },
  { key: 'status', label: 'Status' },
  { key: 'departure', label: 'Departure' },
]

function SortIcon({ direction }) {
  if (direction === 'asc') return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
  if (direction === 'desc') return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
  return <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
}

export default function PlacementHistoryTable({ rows, sort, onSort }) {
  return (
    <Card padding={false} className="reports-print-card overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-lg font-semibold text-text-primary">Placement History</h2>
        <p className="mt-1 text-sm text-text-muted">Complete record of candidate placements</p>
      </div>

      <div data-testid="placement-history-scroll" className="max-w-full overflow-x-auto">
        <table data-testid="placement-history-table" className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <thead className="border-y border-cream bg-cream-light text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              {columns.map((column) => {
                const activeDirection = sort.key === column.key ? sort.direction : null
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={activeDirection === 'asc' ? 'ascending' : activeDirection === 'desc' ? 'descending' : 'none'}
                    className="px-4 py-3 font-semibold"
                  >
                    <button
                      type="button"
                      aria-label={`Sort by ${column.label}`}
                      data-direction={activeDirection || 'none'}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      onClick={() => onSort(column.key)}
                    >
                      {column.label}
                      <SortIcon direction={activeDirection} />
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream">
            {rows.length ? rows.map((row) => (
              <tr key={row.id} className="bg-white hover:bg-cream-light/60">
                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{row.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-primary">
                      {row.sequence}
                    </span>
                    <span className="font-semibold text-primary">{row.candidate}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-text-primary">{row.position}</td>
                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{row.country}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">{formatSalary(row.salary)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-800">
                    {row.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{row.departure}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                  No placement history matches your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

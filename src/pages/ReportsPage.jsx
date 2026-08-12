import { useMemo, useState } from 'react'
import { Download, Printer, Search } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import CandidatesByStageCard from '../components/reports/CandidatesByStageCard'
import LivePerformanceDashboard from '../components/reports/LivePerformanceDashboard'
import PlacementHistoryTable from '../components/reports/PlacementHistoryTable'
import RecentSuccessfulPlacements from '../components/reports/RecentSuccessfulPlacements'
import ReportMetricCard from '../components/reports/ReportMetricCard'
import {
  APPLICATIONS_BY_COUNTRY,
  CANDIDATE_STAGES,
  filterReportRows,
  PLACEMENT_HISTORY,
  RECENT_SUCCESSFUL_PLACEMENTS,
  REPORT_METRICS,
  sortReportRows,
  STAGE_DISTRIBUTION,
  TASK_PERFORMANCE,
  toExportRows,
} from '../components/reports/reportsData'
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils'
import { useToast } from '../contexts/ToastContext'

const exportOptions = [
  { value: 'csv', label: 'CSV Format' },
  { value: 'xlsx', label: 'Excel Format' },
  { value: 'pdf', label: 'PDF Format' },
]

export default function ReportsPage() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [format, setFormat] = useState('csv')
  const [sort, setSort] = useState({ key: null, direction: null })

  const filteredPlacements = useMemo(
    () => filterReportRows(RECENT_SUCCESSFUL_PLACEMENTS, search),
    [search]
  )

  const visibleHistory = useMemo(
    () => sortReportRows(filterReportRows(PLACEMENT_HISTORY, search), sort),
    [search, sort]
  )

  function handleSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  function handleExport() {
    const rows = toExportRows(visibleHistory)
    if (!rows.length) {
      toast.error('No report data to export')
      return
    }

    try {
      if (format === 'csv') exportToCSV(rows, 'placement-history-report.csv')
      else if (format === 'xlsx') exportToExcel(rows, 'placement-history-report.xlsx')
      else exportToPDF(rows, 'Placement History Report', 'placement-history-report.pdf')
      toast.success('Report exported!')
    } catch {
      toast.error('Failed to export report')
    }
  }

  return (
    <Layout title="Admin Dashboard">
      <section id="reports-print-area" className="min-w-0 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-text-secondary">Track performance and analyze recruitment metrics</p>
        </div>

        <div className="reports-no-print flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block w-full xl:max-w-md">
            <span className="sr-only">Search reports data</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search reports data"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports..."
              className="w-full rounded-lg border border-cream bg-white py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <label className="block min-w-40">
              <span className="sr-only">Report export format</span>
              <select
                aria-label="Report export format"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
                className="w-full rounded-lg border border-cream bg-white px-3 py-2.5 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {exportOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <Button type="button" onClick={handleExport} className="min-h-10">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Report
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()} className="min-h-10 bg-white">
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {REPORT_METRICS.map((metric) => <ReportMetricCard key={metric.label} metric={metric} />)}
        </div>

        <CandidatesByStageCard stages={CANDIDATE_STAGES} />

        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.7fr)]">
          <RecentSuccessfulPlacements placements={filteredPlacements} />
          <LivePerformanceDashboard
            stages={STAGE_DISTRIBUTION}
            countries={APPLICATIONS_BY_COUNTRY}
            tasks={TASK_PERFORMANCE}
          />
        </div>

        <PlacementHistoryTable rows={visibleHistory} sort={sort} onSort={handleSort} />
      </section>
    </Layout>
  )
}

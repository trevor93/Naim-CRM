import Card from '../ui/Card'

const toneClasses = {
  gold: 'border-amber-100 bg-amber-50',
  blue: 'border-blue-100 bg-blue-50',
  green: 'border-green-100 bg-green-50',
  yellow: 'border-yellow-100 bg-yellow-50',
}

function SummaryGroup({ title, rows, tone }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div
            key={`${title}-${row.label}`}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${toneClasses[row.tone || tone]}`}
          >
            <span className="min-w-0 break-words text-text-secondary">{row.label}</span>
            <span className="shrink-0 font-bold text-text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function LivePerformanceDashboard({ stages, countries, tasks }) {
  return (
    <Card className="reports-print-card h-full">
      <h2 className="text-lg font-semibold text-text-primary">Live Performance Dashboard</h2>
      <p className="mt-1 text-sm text-text-muted">Real-time recruitment activity overview</p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryGroup title="Candidate Stage Distribution" rows={stages} tone="gold" />
        <SummaryGroup title="Applications by Country" rows={countries} tone="blue" />
        <SummaryGroup title="Task Performance by Assignee" rows={tasks} tone="green" />
      </div>
    </Card>
  )
}

import Card from '../ui/Card'

export default function CandidatesByStageCard({ stages }) {
  return (
    <Card data-testid="candidate-stage-summary" className="reports-print-card">
      <h2 className="text-lg font-semibold text-text-primary">Candidates by Stage</h2>
      <p className="mt-1 text-sm text-text-muted">Real-time data synced across all pages</p>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stages.map((stage) => (
          <div key={stage.label} className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-4 text-center">
            <p className="text-2xl font-bold text-primary">{stage.value}</p>
            <p className="mt-1 text-xs font-medium text-text-secondary">{stage.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

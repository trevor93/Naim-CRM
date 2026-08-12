import Card from '../ui/Card'

export default function RecentSuccessfulPlacements({ placements }) {
  return (
    <Card data-testid="recent-successful-placements" className="reports-print-card h-full">
      <h2 className="text-lg font-semibold text-text-primary">Recent Successful Placements</h2>
      <p className="mt-1 text-sm text-text-muted">Latest candidates successfully placed</p>

      <div className="mt-5 space-y-3">
        {placements.length ? placements.map((placement) => (
          <article key={placement.id} className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="font-semibold text-primary">{placement.candidate}</p>
            <p className="mt-1 text-sm font-medium text-text-primary">{placement.position}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
              <span>{placement.country}</span>
              <span className="font-semibold text-primary">{placement.salary}</span>
            </div>
          </article>
        )) : (
          <p className="rounded-lg border border-dashed border-cream p-8 text-center text-sm text-text-muted">
            No successful placements match your search.
          </p>
        )}
      </div>
    </Card>
  )
}

import { ArrowRight, UsersRound } from 'lucide-react'

export default function RecentCandidatesCard({ candidates, total, onViewAll, onStageChange }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white px-5 py-8 shadow-card sm:px-12 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary"><UsersRound className="h-5 w-5" aria-hidden="true" /> Recent Candidates <span className="text-xs font-normal text-text-secondary">({total} recent)</span></h2>
        <button type="button" onClick={onViewAll} className="inline-flex h-12 items-center gap-3 rounded-xl border-2 border-gold-light/50 px-6 text-xs font-semibold text-primary hover:bg-cream-light">View All Candidates <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        {candidates.map((candidate, index) => (
          <article key={candidate.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-2">
              <span className="inline-flex h-7 min-w-8 items-center justify-center rounded bg-cream px-2 text-sm font-semibold text-primary">{index + 1}.</span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{candidate.name}</h3>
                <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-secondary"><span>{candidate.position}</span><span>{candidate.company}</span><span>{candidate.salary}</span></p>
                <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-text-muted"><span>{candidate.email}</span><span>·</span><span>{candidate.phone}</span></p>
              </div>
            </div>
            <select aria-label={`Stage for ${candidate.name} ${index + 1}`} value={candidate.stage} onChange={(event) => onStageChange(candidate.id, event.target.value)} className="h-7 self-end rounded-full border border-blue-200 bg-blue-50 px-3 text-[11px] text-blue-700 outline-none sm:self-start">
              <option>Onboarding</option><option>Screening</option><option>Interview</option><option>Placed</option>
            </select>
          </article>
        ))}
      </div>
    </section>
  )
}

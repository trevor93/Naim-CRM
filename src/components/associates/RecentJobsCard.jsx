import { ArrowRight, BriefcaseBusiness } from 'lucide-react'

export default function RecentJobsCard({ jobs, onViewAll }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white px-5 py-8 shadow-card sm:px-12 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary"><BriefcaseBusiness className="h-5 w-5" aria-hidden="true" /> Recent Jobs <span className="text-xs font-normal text-text-secondary">({jobs.length})</span></h2>
        <button type="button" onClick={onViewAll} className="inline-flex h-12 items-center gap-3 rounded-xl border-2 border-gold-light/50 px-6 text-xs font-semibold text-primary hover:bg-cream-light">View All Jobs <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        {jobs.map((job, index) => (
          <article key={job.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-2">
              <span className="inline-flex h-7 min-w-8 items-center justify-center rounded bg-cream px-2 text-sm font-semibold text-primary">{index + 1}.</span>
              <div><h3 className="text-sm font-semibold text-text-primary">{job.title}</h3><p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-secondary"><span>{job.company}</span><span>{job.location}</span><span>{job.type}</span></p><p className="mt-1 text-[11px] text-text-muted">{job.meta}</p></div>
            </div>
            <span className={`self-end rounded-full border px-3 py-1 text-[11px] sm:self-start ${job.status === 'Active' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-600'}`}>{job.status}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

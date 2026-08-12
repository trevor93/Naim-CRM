import { BriefcaseBusiness, CalendarDays, Plus, UserRound } from 'lucide-react'

const ACTIONS = [
  { label: 'Add Candidate', icon: Plus, handler: 'onAddCandidate' },
  { label: 'View Candidates', icon: UserRound, handler: 'onViewCandidates' },
  { label: 'Book Appointment', icon: CalendarDays, handler: 'onBookAppointment' },
  { label: 'View Jobs', icon: BriefcaseBusiness, handler: 'onViewJobs' },
]

export default function AssociateQuickActions(props) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 lg:w-auto lg:grid-cols-4">
      {ACTIONS.map(({ label, icon: Icon, handler }) => (
        <button key={label} type="button" onClick={props[handler]} className="inline-flex min-h-[74px] items-center justify-center gap-3 rounded-xl border-2 border-gold-light/50 bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-cream-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:min-w-[174px]">
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="max-w-[105px] text-center leading-6">{label}</span>
        </button>
      ))}
    </div>
  )
}

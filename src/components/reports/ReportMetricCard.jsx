import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  SquareCheckBig,
  Users,
} from 'lucide-react'

const icons = {
  users: Users,
  briefcase: BriefcaseBusiness,
  tasks: SquareCheckBig,
  completed: SquareCheckBig,
  calendar: CalendarDays,
  pending: Clock3,
}

const accents = {
  gold: {
    value: 'text-primary',
    icon: 'bg-amber-50 text-primary',
  },
  green: {
    value: 'text-success',
    icon: 'bg-green-50 text-success',
  },
  orange: {
    value: 'text-warning',
    icon: 'bg-amber-50 text-warning',
  },
}

function slugify(label) {
  return label.toLowerCase().replaceAll(' ', '-')
}

export default function ReportMetricCard({ metric }) {
  const Icon = icons[metric.icon] || Users
  const accent = accents[metric.accent] || accents.gold

  return (
    <article
      data-testid={`report-metric-${slugify(metric.label)}`}
      className="flex min-h-28 items-center justify-between rounded-xl border border-cream bg-white p-5 shadow-sm"
    >
      <div>
        <p className="text-sm font-medium text-text-secondary">{metric.label}</p>
        <p className={`mt-2 text-3xl font-bold ${accent.value}`}>{metric.value}</p>
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent.icon}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </article>
  )
}

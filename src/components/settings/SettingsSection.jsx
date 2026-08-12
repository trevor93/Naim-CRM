export default function SettingsSection({ testId, icon: Icon, title, description, children, className = '' }) {
  return (
    <section
      data-testid={testId}
      className={`min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_16px_rgba(15,23,42,0.08)] sm:p-8 ${className}`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
        <h2 className="text-xl font-bold text-primary sm:text-2xl">{title}</h2>
      </div>
      {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      <div className="mt-7">{children}</div>
    </section>
  )
}

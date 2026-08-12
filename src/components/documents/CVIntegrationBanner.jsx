export default function CVIntegrationBanner({ onClear, disabled = false }) {
  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-blue-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-blue-800">CV Builder Integration</h2>
        <p className="mt-1 max-w-4xl text-xs leading-5 text-blue-700">
          CVs created in the CV Builder are automatically saved here. You can also upload external CVs manually. All CVs are linked to their respective candidates for easy access and management.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="shrink-0 self-start rounded-md border border-red-600 bg-red-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
      >
        Clear All CV Drafts
      </button>
    </aside>
  )
}

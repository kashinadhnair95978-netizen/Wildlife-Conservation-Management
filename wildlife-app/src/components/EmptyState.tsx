import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export function EmptyState({ title, description = 'Try changing your search or filters.', icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-300 bg-ink-50/50 px-6 py-16 text-center">
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-400">
          <Icon size={20} strokeWidth={1.5} />
        </span>
      ) : (
        <span className="mb-4 h-12 w-12 rounded-full border border-ink-200 bg-white" aria-hidden="true" />
      )}
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
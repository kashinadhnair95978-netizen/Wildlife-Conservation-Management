import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title: string
  message: string
  onRetry: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-status-red/30 bg-status-red/5 px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-status-red/20 bg-white text-status-red">
        <AlertTriangle size={20} strokeWidth={1.5} />
      </span>
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{message}</p>
      <button type="button" className="btn-outline mt-5" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}
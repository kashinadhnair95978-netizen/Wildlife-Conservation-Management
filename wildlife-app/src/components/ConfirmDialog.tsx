import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="animate-overlay-in absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
      <div className="animate-fade-up relative w-full max-w-md rounded-2xl border border-ink-200 bg-white p-6 shadow-modal">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-status-red/20 bg-status-red/10 text-status-red">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-ink-950">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-status-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-status-red/90 disabled:pointer-events-none disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
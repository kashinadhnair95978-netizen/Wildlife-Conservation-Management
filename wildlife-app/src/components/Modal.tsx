import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  description?: string
  wide?: boolean
  ariaLabel?: string
}

export function Modal({ open, onClose, title, description, children, wide = false, ariaLabel }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
    >
      <div className="animate-overlay-in absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`animate-fade-up relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-ink-200 bg-white shadow-modal scrollbar-thin sm:rounded-2xl ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-950">{title}</h2>
            {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="icon-btn -mr-2 -mt-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
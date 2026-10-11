import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  notify: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
}

const tone: Record<ToastType, string> = {
  success: 'text-status-emerald',
  error: 'text-status-red',
  info: 'text-status-blue',
  warning: 'text-status-amber',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, type, message }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value: ToastContextValue = {
    notify,
    success: (m) => notify(m, 'success'),
    error: (m) => notify(m, 'error'),
    info: (m) => notify(m, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-modal animate-toast-in"
          >
            <span className={`mt-0.5 shrink-0 ${tone[toast.type]}`}>{icons[toast.type]}</span>
            <p className="flex-1 text-sm font-medium leading-snug text-ink-800">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-ink-400 transition-colors hover:text-ink-900"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
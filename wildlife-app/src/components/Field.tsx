import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input-base ${props.className ?? ''}`} />
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`input-base cursor-pointer ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input-base min-h-[92px] resize-y ${props.className ?? ''}`} />
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex justify-end gap-2 border-t border-ink-100 pt-5">{children}</div>
}
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({ title, subtitle, action, children, className = '' }: ChartCardProps) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export function ChartLegend({ items }: { items: { label: string; icon: LucideIcon }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map(({ label, icon: Icon }) => (
        <span key={label} className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-500">
          <Icon size={12} strokeWidth={2.25} className="text-ink-800" />
          {label}
        </span>
      ))}
    </div>
  )
}
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  supporting: string
  trend?: string
  trendUp?: boolean
  accent?: 'charcoal' | 'dark'
}

export function StatCard({ label, value, icon: Icon, supporting, trend, trendUp = true, accent = 'charcoal' }: StatCardProps) {
  const dark = accent === 'dark'
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${
        dark ? 'border-ink-800 bg-ink-950 text-white' : 'border-ink-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`font-mono text-[10px] font-medium uppercase tracking-[0.16em] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{label}</p>
          <p className={`mt-2.5 font-display text-3xl font-semibold tracking-tight ${dark ? 'text-white' : 'text-ink-950'}`}>{value}</p>
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
            dark ? 'border-ink-700 bg-ink-900 text-ink-200' : 'border-ink-200 bg-ink-50 text-ink-600'
          }`}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
      <div className={`mt-4 flex items-center justify-between text-xs ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
        <span>{supporting}</span>
        {trend && (
          <span className={`inline-flex items-center gap-1 font-medium ${trendUp ? 'text-status-emerald' : 'text-status-red'}`}>
            {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
import { User } from 'lucide-react'
import { Avatar } from './Avatar'

interface TeamCardProps {
  name: string
  rollNo: string
  role: string
}

export function TeamCard({ name, rollNo, role }: TeamCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-ink-200 bg-white p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-ink-800 dark:bg-ink-900 dark:shadow-none">
      <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
        <Avatar label={name} size="lg" className="transition-transform duration-300 group-hover:scale-105" />
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-ink-900 text-white" aria-hidden="true">
          <User size={12} />
        </span>
      </div>
      <h3 className="font-display text-base font-semibold text-ink-950">{name}</h3>
      <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-400">{rollNo}</p>
      <span className="mt-3 inline-flex items-center rounded-full border border-ink-200 bg-ink-50 px-3 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
        {role}
      </span>
    </div>
  )
}
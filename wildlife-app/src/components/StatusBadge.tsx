interface StatusBadgeProps {
  label: string
  tone?: StatusTone
  dot?: boolean
  className?: string
}

export type StatusTone = 'neutral' | 'emerald' | 'red' | 'amber' | 'blue' | 'charcoal' | 'slate'

const tones: Record<StatusTone, string> = {
  neutral: 'bg-ink-100 text-ink-600 border-ink-200',
  emerald: 'bg-status-emerald/10 text-status-emerald border-status-emerald/20',
  red: 'bg-status-red/10 text-status-red border-status-red/20',
  amber: 'bg-status-amber/10 text-status-amber border-status-amber/20',
  blue: 'bg-status-blue/10 text-status-blue border-status-blue/20',
  charcoal: 'bg-ink-900 text-white border-ink-900',
  slate: 'bg-ink-50 text-ink-400 border-ink-200',
}

const dotTones: Record<StatusTone, string> = {
  neutral: 'bg-ink-400',
  emerald: 'bg-status-emerald',
  red: 'bg-status-red',
  amber: 'bg-status-amber',
  blue: 'bg-status-blue',
  charcoal: 'bg-white',
  slate: 'bg-ink-300',
}

const emeraldWords = ['active', 'verified', 'contained', 'resolved', 'healthy', 'available', 'completed', 'good', 'released', 'stable', 'excellent', 'on field duty']
const redWords = ['critical', 'high', 'endangered', 'open', 'injured', 'poaching', 'on hold', 'critically endangered', 'degraded']
const amberWords = ['medium', 'vulnerable', 'under review', 'pending', 'investigating', 'planned', 'fair', 'under observation', 'monitored', 'on leave', 'recovering', 'restricted', 'mitigating', 'under treatment', 'threatened']
const blueWords = ['low', 'least concern', 'near threatened', 'under observation']

function inferTone(value: string): StatusTone {
  const v = value.toLowerCase()
  if (emeraldWords.some((w) => v.includes(w))) return 'emerald'
  if (redWords.some((w) => v.includes(w))) return 'red'
  if (amberWords.some((w) => v.includes(w))) return 'amber'
  if (blueWords.some((w) => v.includes(w))) return 'blue'
  return 'neutral'
}

export function StatusBadge({ label, tone, dot = true, className = '' }: StatusBadgeProps) {
  const resolved = tone ?? inferTone(label)
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${tones[resolved]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotTones[resolved]}`} aria-hidden="true" />}
      {label}
    </span>
  )
}

export function StatusBadgeFor({ value }: { value: string }) {
  return <StatusBadge label={value} tone={inferTone(value)} />
}
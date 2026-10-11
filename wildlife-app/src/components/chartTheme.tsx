import { ArrowRight } from 'lucide-react'

interface TooltipEntry {
  name?: string | number
  value?: number | string
  color?: string
  stroke?: string
  fill?: string
}

interface TooltipViewProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
}

const colors = {
  black: '#17171b',
  gray: '#6b6b73',
  light: '#c3c3ca',
  faint: '#ececf0',
  white: '#ffffff',
}

export const chartPalette = [colors.black, colors.gray, colors.light, colors.faint, '#3d3d45', '#9b9ba3']

export function MonoTooltip({ active, payload, label }: TooltipViewProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 shadow-card">
      {label && <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-xs font-medium text-ink-800">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? entry.stroke ?? entry.fill ?? colors.black }} aria-hidden="true" />
          <span className="capitalize">{entry.name}:</span>
          <span className="ml-auto font-mono">{Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export function IconArrowLink({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 transition-colors group-hover:text-ink-900">
      {label}
      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
    </span>
  )
}

export { colors as chartColors }
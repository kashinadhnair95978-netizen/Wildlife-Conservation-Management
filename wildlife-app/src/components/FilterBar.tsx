import { Filter } from 'lucide-react'

export interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  options: FilterOption[]
  value: string | 'all'
  onChange: (value: string) => void
  label: string
}

export function FilterBar({ options, value, onChange, label }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">
        <Filter size={12} />
        {label}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base w-auto min-w-[10rem] cursor-pointer py-1.5 text-xs font-medium text-ink-700"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function uniqueOptions(values: string[], labelFn?: (v: string) => string): FilterOption[] {
  return Array.from(new Set(values))
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ label: labelFn ? labelFn(v) : v, value: v }))
}
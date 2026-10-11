import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-950 sm:text-[2rem]">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-925">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-ink-950 dark:text-white">
            <Leaf size={15} strokeWidth={1.75} />
            Wildlife Conservation Management System
          </p>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
            Database System for Wildlife Conservation Management
          </p>
        </div>
        <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
          DBMS Project
          <span className="inline-block h-1 w-1 rounded-full bg-ink-300" aria-hidden="true" />
          Group B15
        </p>
      </div>
    </footer>
  )
}
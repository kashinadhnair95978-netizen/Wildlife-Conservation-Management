import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-ink-300 dark:hover:text-white ${className}`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Sun size={14} className={`absolute transition-all duration-300 ${dark ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-1 rotate-90 opacity-0'}`} />
        <Moon size={14} className={`absolute transition-all duration-300 ${dark ? '-translate-y-1 -rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100'}`} />
      </span>
      <span className="text-xs font-medium">{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
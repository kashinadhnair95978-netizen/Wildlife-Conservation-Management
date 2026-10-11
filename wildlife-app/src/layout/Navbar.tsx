import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell } from 'lucide-react'
import { navItemTitles } from '../config/nav'
import { Avatar } from '../components/Avatar'
import { ThemeToggle } from '../components/ThemeToggle'
import { GlobalSearch } from './GlobalSearch'

interface NavbarProps {
  onOpenMobileMenu: () => void
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  const current = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const last = `/${segments[segments.length - 1] ?? ''}`
    return navItemTitles[last] ?? (segments.length > 1 ? navItemTitles[`/${segments[0]}`] : undefined) ?? 'Dashboard'
  }, [location.pathname])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/85 sm:px-6">
        <button type="button" onClick={onOpenMobileMenu} aria-label="Open navigation menu" className="icon-btn lg:hidden">
          <Menu size={19} />
        </button>

        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-display text-[15px] font-semibold text-ink-950 dark:text-white">{current}</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-ink-400 sm:inline">
            / Wildlife Management
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 text-left text-[13px] text-ink-400 transition-colors hover:border-ink-300 hover:bg-white dark:border-ink-700 dark:bg-ink-900 dark:text-ink-500 dark:hover:border-ink-500 dark:hover:bg-ink-800 md:flex"
            aria-label="Open global search"
          >
            <Search size={15} />
            <span className="flex-1">Search species, animals, sightings…</span>
            <kbd className="rounded border border-ink-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-medium text-ink-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-500">/</kbd>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="icon-btn md:hidden"
          >
            <Search size={18} />
          </button>

          <button type="button" aria-label="Notifications" className="icon-btn relative">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-status-red" aria-hidden="true" />
          </button>

          <ThemeToggle className="hidden sm:inline-flex" />

          <button
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="View user profile"
            className="flex items-center gap-2.5 rounded-lg border border-transparent p-1 pr-2 transition-colors hover:border-ink-200 hover:bg-ink-50 dark:hover:border-ink-700 dark:hover:bg-ink-800"
          >
            <Avatar label="Kashinadh Nair" size="sm" />
            <span className="hidden text-left xl:block">
              <span className="block text-xs font-semibold text-ink-900 dark:text-white">Kashinadh Nair</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-400">Forest Officer</span>
            </span>
          </button>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
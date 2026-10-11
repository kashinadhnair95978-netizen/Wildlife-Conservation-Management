import { NavLink } from 'react-router-dom'
import { ChevronsLeft, PawPrint, X } from 'lucide-react'
import { bottomNav, mainNav } from '../config/nav'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`flex items-center gap-3 border-b border-ink-800 ${collapsed ? 'justify-center px-0' : 'px-5'} py-5`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-white">
        <PawPrint size={18} strokeWidth={2} />
      </span>
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-display text-[15px] font-semibold leading-[1.05] tracking-tight text-white">
            WILDLIFE
            <span className="block text-ink-400">CONSERVATION</span>
          </p>
          <p className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-ink-500">Management System</p>
        </div>
      )}
    </div>
  )
}

function NavList() {
  return (
    <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4 scrollbar-dark">
      <ul className="space-y-0.5">
        {mainNav.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              title={item.label}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-white text-ink-950' : 'text-ink-400 hover:bg-ink-800/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-ink-950" aria-hidden="true" />}
                  <item.icon size={17} strokeWidth={isActive ? 2.1 : 1.75} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function BottomList() {
  return (
    <div className="border-t border-ink-800 px-3 py-3">
      <ul className="space-y-0.5">
        {bottomNav.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-white text-ink-950' : 'text-ink-400 hover:bg-ink-800/60 hover:text-white'
                }`
              }
            >
              <item.icon size={17} strokeWidth={1.75} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-ink-925 transition-all duration-300 lg:translate-x-0 lg:static ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-[268px]'
        } ${
          mobileOpen ? 'w-[268px] translate-x-0' : 'w-[268px] -translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between">
          <Brand collapsed={collapsed} />
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-800 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <NavList />
        <BottomList />

        <div className={`hidden border-t border-ink-800 px-4 py-3 lg:block ${collapsed ? 'px-3' : ''}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-medium text-ink-500 transition-colors hover:bg-ink-800 hover:text-white ${collapsed ? 'justify-center' : ''}`}
          >
            <ChevronsLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
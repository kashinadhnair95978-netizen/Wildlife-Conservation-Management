import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
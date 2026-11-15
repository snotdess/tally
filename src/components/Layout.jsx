import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { BottomNav, TabNav } from './Nav'

// The frame around every page: tabs, the notebook, footer.
// <Outlet /> is where the current route's page (a <Spread>) gets drawn.
export default function Layout() {
  const { pathname } = useLocation()

  // Turning to a new page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-dvh px-4 pt-5 pb-28 sm:pt-10 sm:pb-12">
      <div className="mx-auto max-w-xl md:max-w-5xl">
        <TabNav />
        <Outlet />
        <footer className="mt-6 px-1 font-mono text-[11px] tracking-wider text-pencil">
          <span className="font-sans text-sm text-ink">Tally</span> · a habit journal by Destiny Okoro
        </footer>
      </div>
      <BottomNav />
    </div>
  )
}

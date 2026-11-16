import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { EASE } from './Book'
import { BottomNav, TabNav } from './Nav'
import OpeningIntro from './OpeningIntro'
import { useMediaQuery } from '../lib/useMediaQuery'
import { INTRO_OPEN_MS, useOpeningIntro } from '../lib/useOpeningIntro'

// The frame around every page: tabs, the notebook, footer.
// <Outlet /> is where the current route's page (a <Spread>) gets drawn.
export default function Layout() {
  const { pathname } = useLocation()
  const wide = useMediaQuery('(min-width: 768px)')
  const intro = useOpeningIntro(pathname)

  // Tabs, footer and bottom bar appear once the book has opened
  const chromeVisible = !intro.active || intro.phase === 'landed'
  const fade = `transition-opacity duration-500 ${chromeVisible ? 'opacity-100' : 'opacity-0'}`

  // While closed, slide the spread so the book (sitting on the right page) is centred
  const spreadStyle =
    intro.active && wide
      ? {
          transform: `translateX(${intro.phase === 'closed' ? '-25%' : '0'})`,
          transition: `transform ${INTRO_OPEN_MS}ms ${EASE}`,
        }
      : undefined

  // Turning to a new page starts at the top, unless the link points at a
  // section (e.g. /habits#backup), which that page scrolls to itself
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [pathname])

  return (
    // overflow-x-clip: during the intro the cover swings past the left edge on phones
    <div className="min-h-dvh overflow-x-clip px-4 pt-5 pb-28 sm:pt-10 sm:pb-12">
      <div className="mx-auto max-w-xl md:max-w-5xl">
        <div className={fade}>
          <TabNav />
        </div>

        <div className="relative" style={spreadStyle}>
          <Outlet />
          {intro.active && (
            <OpeningIntro phase={intro.phase} wide={wide} onOpened={intro.onOpened} onSkip={intro.skip} />
          )}
        </div>

        <footer className={`mt-6 px-1 font-mono text-[11px] tracking-wider text-pencil ${fade}`}>
          <span className="font-sans text-sm text-ink">Tally</span> · a habit journal by Destiny Okoro
        </footer>
      </div>
      <div className={fade}>
        <BottomNav />
      </div>
    </div>
  )
}

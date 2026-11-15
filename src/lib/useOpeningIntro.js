import { useEffect, useState } from 'react'

// The "notebook opens to today" intro that plays when you open the app.
//
// It plays only when ALL of these are true:
//   • you land on Today ("/"), not a link to some other page
//   • it hasn't played yet in this browser tab (sessionStorage resets per visit)
//   • you haven't just come from the welcome guide (which opens the book itself)
//   • your system doesn't ask for reduced motion
//
// Phases: 'closed' (a brief pause on the cover) → 'opening' → 'landed' (fade out) → 'done'

export const INTRO_HOLD_MS = 300
export const INTRO_OPEN_MS = 1000
export const INTRO_FADE_MS = 220

const SEEN_KEY = 'tally:intro-seen'

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage blocked: the intro simply won't be suppressed. Harmless.
  }
}

function shouldPlay(pathname) {
  if (pathname !== '/') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) === null
  } catch {
    return false
  }
}

export function useOpeningIntro(pathname) {
  // Decided once, on first render. (No side effects here: React may call this twice in development.)
  const [phase, setPhase] = useState(() => (shouldPlay(pathname) ? 'closed' : 'done'))
  const active = phase !== 'done'

  // Remember that it played, so refreshing or switching tabs doesn't replay it
  useEffect(() => {
    if (active) markIntroSeen()
  }, [active])

  // Advance through the timed phases ('opening' ends when the cover's animation does)
  useEffect(() => {
    if (phase === 'closed') {
      const t = setTimeout(() => setPhase('opening'), INTRO_HOLD_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'opening') {
      // Safety net: normally the cover's animation-end moves us on, but if the
      // browser pauses animations (background tab, power saving) never leave
      // the intro stuck on screen.
      const t = setTimeout(() => setPhase('landed'), INTRO_OPEN_MS + 400)
      return () => clearTimeout(t)
    }
    if (phase === 'landed') {
      const t = setTimeout(() => setPhase('done'), INTRO_FADE_MS)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Any key skips it
  useEffect(() => {
    if (!active) return
    const skip = () => setPhase('done')
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [active])

  return {
    phase,
    active,
    skip: () => setPhase('done'),
    onOpened: () => setPhase((p) => (p === 'opening' ? 'landed' : p)),
  }
}

import { Cover } from './Book'
import { INTRO_FADE_MS, INTRO_OPEN_MS } from '../lib/useOpeningIntro'

// Drawn on top of the Today spread while the intro plays.
//
// Wide screens: the closed notebook sits over the RIGHT page, and a patch of
// "desk" hides the left page. (The layout slides the whole spread so the closed
// book starts centred.) The cover swings over to the left, its blank inside lands
// exactly on the left page, and then everything fades to reveal the real page.
// Phones: the cover covers the page and swings off to the left.
export default function OpeningIntro({ phase, wide, onOpened, onSkip }) {
  const coverPhase = phase === 'closed' ? 'closed' : phase === 'opening' ? 'opening' : 'open'

  return (
    <div
      className="absolute inset-0 z-40"
      style={{ opacity: phase === 'landed' ? 0 : 1, transition: `opacity ${INTRO_FADE_MS}ms ease-out` }}
      onPointerDown={onSkip}
      aria-hidden="true"
    >
      {wide && <div className="absolute -top-16 right-1/2 -bottom-16 -left-16 bg-desk" />}

      <div className={`absolute inset-y-0 right-0 ${wide ? 'left-1/2' : 'left-0'}`} style={{ perspective: '2400px' }}>
        <Cover
          phase={coverPhase}
          ms={INTRO_OPEN_MS}
          openAngle={-180}
          insideSurface="paper"
          callToAction={false}
          onDone={onOpened}
        />
      </div>
    </div>
  )
}

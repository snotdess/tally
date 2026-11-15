import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { BasePage, COVER_MS, Cover, Leaf, PAGE_MS } from '../components/Book'
import CheckButton from '../components/CheckButton'
import Tally from '../components/Tally'
import { useHabits } from '../lib/habitsStore'
import { useMediaQuery } from '../lib/useMediaQuery'

// The welcome guide is a notebook you open:
//   closed cover → open it → page 1 "How it works" → turn the page → page 2 "How to start"
// On wide screens the book slides to the centre as it opens so you see a full
// two-page spread. On phones the cover swings off to the left instead.
export default function WelcomePage() {
  const { onboarded, startFresh, startWithSample } = useHabits()
  const navigate = useNavigate()
  const wide = useMediaQuery('(min-width: 768px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const coverMs = reducedMotion ? 1 : COVER_MS
  const pageMs = reducedMotion ? 1 : PAGE_MS

  const [phase, setPhase] = useState('closed') // 'closed' | 'opening' | 'open' | 'closing'
  const [page, setPage] = useState(1) // which step is on the right-hand page
  const [turn, setTurn] = useState(null) // null | 'forward' | 'back'
  const [pageOneOnLeft, setPageOneOnLeft] = useState(false) // page 1 lies turned over on the left
  const [hovering, setHovering] = useState(false)
  const [demoDone, setDemoDone] = useState(false)

  const busy = phase === 'opening' || phase === 'closing' || turn !== null
  const bookOpen = phase === 'opening' || phase === 'open'

  function openBook() {
    if (phase === 'closed') setPhase('opening')
  }

  function next() {
    if (busy) return
    if (phase === 'closed') return openBook()
    if (page === 1) {
      setPage(2) // revealed underneath as page 1 turns over
      setTurn('forward')
    }
  }

  function back() {
    if (busy || phase !== 'open') return
    if (page === 2) setTurn('back')
    else setPhase('closing')
  }

  function skip() {
    if (onboarded) return navigate('/')
    if (busy) return
    if (phase === 'closed') {
      setPage(2)
      setPhase('opening')
    } else if (page === 1) {
      next()
    }
  }

  function onCoverDone() {
    setPhase((p) => (p === 'opening' ? 'open' : p === 'closing' ? 'closed' : p))
  }

  function onTurnDone() {
    if (turn === 'forward') {
      setPageOneOnLeft(true)
    } else {
      setPage(1) // page 1 now covers the right side again
      setPageOneOnLeft(false)
    }
    setTurn(null)
  }

  // Arrow keys turn pages
  useEffect(() => {
    function onKey(e) {
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const pageOne = <HowItWorks done={demoDone} onToggle={() => setDemoDone(!demoDone)} />
  const pageTwo = (
    <GetStarted
      onboarded={onboarded}
      onFresh={() => {
        startFresh()
        navigate('/habits/new?first=1')
      }}
      onSample={() => {
        startWithSample()
        navigate('/')
      }}
      onBack={() => navigate('/')}
    />
  )

  // Sizes: one page is --page-w wide. Wide screens reserve room for two.
  const pageW = wide ? 'min(25rem, calc((100vw - 5rem) / 2))' : 'min(28rem, calc(100vw - 2rem))'
  const pageH = 'clamp(500px, calc(100dvh - 9rem), 640px)'

  return (
    // overflow-x-clip: the open cover hangs off the left on phones; don't allow sideways scrolling
    <div className="flex min-h-dvh flex-col items-center justify-center overflow-x-clip px-4 py-8">
      <div style={{ '--page-w': pageW, '--page-h': pageH, width: wide ? 'calc(var(--page-w) * 2)' : 'var(--page-w)' }}>
        <div className="mb-4 flex h-6 items-center justify-between font-mono text-[11px] tracking-wider text-pencil uppercase">
          <span aria-live="polite">{phase === 'open' && !turn ? `Page ${page} of 2` : ''}</span>
          {!(page === 2 && phase === 'open') && (
            <button
              type="button"
              onClick={skip}
              className="cursor-pointer underline-offset-4 hover:text-ink hover:underline"
            >
              {onboarded ? 'Close guide' : 'Skip intro'}
            </button>
          )}
        </div>

        {/* The book. Hover is tracked here, on an element that doesn't move,
            so lifting the cover can never pull it out from under the cursor. */}
        <div
          className="relative"
          style={{
            width: 'var(--page-w)',
            height: 'var(--page-h)',
            perspective: '2400px',
            transform: wide ? `translateX(${bookOpen ? '100%' : '50%'})` : undefined,
            transition: `transform ${coverMs}ms cubic-bezier(0.55, 0.05, 0.25, 1)`,
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <BasePage coverShadow={!bookOpen} ms={coverMs * 0.7} inert={phase !== 'open' || turn !== null}>
            {page === 1 ? pageOne : pageTwo}
          </BasePage>

          {turn ? (
            <Leaf mode={turn} ms={pageMs} front={pageOne} back={<Recap />} onDone={onTurnDone} />
          ) : (
            pageOneOnLeft && page === 2 && <Leaf mode="turned" front={pageOne} back={<Recap />} />
          )}

          <Cover
            phase={phase}
            lifted={hovering && phase === 'closed'}
            ms={coverMs}
            onOpen={openBook}
            onDone={onCoverDone}
            inside={<InsideCover />}
          />
        </div>

        <nav
          aria-label="Guide"
          className={`mt-6 flex items-center justify-between transition-opacity duration-500 ${
            phase === 'closed' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          inert={phase === 'closed'}
        >
          <button
            type="button"
            onClick={back}
            disabled={busy}
            className="cursor-pointer font-hand text-xl text-pencil hover:text-ink disabled:cursor-default"
          >
            {page === 1 ? '← close' : '← back'}
          </button>
          <span className="flex gap-2" aria-hidden="true">
            {[1, 2].map((s) => (
              <span key={s} className={`size-2 rounded-full transition-colors ${s === page ? 'bg-ink' : 'bg-rule'}`} />
            ))}
          </span>
          {page === 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={busy}
              className="cursor-pointer border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-paper uppercase transition-colors hover:bg-transparent hover:text-ink disabled:cursor-default"
            >
              Turn the page →
            </button>
          ) : (
            <span className="w-32" />
          )}
        </nav>
      </div>
    </div>
  )
}

/* ---------- What's written on the pages ---------- */

function HowItWorks({ done, onToggle }) {
  return (
    <>
      <h2 className="border-b-2 border-ink pb-3 font-display text-4xl font-semibold">How it works</h2>

      <ol className="mt-5 space-y-6">
        <Step n="1" title="Write down a habit">
          Something small you want to do regularly, and the days you plan to do it.
        </Step>

        <Step n="2" title="Cross it off">
          When you've done it, tap the dot. It turns into an <span className="font-hand">×</span>.
          <div className="mt-3 flex items-center gap-3 rounded-[3px] border border-dashed border-pencil/50 bg-paper px-3 py-2">
            <CheckButton
              done={done}
              color="#1f2a44"
              label={done ? 'Undo the example' : 'Cross off the example'}
              onClick={onToggle}
            />
            <span className={`flex-1 font-sans text-lg ${done ? 'text-ink/55' : 'text-ink'}`}>Read 20 pages</span>
            <Tally count={done ? 7 : 6} color="#1f2a44" />
          </div>
          <p className="mt-2 -rotate-1 font-hand text-lg text-redpen">
            {done ? 'That’s it. 7 days in a row.' : '↑ try it: tap the dot'}
          </p>
        </Step>

        <Step n="3" title="Keep the streak going">
          Each planned day in a row adds a tally mark. Miss one and it starts over, but days you didn't plan never count
          against you.
        </Step>
      </ol>
    </>
  )
}

function Step({ n, title, children }) {
  return (
    <li className="grid grid-cols-[1.75rem_1fr] gap-x-2">
      <span className="font-display text-3xl leading-none text-redpen">{n}</span>
      <div>
        <h3 className="font-sans text-xl font-semibold">{title}</h3>
        <div className="mt-1 text-[15px] leading-relaxed text-ink/80">{children}</div>
      </div>
    </li>
  )
}

function GetStarted({ onboarded, onFresh, onSample, onBack }) {
  if (onboarded) {
    return (
      <>
        <h2 className="border-b-2 border-ink pb-3 font-display text-4xl font-semibold">That's the whole idea.</h2>
        <p className="mt-5 leading-relaxed text-ink/80">
          Use <strong className="font-semibold">Today</strong> to cross things off,{' '}
          <strong className="font-semibold">This week</strong> to see and fix the last few days, and{' '}
          <strong className="font-semibold">Habits</strong> to add, change or review a habit.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-7 cursor-pointer border-2 border-ink bg-ink px-5 py-3 font-mono text-xs tracking-[0.15em] text-paper uppercase transition-colors hover:bg-transparent hover:text-ink"
        >
          Back to my notebook
        </button>
      </>
    )
  }

  return (
    <>
      <h2 className="border-b-2 border-ink pb-3 font-display text-4xl font-semibold">How do you want to start?</h2>
      <div className="mt-6 space-y-4">
        <Choice
          onClick={onFresh}
          title="Start my own notebook"
          text="Begin with a blank page and write in your first habit."
          primary
        />
        <Choice
          onClick={onSample}
          title="Look around first"
          text="Open a notebook with a few months of example habits. You can clear it later from Habits."
        />
      </div>
    </>
  )
}

function Choice({ onClick, title, text, primary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group block w-full cursor-pointer rounded-[3px] border-2 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        primary ? 'border-ink bg-ink text-paper hover:bg-ink/90' : 'border-ink/70 bg-paper hover:border-ink hover:bg-white/40'
      }`}
    >
      <span className="flex items-center justify-between font-sans text-xl font-medium">
        {title}
        <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
          →
        </span>
      </span>
      <span className={`mt-1 block text-[15px] leading-snug ${primary ? 'text-paper/75' : 'text-ink/70'}`}>{text}</span>
    </button>
  )
}

// The back of page 1, seen on the left once it's turned
function Recap() {
  return (
    <div className="flex h-full flex-col">
      <h2 className="border-b-2 border-ink pb-3 font-display text-3xl font-semibold">In short</h2>
      <ul className="mt-6 space-y-5">
        <li className="flex items-center gap-4">
          <span className="grid w-10 place-items-center font-display text-3xl leading-none">•</span>
          <span className="font-sans text-lg">write it down</span>
        </li>
        <li className="flex items-center gap-4">
          <span className="grid w-10 place-items-center font-hand text-3xl leading-none text-ink">×</span>
          <span className="font-sans text-lg">cross it off</span>
        </li>
        <li className="flex items-center gap-4">
          <span className="grid w-10 place-items-center">
            <Tally count={4} color="#1f2a44" />
          </span>
          <span className="font-sans text-lg">keep the streak</span>
        </li>
      </ul>
      <p className="mt-auto -rotate-1 font-hand text-xl text-redpen">That's all there is to it →</p>
    </div>
  )
}

// What's written inside the front cover
function InsideCover() {
  return (
    <div className="flex h-full flex-col justify-end p-7 sm:p-9">
      <div className="rotate-1 bg-paper px-5 py-4 shadow-sm">
        <p className="font-mono text-[10px] tracking-wider text-pencil uppercase">If found, please return to</p>
        <p className="mt-2 border-b border-dashed border-pencil/50 pb-1 font-hand text-xl text-ink">
          whoever is building good habits
        </p>
      </div>
    </div>
  )
}

// The 3D notebook used by the welcome guide.
//
// How the 3D works:
// • The book container sets `perspective`, which gives its children depth.
// • A "leaf" (the cover, or a page) is hinged on its left edge
//   (transform-origin: left) and turns with rotateY(). 0° = lying on the
//   right, about -180° = turned over to the left.
// • Each leaf has two faces stacked on top of each other. The back face is
//   pre-rotated 180° and both use `backface-visibility: hidden`, so you only
//   ever see the face pointing at you — just like a real sheet of paper.
// • Motion uses CSS @keyframes (defined in index.css). Their "end" event tells
//   the guide when a turn has finished.

export const EASE = 'cubic-bezier(0.55, 0.05, 0.25, 1)'
export const COVER_MS = 1100
export const PAGE_MS = 850

const COVER_OPEN = -177 // not quite -180, so it rests at a natural angle
const LEAF_TURNED = -178

const hidden = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }
const flipped = { ...hidden, transform: 'rotateY(180deg)' }

// One side of a sheet of paper. `side` is where it sits when you see it,
// so the shading falls on the edge next to the spine.
export function PageFace({ side = 'right', style, inert, children }) {
  return (
    <div
      className={`page absolute inset-0 overflow-hidden ${side === 'right' ? 'rounded-r-[4px]' : 'rounded-l-[4px]'}`}
      style={{ boxShadow: 'none', ...style }}
      inert={inert}
      aria-hidden={inert || undefined}
    >
      <div className="h-full overflow-y-auto overscroll-contain px-6 py-7 [scrollbar-width:thin] sm:px-8 sm:py-8">
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 w-12 from-black/[0.13] to-transparent ${
          side === 'right' ? 'left-0 bg-linear-to-r' : 'right-0 bg-linear-to-l'
        }`}
      />
    </div>
  )
}

// A darkening layer that fades in or out while a face turns, which sells the 3D.
// When not animating it rests at the start (`from`) or, if `atEnd`, the end (`to`).
function Shade({ from, to, ms, play, reverse, atEnd = false }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black"
      style={{
        opacity: play ? undefined : atEnd ? to : from,
        animation: play ? `shade ${ms}ms ${EASE} ${reverse ? 'reverse' : 'normal'} forwards` : undefined,
        '--shade-from': from,
        '--shade-to': to,
      }}
    />
  )
}

// The right-hand page that's always there underneath. It also draws the
// page-edge "thickness" of the closed book and the shadow the cover casts.
export function BasePage({ coverShadow, ms, inert, children }) {
  return (
    <div
      className="absolute inset-0 rounded-r-[4px]"
      style={{
        boxShadow:
          '1px 1px 0 #ece4d3, 2px 2px 0 #e3dac6, 3px 3px 0 #ece4d3, 4px 4px 0 #ddd3be, 0 24px 50px -22px rgb(60 45 20 / 0.45)',
      }}
    >
      <PageFace inert={inert}>{children}</PageFace>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-r-[4px] bg-linear-to-r from-black/40 via-black/10 to-transparent"
        style={{ opacity: coverShadow ? 1 : 0, transition: `opacity ${ms}ms ease-out` }}
      />
    </div>
  )
}

// A page that turns. mode: 'turned' (resting on the left), 'forward' or 'back'.
export function Leaf({ mode, ms, front, back, onDone }) {
  const animating = mode !== 'turned'
  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: 20,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${mode === 'forward' ? 0 : LEAF_TURNED}deg)`,
        animation: animating
          ? `leaf-turn ${ms}ms ${EASE} ${mode === 'back' ? 'reverse' : 'normal'} forwards`
          : undefined,
      }}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone?.()
      }}
    >
      <div className="absolute inset-0" style={hidden}>
        <PageFace inert>{front}</PageFace>
        <Shade from={0} to={0.28} ms={ms} play={animating} reverse={mode === 'back'} atEnd={mode === 'turned'} />
      </div>
      <div className="absolute inset-0" style={flipped}>
        <PageFace side="left" inert>
          {back}
        </PageFace>
        <Shade from={0.28} to={0} ms={ms} play={animating} reverse={mode === 'back'} atEnd={mode === 'turned'} />
      </div>
    </div>
  )
}

// The cover. phase: 'closed' | 'opening' | 'open' | 'closing'.
//   openAngle     — where it comes to rest (-180 lies perfectly flat)
//   insideSurface — 'endpaper' (patterned card) or 'paper' (a blank notebook page)
//   callToAction  — show the pitch + "Open the notebook" button on the front
export function Cover({
  phase,
  lifted = false,
  ms,
  onOpen,
  onDone,
  inside,
  openAngle = COVER_OPEN,
  insideSurface = 'endpaper',
  callToAction = true,
}) {
  const moving = phase === 'opening' || phase === 'closing'
  const angle = phase === 'open' ? openAngle : lifted ? -7 : 0

  return (
    <div
      className="absolute inset-0"
      style={{
        // On top while closed or moving; once open, turned pages lie above it
        zIndex: phase === 'open' ? 10 : 30,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${angle}deg)`,
        '--open-angle': `${openAngle}deg`, // read by the cover-open keyframes
        transition: phase === 'closed' ? `transform 450ms cubic-bezier(0.3, 0.7, 0.4, 1)` : 'none',
        animation: moving ? `${phase === 'opening' ? 'cover-open' : 'cover-close'} ${ms}ms ${EASE} forwards` : undefined,
      }}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone()
      }}
    >
      <div className="absolute inset-0" style={hidden}>
        <CoverFront
          onOpen={onOpen}
          interactive={callToAction && phase === 'closed'}
          callToAction={callToAction}
        />
        <Shade from={0} to={0.45} ms={ms} play={moving} reverse={phase === 'closing'} atEnd={phase === 'open'} />
      </div>
      <div className="absolute inset-0" style={flipped}>
        <CoverInside surface={insideSurface}>{inside}</CoverInside>
        <Shade from={0.45} to={0} ms={ms} play={moving} reverse={phase === 'closing'} atEnd={phase === 'open'} />
      </div>
    </div>
  )
}

function CoverFront({ onOpen, interactive, callToAction }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-l-[3px] rounded-r-[10px] bg-ink p-7 text-paper sm:p-9 ${
        interactive ? 'cursor-pointer' : ''
      }`}
      onClick={interactive ? onOpen : undefined}
      inert={!interactive}
    >
      {/* cloth grain, spine shadow and the elastic band */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 2px)',
        }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-black/35 to-transparent" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-9 w-2.5 bg-[#151c30] shadow-[inset_1px_0_0_rgb(255_255_255/0.06),2px_0_3px_rgb(0_0_0/0.25)]"
      />

      <p className="relative font-mono text-[11px] tracking-[0.25em] text-paper/60 uppercase">No. 01</p>

      <div className="relative mx-auto w-full max-w-[16rem] -rotate-1 rounded-[2px] bg-paper px-6 py-5 text-center text-ink shadow-md">
        <h1 className="font-display text-5xl leading-none font-bold tracking-[0.12em] uppercase">Tally</h1>
        <p className="mt-2 font-mono text-[11px] tracking-[0.3em] text-redpen uppercase">Habit journal</p>
        <div className="mt-4 border-t border-rule pt-2 text-left font-mono text-[10px] tracking-wider text-pencil uppercase">
          belongs to: <span className="font-hand text-base tracking-normal text-ink normal-case">you</span>
        </div>
      </div>

      <div className={`relative ${callToAction ? '' : 'invisible'}`}>
        <p className="mb-5 max-w-[17rem] font-sans text-[17px] leading-snug text-paper/85">
          Write down what you want to do. Cross it off when you do it. Watch the tally marks add up.
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          className="cursor-pointer bg-paper px-5 py-3 font-mono text-xs tracking-[0.15em] text-ink uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
        >
          Open the notebook →
        </button>
      </div>
    </div>
  )
}

function CoverInside({ surface, children }) {
  if (surface === 'paper') {
    return (
      <div
        className="page absolute inset-0 overflow-hidden rounded-l-[4px]"
        style={{ boxShadow: 'inset -16px 0 22px -12px rgb(0 0 0 / 0.14)' }}
        inert
        aria-hidden="true"
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-l-[10px] rounded-r-[3px] bg-[#d9cfb8]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgb(31 42 68 / 0.05) 0 2px, transparent 2px 10px), repeating-linear-gradient(-45deg, rgb(31 42 68 / 0.05) 0 2px, transparent 2px 10px)',
        boxShadow: 'inset -16px 0 22px -12px rgb(0 0 0 / 0.35)',
      }}
      inert
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

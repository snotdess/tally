// An open notebook: two pages side by side from the `md` breakpoint up.
// On phones it folds into one column. `mobile` decides what phones see:
//   'both'  — left page, then right page underneath
//   'left'  — only the left page (the right is extra detail)
//   'right' — only the right page (e.g. a habit you tapped)
export default function Spread({ left, right, mobile = 'both' }) {
  const pagePadding = 'px-5 py-7 sm:px-9 sm:py-10 lg:px-12'

  return (
    <div className="relative md:grid md:min-h-[620px] md:grid-cols-2 md:rounded-[4px] md:shadow-[0_2px_3px_rgb(60_45_20/0.08),0_26px_50px_-22px_rgb(60_45_20/0.45)]">
      <section
        className={`page min-w-0 rounded-[3px] ${pagePadding} sm:rounded-tl-none md:rounded-r-none md:shadow-none ${
          mobile === 'right' ? 'hidden md:block' : ''
        }`}
      >
        {left}
      </section>

      <section
        className={`page min-w-0 rounded-[3px] ${pagePadding} md:mt-0 md:rounded-l-none md:shadow-none ${
          mobile === 'left' ? 'hidden md:block' : mobile === 'right' ? 'sm:rounded-tl-none' : 'mt-5'
        }`}
      >
        {right}
      </section>

      {/* The spine: a soft fold shadow down the middle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-24 -translate-x-1/2 md:block"
        style={{
          background:
            'linear-gradient(to right, transparent, rgb(60 45 20 / 0.07) 40%, rgb(60 45 20 / 0.2) 50%, rgb(60 45 20 / 0.07) 60%, transparent)',
        }}
      />
    </div>
  )
}

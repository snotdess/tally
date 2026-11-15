import { useState } from 'react'
import Bullet from './Bullet'
import Spread from './Spread'
import { INKS, WEEK, describeDays } from '../lib/habits'

const PRESETS = [
  { label: 'every day', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'weekends', days: [0, 6] },
]

const SUGGESTIONS = ['Read 20 pages', 'Drink 2L of water', 'Study for an hour', 'Walk for 30 minutes', 'Journal before bed']

const sameDays = (a, b) => a.length === b.length && a.every((d) => b.includes(d))

// Used for both "new habit" and "edit habit". If `habit` is passed, we're editing.
// `first` = this is the user's very first habit (coming from the welcome guide).
export default function HabitForm({ habit, first = false, onSave, onCancel }) {
  const [name, setName] = useState(habit?.name ?? '')
  const [color, setColor] = useState(habit?.color ?? INKS[0].value)
  const [days, setDays] = useState(habit?.days ?? PRESETS[0].days)
  const [tried, setTried] = useState(false)

  const nameMissing = name.trim() === ''
  const daysMissing = days.length === 0

  function toggleDay(value) {
    setDays((current) => (current.includes(value) ? current.filter((d) => d !== value) : [...current, value]))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setTried(true)
    if (nameMissing || daysMissing) return
    onSave({ name: name.trim(), color, days })
  }

  const form = (
    <form onSubmit={handleSubmit} noValidate>
      {!first && (
        <button
          type="button"
          onClick={onCancel}
          className="mb-3 cursor-pointer font-hand text-xl text-pencil transition-colors hover:text-ink"
        >
          ← back
        </button>
      )}

      <h1 className="border-b-2 border-ink pb-3 font-display text-4xl font-semibold">
        {habit ? 'Edit habit' : first ? 'Your first habit' : 'New habit'}
      </h1>
      {first && (
        <p className="mt-3 leading-relaxed text-ink/75">
          Pick something small enough to do even on a bad day. You can add more later.
        </p>
      )}

      <label className="mt-8 block">
        <span className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">What do you want to do?</span>
        <input
          autoFocus={!habit}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="read 20 pages"
          maxLength={60}
          className="mt-1 block w-full border-0 border-b-2 border-dashed border-pencil/60 bg-transparent py-2 font-display text-2xl placeholder:text-pencil/50 focus:border-solid focus:border-ink focus:outline-none"
          style={{ color }}
        />
        {tried && nameMissing && <span className="mt-1 block font-hand text-redpen">Give it a name first.</span>}
      </label>

      {!habit && (
        <div className="mt-3">
          <span className="font-mono text-[10px] tracking-wider text-pencil uppercase">Ideas:</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setName(s)}
                className={`cursor-pointer rounded-full border px-3 py-1 font-hand text-lg transition-colors ${
                  name === s ? 'border-ink bg-ink text-paper' : 'border-pencil/50 text-ink/75 hover:border-ink hover:text-ink'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <fieldset className="mt-8">
        <legend className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">Colour</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {INKS.map((ink) => (
            <label key={ink.value} className="cursor-pointer" title={ink.name}>
              <input
                type="radio"
                name="ink"
                value={ink.value}
                checked={color === ink.value}
                onChange={() => setColor(ink.value)}
                className="peer sr-only"
              />
              <span className="sr-only">{ink.name}</span>
              {/* An irregular ink blot */}
              <svg
                viewBox="0 0 32 32"
                className="size-9 rounded-full transition-transform peer-checked:scale-110 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
                aria-hidden="true"
              >
                <path
                  d="M16 3c6 0 12 4 13 10s-2 13-8 15-13 1-16-4S2 12 5 8s6-5 11-5z"
                  fill={ink.value}
                  filter="url(#ink-rough)"
                />
                {color === ink.value && (
                  <path d="M10 16.5l4 4 8-9" stroke="#f6f1e6" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                )}
              </svg>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">Which days?</legend>
        <p className="mt-1 text-[15px] text-ink/70">Only these days count toward your streak.</p>
        <div className="mt-3 flex gap-1.5">
          {WEEK.map((d) => {
            const on = days.includes(d.value)
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                aria-pressed={on}
                aria-label={d.label}
                className={`grid size-10 cursor-pointer place-items-center rounded-full border-2 font-mono text-sm transition-colors ${
                  on ? 'border-ink bg-ink text-paper' : 'border-pencil/40 text-pencil hover:border-ink hover:text-ink'
                }`}
              >
                {d.short}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex gap-4 font-hand text-lg">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setDays(p.days)}
              className={`cursor-pointer underline-offset-4 ${
                sameDays(days, p.days) ? 'text-ink underline' : 'text-pencil hover:text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {tried && daysMissing && <span className="mt-2 block font-hand text-redpen">Pick at least one day.</span>}
      </fieldset>

      <div className="mt-10 flex items-center gap-6 border-t border-dashed border-rule pt-5">
        <button
          type="submit"
          className="cursor-pointer border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-paper uppercase transition-colors hover:bg-transparent hover:text-ink"
        >
          {habit ? 'Save changes' : 'Add habit'}
        </button>
        {!first && (
          <button type="button" onClick={onCancel} className="cursor-pointer font-hand text-xl text-pencil hover:text-ink">
            cancel
          </button>
        )}
      </div>
    </form>
  )

  // Form on the left page, a live preview on the right (desktop only)
  return <Spread mobile="left" left={form} right={<Preview name={name} color={color} days={days} />} />
}

// Shows how the habit will look in the notebook while you fill in the form
function Preview({ name, color, days }) {
  return (
    <>
      <header className="border-b-2 border-ink pb-3">
        <p className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">Preview</p>
        <h2 className="font-display text-4xl leading-none font-semibold">How it will look</h2>
      </header>

      <p className="mt-6 font-mono text-[11px] tracking-wider text-pencil uppercase">On your Today page</p>
      <div className="mt-2 flex items-center gap-3 border-y border-dashed border-rule py-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-pencil/55">
          <Bullet done={false} color={color} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-sans text-xl leading-tight ${name.trim() ? '' : 'text-pencil/60'}`}>
            {name.trim() || 'Your habit'}
          </span>
          <span className="font-mono text-[11px] tracking-wider text-pencil uppercase">
            {days.length ? describeDays(days) : 'no days picked'}
          </span>
        </span>
      </div>

      <p className="mt-7 font-mono text-[11px] tracking-wider text-pencil uppercase">Planned days</p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {WEEK.map((d) => {
          const on = days.includes(d.value)
          return (
            <div key={d.value}>
              <span className="block font-mono text-[10px] text-pencil">{d.short}</span>
              <span className="mt-1 grid h-8 place-items-center">
                {on ? (
                  <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
                ) : (
                  <span className="size-[3px] rounded-full bg-rule" />
                )}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-1 font-hand text-lg text-redpen">
        {days.length === 0
          ? 'Pick at least one day.'
          : `${days.length} ${days.length === 1 ? 'day' : 'days'} a week count toward the streak.`}
      </p>

      <div className="mt-8 border-t border-dashed border-rule pt-5">
        <p className="font-mono text-[11px] tracking-wider text-pencil uppercase">Tips for a habit that sticks</p>
        <ul className="mt-3 space-y-2.5 leading-snug text-ink/80">
          <li>
            <span className="font-hand text-redpen">1.</span> Make it small. “Read 10 pages” beats “read more”.
          </li>
          <li>
            <span className="font-hand text-redpen">2.</span> Make it specific, so you know when it's done.
          </li>
          <li>
            <span className="font-hand text-redpen">3.</span> Plan fewer days rather than miss many.
          </li>
        </ul>
      </div>
    </>
  )
}

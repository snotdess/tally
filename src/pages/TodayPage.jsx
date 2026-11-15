import { useState } from 'react'
import { Link } from 'react-router'
import HabitRow from '../components/HabitRow'
import Spread from '../components/Spread'
import WeekGrid from '../components/WeekGrid'
import { weekOf, weekTotals } from '../lib/week'
import { useHabits } from '../lib/habitsStore'
import { currentStreak, isDone, isScheduled } from '../lib/habits'
import { addDays, formatDayMonth, formatWeekday, toKey, today } from '../lib/dates'

function progressNote(done, planned) {
  if (planned === 0) return 'Nothing planned today. Rest counts too.'
  if (done === 0) return 'A fresh page.'
  if (done === planned) return 'All crossed off. Close the book.'
  return `${done} of ${planned} crossed off.`
}

// Left page: today's list.  Right page: this week at a glance + tomorrow.
export default function TodayPage() {
  const { habits } = useHabits()

  if (habits.length === 0) {
    return <Spread mobile="left" left={<EmptyNotebook />} right={<EmptyRight />} />
  }

  return <Spread mobile="left" left={<TodayList />} right={<WeekAtAGlance />} />
}

function TodayHeader() {
  const now = today()
  return (
    <header className="border-b-2 border-ink pb-3">
      <p className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">Today · {formatDayMonth(now)}</p>
      <h1 className="font-display text-5xl leading-none font-semibold lg:text-6xl">{formatWeekday(now)}</h1>
    </header>
  )
}

function TodayList() {
  const { habits, toggle } = useHabits()
  // A short note in red pen after you cross something off
  const [note, setNote] = useState(null)

  const now = today()
  const key = toKey(now)
  const planned = habits.filter((h) => isScheduled(h, now))
  const resting = habits.filter((h) => !isScheduled(h, now))
  const doneCount = planned.filter((h) => isDone(h, now)).length

  function handleToggle(habit) {
    if (isDone(habit, now)) {
      setNote(`Undone. “${habit.name}” is back on the list.`)
    } else {
      const streak = currentStreak(habit) + 1
      setNote(streak > 1 ? `Crossed off. ${streak} days in a row.` : 'Crossed off. Day one.')
    }
    toggle(habit.id, key)
  }

  return (
    <>
      <TodayHeader />

      {planned.length > 0 && <ProgressLine done={doneCount} planned={planned.length} />}

      <p key={note} className="mt-3 min-h-7 -rotate-1 font-hand text-xl text-redpen">
        {note ?? progressNote(doneCount, planned.length)}
      </p>

      {planned.length > 0 && doneCount === 0 && !note && (
        <p className="mt-2 rounded-[3px] border border-dashed border-pencil/50 px-3 py-2 text-[15px] leading-snug text-ink/75">
          Tap the <span className="font-semibold text-ink">circle</span> next to a habit once you've done it. Tap its{' '}
          <span className="font-semibold text-ink">name</span> to see its history.
        </p>
      )}

      <ul className="mt-2">
        {planned.map((h) => (
          <HabitRow key={h.id} habit={h} done={isDone(h, now)} onToggle={() => handleToggle(h)} />
        ))}
      </ul>

      <Link
        to="/habits/new"
        className="mt-5 inline-flex items-center gap-2 border-2 border-ink px-4 py-2.5 font-mono text-xs tracking-[0.15em] uppercase transition-colors hover:bg-ink hover:text-paper"
      >
        <span className="text-base leading-none">+</span> New habit
      </Link>

      {resting.length > 0 && (
        <section className="mt-10">
          <h2 className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">Not planned for today</h2>
          <ul className="mt-1">
            {resting.map((h) => (
              <HabitRow key={h.id} habit={h} done={false} resting />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function WeekAtAGlance() {
  const { habits, toggle } = useHabits()
  const now = today()
  const days = weekOf(now)
  const { planned, kept } = weekTotals(habits, days, now)
  const tomorrow = addDays(now, 1)
  const upNext = habits.filter((h) => isScheduled(h, tomorrow))

  return (
    <>
      <header className="flex items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">At a glance</p>
          <h2 className="font-display text-4xl leading-none font-semibold">This week</h2>
        </div>
        <Link to="/week" className="font-hand text-xl text-pencil hover:text-ink">
          full week →
        </Link>
      </header>

      <p className="mt-4 -rotate-1 font-hand text-xl text-redpen">
        {planned === 0 ? 'Nothing planned yet this week.' : `Kept ${kept} of ${planned} so far.`}
      </p>

      <div className="mt-3">
        <WeekGrid habits={habits} days={days} now={now} onToggle={toggle} />
      </div>

      <section className="mt-10">
        <h3 className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">
          Tomorrow · {formatWeekday(tomorrow)}
        </h3>
        {upNext.length === 0 ? (
          <p className="mt-2 font-sans text-lg text-ink/70">Nothing planned. A day off.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {upNext.map((h) => (
              <li key={h.id} className="flex items-center gap-3 font-sans text-lg text-ink/80">
                <span className="size-2 rounded-full" style={{ backgroundColor: h.color }} aria-hidden="true" />
                {h.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

// A pen line that fills as you cross things off
function ProgressLine({ done, planned }) {
  const pct = Math.round((done / planned) * 100)
  return (
    <div className="mt-5 flex items-center gap-3" aria-label={`${done} of ${planned} done today`} role="img">
      <svg viewBox="0 0 200 8" preserveAspectRatio="none" className="h-2 flex-1" aria-hidden="true">
        <line x1="2" y1="4" x2="198" y2="4" stroke="var(--color-rule)" strokeWidth="3" strokeLinecap="round" />
        {done > 0 && (
          <line
            x1="2"
            y1="4"
            x2={2 + (196 * pct) / 100}
            y2="4"
            stroke="var(--color-ink)"
            strokeWidth="3.4"
            strokeLinecap="round"
            style={{ transition: 'all 0.4s ease-out' }}
          />
        )}
      </svg>
      <span className="font-mono text-xs text-pencil tabular-nums">
        {done}/{planned}
      </span>
    </div>
  )
}

function EmptyNotebook() {
  return (
    <>
      <TodayHeader />
      <div className="py-10">
        <p className="font-display text-3xl">Your notebook is empty.</p>
        <p className="mt-3 max-w-sm leading-relaxed text-ink/75">
          Add a habit and it will show up here on every day you plan to do it. Then just tap it once it's done.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Link
            to="/habits/new"
            className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-5 py-3 font-mono text-xs tracking-[0.15em] text-paper uppercase transition-colors hover:bg-transparent hover:text-ink"
          >
            <span className="text-base leading-none">+</span> Write your first habit
          </Link>
          <Link to="/welcome" className="font-hand text-xl text-pencil underline-offset-4 hover:text-ink hover:underline">
            how does this work?
          </Link>
        </div>
      </div>
    </>
  )
}

function EmptyRight() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <p className="font-hand text-2xl text-pencil">Your week will fill in here</p>
      <p className="mt-1 font-hand text-2xl text-pencil">as you cross things off.</p>
    </div>
  )
}

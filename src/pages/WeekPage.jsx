import { useState } from 'react'
import { Link } from 'react-router'
import Spread from '../components/Spread'
import WeekGrid from '../components/WeekGrid'
import { weekOf, weekTotals } from '../lib/week'
import { useHabits } from '../lib/habitsStore'
import { isDone, isScheduled } from '../lib/habits'
import { formatDayMonth, toKey, today } from '../lib/dates'

// Left page: the week's tracker.  Right page: how the week went.
export default function WeekPage() {
  const { habits, toggle } = useHabits()
  const [weeksBack, setWeeksBack] = useState(0)

  const now = today()
  const days = weekOf(now, weeksBack)
  const { planned, kept } = weekTotals(habits, days, now)

  const title = weeksBack === 0 ? 'This week' : weeksBack === 1 ? 'Last week' : `${weeksBack} weeks ago`
  const range =
    days[0].getMonth() === days[6].getMonth()
      ? `${days[0].getDate()} – ${formatDayMonth(days[6])}`
      : `${formatDayMonth(days[0])} – ${formatDayMonth(days[6])}`

  const left = (
    <>
      <header className="flex items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">{range}</p>
          <h1 className="font-display text-4xl leading-none font-semibold lg:text-5xl">{title}</h1>
        </div>
        <div className="flex gap-1">
          <WeekButton label="Previous week" onClick={() => setWeeksBack(weeksBack + 1)}>
            ‹
          </WeekButton>
          <WeekButton label="Next week" onClick={() => setWeeksBack(weeksBack - 1)} disabled={weeksBack === 0}>
            ›
          </WeekButton>
        </div>
      </header>

      {habits.length === 0 ? (
        <p className="mt-8 leading-relaxed text-ink/75">
          No habits yet.{' '}
          <Link to="/habits/new" className="underline underline-offset-4">
            Add one
          </Link>{' '}
          and your week will fill in here.
        </p>
      ) : (
        <>
          <p className="mt-4 -rotate-1 font-hand text-xl text-redpen">
            {planned === 0 ? 'Nothing was planned this week.' : `Kept ${kept} of ${planned} planned so far.`}
          </p>
          <div className="mt-4">
            <WeekGrid habits={habits} days={days} now={now} onToggle={toggle} />
          </div>
          <p className="mt-6 font-mono text-[11px] leading-relaxed tracking-wider text-pencil">
            × done · • planned, not done · <span className="text-rule">·</span> not planned
            <br />
            Tap any planned day to mark or unmark it.
          </p>
        </>
      )}
    </>
  )

  return <Spread mobile="both" left={left} right={<WeekReview habits={habits} days={days} now={now} />} />
}

function WeekReview({ habits, days, now }) {
  // Per habit: which planned days were kept
  const rows = habits
    .map((h) => {
      const plannedDays = days.filter((d) => d <= now && isScheduled(h, d))
      return { habit: h, plannedDays, kept: plannedDays.filter((d) => isDone(h, d)).length }
    })
    .filter((r) => r.plannedDays.length > 0)

  // Per day: share of planned habits kept
  const dayScores = days
    .filter((d) => d <= now)
    .map((d) => {
      const plannedHere = habits.filter((h) => isScheduled(h, d))
      return { day: d, planned: plannedHere.length, kept: plannedHere.filter((h) => isDone(h, d)).length }
    })
    .filter((s) => s.planned > 0)

  const best = [...dayScores].sort((a, b) => b.kept / b.planned - a.kept / a.planned)[0]
  // Today isn't over yet, so an unfinished today isn't a miss (same rule as streaks)
  const isToday = (d) => toKey(d) === toKey(now)
  const mostMissed = [...rows]
    .map((r) => ({ ...r, missed: r.plannedDays.filter((d) => !isDone(r.habit, d) && !isToday(d)).length }))
    .sort((a, b) => b.missed - a.missed)[0]

  return (
    <>
      <header className="border-b-2 border-ink pb-3">
        <p className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">Looking back</p>
        <h2 className="font-display text-4xl leading-none font-semibold">Week in review</h2>
      </header>

      {rows.length === 0 ? (
        <p className="mt-6 font-sans text-lg text-ink/70">Nothing to review yet.</p>
      ) : (
        <>
          <ul className="mt-5 space-y-4">
            {rows.map(({ habit, plannedDays, kept }) => (
              <li key={habit.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-sans text-lg">{habit.name}</span>
                  <span className="shrink-0 font-mono text-xs text-pencil tabular-nums">
                    {kept}/{plannedDays.length}
                  </span>
                </div>
                <div className="mt-1.5 flex gap-1" aria-hidden="true">
                  {plannedDays.map((d, i) => (
                    <span
                      key={i}
                      className={`h-2 flex-1 rounded-[2px] ${isDone(habit, d) ? '' : 'border border-pencil/45'}`}
                      style={isDone(habit, d) ? { backgroundColor: habit.color } : undefined}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-2 border-t border-dashed border-rule pt-5 font-hand text-xl">
            {best && (
              <p>
                <span className="text-pencil">Best day:</span>{' '}
                {best.day.toLocaleDateString('en-GB', { weekday: 'long' })} ({best.kept} of {best.planned})
              </p>
            )}
            {mostMissed && mostMissed.missed > 0 ? (
              <p>
                <span className="text-pencil">Needs attention:</span> {mostMissed.habit.name} (missed {mostMissed.missed})
              </p>
            ) : (
              <p className="text-redpen">Nothing missed. A clean week.</p>
            )}
          </div>
        </>
      )}
    </>
  )
}

function WeekButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-10 cursor-pointer place-items-center rounded-full border-2 border-ink font-display text-2xl leading-none transition-colors hover:bg-ink hover:text-paper disabled:cursor-default disabled:border-rule disabled:text-rule disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

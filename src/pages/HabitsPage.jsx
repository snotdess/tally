import { Link, Navigate, useParams } from 'react-router'
import HabitDetail from '../components/HabitDetail'
import Spread from '../components/Spread'
import { useHabits } from '../lib/habitsStore'
import { currentStreak, describeDays, isDone, isScheduled } from '../lib/habits'
import { addDays, today } from '../lib/dates'

// Left page: every habit.  Right page: the one you picked.
// Used for both /habits and /habits/:id — the :id decides the right page.
export default function HabitsPage() {
  const { id } = useParams()
  const { habits } = useHabits()
  const selected = id ? habits.find((h) => h.id === id) : null

  if (id && !selected) return <Navigate to="/habits" replace />

  return (
    <Spread
      mobile={selected ? 'right' : 'left'}
      left={<HabitList selectedId={selected?.id} />}
      right={selected ? <HabitDetail key={selected.id} habit={selected} /> : <PickOne hasHabits={habits.length > 0} />}
    />
  )
}

function HabitList({ selectedId }) {
  const { habits, startFresh, startWithSample } = useHabits()
  const now = today()
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(now, i - 6))

  return (
    <>
      <header className="flex items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">
            {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
          </p>
          <h1 className="font-display text-4xl leading-none font-semibold lg:text-5xl">Habits</h1>
        </div>
        <Link
          to="/habits/new"
          className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2.5 font-mono text-xs tracking-[0.15em] text-paper uppercase transition-colors hover:bg-transparent hover:text-ink"
        >
          <span className="text-base leading-none">+</span> New
        </Link>
      </header>

      {habits.length === 0 ? (
        <p className="mt-8 leading-relaxed text-ink/75">
          Nothing written in yet. Start with something small, like “read 10 pages” or “drink a glass of water”.
        </p>
      ) : (
        <div className="@container">
          <div className="mt-4 flex justify-end gap-4 pr-6 font-mono text-[10px] tracking-wider text-pencil uppercase">
            <span className="hidden @min-[22rem]:inline">Last 7 days</span>
            <span className="w-8 text-right">Streak</span>
          </div>
          <ul>
            {habits.map((h) => {
              const active = h.id === selectedId
              return (
                <li key={h.id}>
                  <Link
                    to={`/habits/${h.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`group -mx-2 flex items-center gap-3 border-b border-dashed border-rule px-2 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
                      active ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.03]'
                    }`}
                  >
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: h.color }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-sans text-xl leading-tight underline-offset-4 group-hover:underline ${
                          active ? 'font-medium' : ''
                        }`}
                      >
                        {h.name}
                      </span>
                      <span className="font-mono text-[11px] tracking-wider text-pencil uppercase">
                        {describeDays(h.days)}
                      </span>
                    </span>
                    <WeekStrip habit={h} days={last7} />
                    <span className="w-8 shrink-0 text-right font-display text-2xl">{currentStreak(h)}</span>
                    <span
                      className={`transition-transform group-hover:translate-x-0.5 ${active ? 'text-redpen' : 'text-pencil'}`}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <section className="mt-12 border-t border-dashed border-rule pt-5">
        <h2 className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">This notebook</h2>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-hand text-xl">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Replace your habits with the example notebook?')) startWithSample()
            }}
            className="cursor-pointer text-pencil underline-offset-4 hover:text-ink hover:underline"
          >
            load example habits
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Start a fresh notebook? Every habit and its history will be erased.')) startFresh()
            }}
            className="cursor-pointer text-redpen underline-offset-4 hover:underline"
          >
            erase everything
          </button>
        </div>
      </section>
    </>
  )
}

function PickOne({ hasHabits }) {
  return (
    <div className="flex h-full min-h-60 flex-col items-center justify-center text-center">
      <p className="hidden font-display text-6xl text-rule md:block" aria-hidden="true">
        ←
      </p>
      <p className="mt-2 font-hand text-2xl text-pencil">
        {hasHabits ? 'Pick a habit to see its history.' : 'Your habits will show up here.'}
      </p>
    </div>
  )
}

function WeekStrip({ habit, days }) {
  return (
    <span className="hidden gap-1 @min-[22rem]:flex" aria-hidden="true">
      {days.map((d, i) => {
        const planned = isScheduled(habit, d)
        const done = planned && isDone(habit, d)
        return (
          <span
            key={i}
            className={`size-2.5 rounded-[2px] ${done ? '' : planned ? 'border border-pencil/50' : ''}`}
            style={done ? { backgroundColor: habit.color } : undefined}
          >
            {!planned && <span className="mx-auto mt-[3.5px] block size-[3px] rounded-full bg-rule" />}
          </span>
        )
      })}
    </span>
  )
}

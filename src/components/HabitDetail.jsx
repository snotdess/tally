import { Link, useNavigate } from 'react-router'
import CircledNumber from './CircledNumber'
import Heatmap from './Heatmap'
import { useHabits } from '../lib/habitsStore'
import { currentStreak, describeDays, longestStreak, recentRecord } from '../lib/habits'
import { formatLong, fromKey } from '../lib/dates'

function recordNote({ planned, kept }) {
  if (planned === 0) return 'No planned days yet. Give it a week.'
  if (kept === planned) return `Kept all ${planned} planned days this month. Not one missed.`
  return `Kept ${kept} of the last ${planned} planned days.`
}

// One habit's stats + four months of history. Shown on the right page of Habits.
export default function HabitDetail({ habit }) {
  const { toggle, deleteHabit } = useHabits()
  const navigate = useNavigate()

  const streak = currentStreak(habit)
  const longest = longestStreak(habit)
  const record = recentRecord(habit, 30)

  return (
    <>
      {/* On phones the list isn't visible next to this, so offer a way back */}
      <Link to="/habits" className="mb-3 inline-block font-hand text-xl text-pencil hover:text-ink md:hidden">
        ← all habits
      </Link>

      <header className="border-b-2 border-ink pb-3">
        <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-pencil uppercase">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} aria-hidden="true" />
          <span className="truncate">
            {describeDays(habit.days)} · since {formatLong(fromKey(habit.createdAt))}
          </span>
        </p>
        <h2 className="mt-1 font-display text-4xl leading-tight font-semibold">{habit.name}</h2>
      </header>

      <dl className="mt-6 grid grid-cols-3 items-end gap-2 text-center">
        <div className="flex flex-col-reverse">
          <dt className="mt-1 font-mono text-[10px] tracking-wider text-pencil uppercase">Days in a row</dt>
          <dd>
            <CircledNumber value={streak} />
          </dd>
        </div>
        <div className="flex flex-col-reverse">
          <dt className="mt-1 font-mono text-[10px] tracking-wider text-pencil uppercase">Best run</dt>
          <dd className="grid h-16 place-items-center font-display text-4xl">{longest}</dd>
        </div>
        <div className="flex flex-col-reverse">
          <dt className="mt-1 font-mono text-[10px] tracking-wider text-pencil uppercase">Last 30 days</dt>
          <dd className="grid h-16 place-items-center font-display text-4xl">
            <span>
              {record.rate}
              <span className="text-2xl">%</span>
            </span>
          </dd>
        </div>
      </dl>

      <p className="mt-5 rotate-[-0.6deg] font-hand text-xl text-redpen">{recordNote(record)}</p>

      <section className="mt-8">
        <h3 className="mb-3 font-mono text-xs tracking-[0.2em] text-pencil uppercase">The last four months</h3>
        <Heatmap habit={habit} onToggle={(dayKey) => toggle(habit.id, dayKey)} />
        <p className="mt-3 font-mono text-[11px] leading-relaxed tracking-wider text-pencil">
          Filled = done · empty = missed · dot = not planned.
          <br />
          Forgot to log a day? Tap its square.
        </p>
      </section>

      <div className="mt-8 flex items-center gap-6 border-t border-dashed border-rule pt-5">
        <Link
          to={`/habits/${habit.id}/edit`}
          className="border-2 border-ink px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase transition-colors hover:bg-ink hover:text-paper"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete “${habit.name}”? Its history will be gone.`)) {
              deleteHabit(habit.id)
              navigate('/habits')
            }
          }}
          className="cursor-pointer font-hand text-xl text-redpen underline decoration-dashed underline-offset-4 hover:decoration-solid"
        >
          delete habit
        </button>
      </div>
    </>
  )
}

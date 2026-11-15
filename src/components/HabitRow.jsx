import { Link } from 'react-router'
import CheckButton from './CheckButton'
import Tally from './Tally'
import { currentStreak, describeDays } from '../lib/habits'

// One line in today's list:  (•)  Habit name            |||| streak
export default function HabitRow({ habit, done, resting = false, onToggle }) {
  const streak = currentStreak(habit)

  return (
    <li className="flex items-center gap-3 border-b border-dashed border-rule py-3">
      {resting ? (
        <span className="grid size-11 shrink-0 place-items-center font-hand text-2xl text-pencil" aria-hidden="true">
          ›
        </span>
      ) : (
        <CheckButton
          done={done}
          color={habit.color}
          label={done ? `Undo ${habit.name}` : `Mark ${habit.name} as done`}
          onClick={onToggle}
        />
      )}

      <Link
        to={`/habits/${habit.id}`}
        className="group min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        <span
          className={`block truncate font-sans text-xl leading-tight decoration-1 underline-offset-4 group-hover:underline ${
            done || resting ? 'text-ink/55' : 'text-ink'
          }`}
        >
          {habit.name}
        </span>
        <span className="font-mono text-[11px] tracking-wider text-pencil uppercase">{describeDays(habit.days)}</span>
      </Link>

      <div className="flex w-16 shrink-0 flex-col items-end gap-0.5">
        <Tally count={streak} color={habit.color} />
        <span className="font-mono text-[9px] tracking-wider text-pencil uppercase">
          {streak === 0 ? 'no streak' : 'streak'}
        </span>
      </div>
    </li>
  )
}

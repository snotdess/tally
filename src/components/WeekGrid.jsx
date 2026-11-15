import { Link } from 'react-router'
import CheckButton from './CheckButton'
import { isDone, isScheduled } from '../lib/habits'
import { formatLong, toKey } from '../lib/dates'

// Habits down the side, seven days across. Used on Today (right page) and Week.
//
// `@container` makes this respond to the width of ITS OWN BOX, not the screen,
// so it lays out well on a full phone screen and on half of an open notebook.
// Narrow box: each habit's name gets its own line above its days.
// Wide box (@md = 28rem+): names sit in a column on the left.
export default function WeekGrid({ habits, days, now, onToggle }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-7 items-center @md:grid-cols-[minmax(0,1fr)_repeat(7,2.5rem)]">
        <span className="hidden @md:block" />
        {days.map((d) => {
          const isToday = toKey(d) === toKey(now)
          return (
            <div key={toKey(d)} className="pb-2 text-center">
              <span className="block font-mono text-[10px] text-pencil uppercase">
                {d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2)}
              </span>
              <span
                className={`mx-auto mt-0.5 grid size-7 place-items-center rounded-full font-sans text-base ${
                  isToday ? 'border-2 border-redpen text-redpen' : ''
                }`}
              >
                {d.getDate()}
              </span>
            </div>
          )
        })}

        {habits.map((h) => (
          <div key={h.id} className="contents">
            <Link
              to={`/habits/${h.id}`}
              className="col-span-7 block truncate border-t border-dashed border-rule pt-3 pb-1 font-sans text-[17px] leading-tight underline-offset-4 hover:underline @md:col-span-1 @md:py-3 @md:pr-2"
              title={h.name}
            >
              <span
                className="mr-1.5 inline-block size-2 rounded-full align-middle"
                style={{ backgroundColor: h.color }}
                aria-hidden="true"
              />
              {h.name}
            </Link>
            {days.map((d) => (
              <div
                key={toKey(d)}
                className="grid place-items-center pb-2 @md:border-t @md:border-dashed @md:border-rule @md:py-2"
              >
                <DayCell habit={h} day={d} now={now} onToggle={() => onToggle(h.id, toKey(d))} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DayCell({ habit, day, now, onToggle }) {
  if (day > now) return <span className="size-8" />
  if (!isScheduled(habit, day)) {
    return (
      <span className="grid size-8 place-items-center" title={`${formatLong(day)}: not planned`}>
        <span className="size-[3px] rounded-full bg-rule" />
      </span>
    )
  }
  const done = isDone(habit, day)
  return (
    <CheckButton
      small
      done={done}
      color={habit.color}
      label={`${habit.name}, ${formatLong(day)}: ${done ? 'done. Tap to undo' : 'not done. Tap to mark done'}`}
      onClick={onToggle}
    />
  )
}

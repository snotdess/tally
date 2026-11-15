import { isDone, isScheduled } from '../lib/habits'
import { addDays, formatLong, formatShortMonth, toKey, today } from '../lib/dates'

const WEEKS = 17
const ROW_LABELS = ['M', '', 'W', '', 'F', '', 'S']

// Little offsets so inked squares don't look machine-perfect
const tilt = (i) => ((i * 37) % 7) - 3

// A grid of the last ~4 months: one column per week, Monday at the top.
// Tap any planned day to fix it (e.g. you forgot to log yesterday).
export default function Heatmap({ habit, onToggle }) {
  const now = today()
  const mondayOffset = (now.getDay() + 6) % 7
  const start = addDays(now, -mondayOffset - (WEEKS - 1) * 7)

  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i))

  // Month label above the column that contains the 1st of that month
  const monthLabels = Array.from({ length: WEEKS }, (_, w) => {
    const first = cells.slice(w * 7, w * 7 + 7).find((d) => d.getDate() === 1)
    return first ? formatShortMonth(first) : ''
  })
  // Also label the very first column, unless a new month starts right after it (they'd overlap)
  if (!monthLabels[0] && !monthLabels[1] && !monthLabels[2]) monthLabels[0] = formatShortMonth(cells[0])

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-grid grid-cols-[auto_1fr] gap-x-2">
        <div />
        <div className="grid grid-flow-col gap-[2px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 14px)` }}>
          {monthLabels.map((m, i) => (
            <span key={i} className="h-5 font-hand text-base whitespace-nowrap text-pencil">
              {m}
            </span>
          ))}
        </div>

        <div className="grid grid-rows-7 gap-[2px] font-mono text-[10px] text-pencil">
          {ROW_LABELS.map((l, i) => (
            <span key={i} className="flex h-[14px] items-center">
              {l}
            </span>
          ))}
        </div>

        <div className="grid grid-flow-col grid-rows-7 gap-[2px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 14px)` }}>
          {cells.map((day, i) => {
            const future = day > now
            const planned = !future && isScheduled(habit, day)
            const done = planned && isDone(habit, day)
            const isToday = toKey(day) === toKey(now)
            const label = `${formatLong(day)}: ${done ? 'done' : planned ? 'missed' : 'not planned'}`

            if (!planned) {
              return (
                <span key={i} className="grid size-[14px] place-items-center" title={future ? undefined : label}>
                  {!future && <span className="size-[3px] rounded-full bg-rule" />}
                </span>
              )
            }

            return (
              <button
                key={i}
                type="button"
                title={label}
                aria-label={`${label}. Tap to ${done ? 'undo' : 'mark done'}.`}
                aria-pressed={done}
                onClick={() => onToggle(toKey(day))}
                className={`size-[14px] cursor-pointer transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-ink ${
                  done ? '' : 'border border-pencil/45'
                } ${isToday ? 'outline-2 outline-offset-1 outline-redpen' : ''}`}
                style={
                  done
                    ? {
                        backgroundColor: habit.color,
                        borderRadius: '3px 2px 4px 2px',
                        transform: `rotate(${tilt(i)}deg)`,
                        opacity: 0.88,
                      }
                    : { borderRadius: 2 }
                }
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

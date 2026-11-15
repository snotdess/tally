// The "rules" of a habit: when it's scheduled, whether it's done, and streaks.
//
// A habit looks like this:
// {
//   id: "abc",
//   name: "Read 20 pages",
//   color: "#1f2a44",
//   days: [1, 2, 3, 4, 5],   // which weekdays it's planned: 0 = Sunday ... 6 = Saturday
//   createdAt: "2026-08-01",
//   log: { "2026-11-14": true, ... }   // days it was crossed off
// }

import { addDays, toKey, today } from './dates'

// Ink colours a habit can be written in
export const INKS = [
  { name: 'Navy', value: '#1f2a44' },
  { name: 'Red pen', value: '#b53a2a' },
  { name: 'Moss', value: '#2f6b4a' },
  { name: 'Ochre', value: '#a8741a' },
  { name: 'Plum', value: '#6b3a5e' },
  { name: 'Teal', value: '#1f6670' },
]

// Monday-first, like most paper planners
export const WEEK = [
  { value: 1, short: 'M', label: 'Monday' },
  { value: 2, short: 'T', label: 'Tuesday' },
  { value: 3, short: 'W', label: 'Wednesday' },
  { value: 4, short: 'T', label: 'Thursday' },
  { value: 5, short: 'F', label: 'Friday' },
  { value: 6, short: 'S', label: 'Saturday' },
  { value: 0, short: 'S', label: 'Sunday' },
]

export function isScheduled(habit, date) {
  return habit.days.includes(date.getDay()) && toKey(date) >= habit.createdAt
}

export function isDone(habit, date) {
  return Boolean(habit.log[toKey(date)])
}

// Consecutive planned days crossed off, counting back from today.
// If today is planned but not done YET, the streak isn't broken — we start from yesterday.
export function currentStreak(habit, now = today()) {
  let day = now
  if (isScheduled(habit, day) && !isDone(habit, day)) day = addDays(day, -1)

  let count = 0
  while (toKey(day) >= habit.createdAt) {
    if (isScheduled(habit, day)) {
      if (!isDone(habit, day)) break
      count++
    }
    day = addDays(day, -1)
  }
  return count
}

export function longestStreak(habit, now = today()) {
  let best = 0
  let run = 0
  for (let day = fromCreated(habit); day <= now; day = addDays(day, 1)) {
    if (!isScheduled(habit, day)) continue
    if (isDone(habit, day)) {
      run++
      best = Math.max(best, run)
    } else if (toKey(day) !== toKey(now)) {
      run = 0 // an unfinished *today* doesn't break the run
    }
  }
  return best
}

// How many planned days in the last `span` days were kept
export function recentRecord(habit, span = 30, now = today()) {
  let planned = 0
  let kept = 0
  for (let i = 0; i < span; i++) {
    const day = addDays(now, -i)
    if (!isScheduled(habit, day)) continue
    // Don't count today against you until it's over
    if (i === 0 && !isDone(habit, day)) continue
    planned++
    if (isDone(habit, day)) kept++
  }
  return { planned, kept, rate: planned ? Math.round((kept / planned) * 100) : 0 }
}

export function describeDays(days) {
  const set = [...days].sort().join(',')
  if (days.length === 7) return 'every day'
  if (set === '1,2,3,4,5') return 'weekdays'
  if (set === '0,6') return 'weekends'
  return WEEK.filter((d) => days.includes(d.value))
    .map((d) => d.label.slice(0, 3))
    .join(', ')
}

function fromCreated(habit) {
  const [y, m, d] = habit.createdAt.split('-').map(Number)
  return new Date(y, m - 1, d)
}

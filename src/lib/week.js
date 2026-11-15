import { isDone, isScheduled } from './habits'

// Helpers shared by pages that show a week
export function weekOf(now, weeksBack = 0) {
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - weeksBack * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function weekTotals(habits, days, now) {
  let planned = 0
  let kept = 0
  for (const h of habits) {
    for (const d of days) {
      if (d > now || !isScheduled(h, d)) continue
      planned++
      if (isDone(h, d)) kept++
    }
  }
  return { planned, kept }
}

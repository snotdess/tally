// Sample pages so a first-time visitor (e.g. someone viewing your portfolio)
// sees a lived-in notebook instead of an empty screen.

import { addDays, toKey, today } from './dates'
import { INKS } from './habits'

const SAMPLES = [
  { name: 'Read 20 pages', color: INKS[0].value, days: [0, 1, 2, 3, 4, 5, 6], rate: 0.8, since: 130, tail: 12 },
  { name: 'Study JavaScript for an hour', color: INKS[1].value, days: [1, 2, 3, 4, 5], rate: 0.72, since: 110, tail: 4 },
  { name: 'Walk outside', color: INKS[2].value, days: [0, 1, 2, 3, 4, 5, 6], rate: 0.6, since: 125, tail: 2, doneToday: true },
  { name: 'Call home', color: INKS[3].value, days: [0, 3], rate: 0.9, since: 90, tail: 3 },
]

// A tiny seeded random generator, so the sample data looks the same every time
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeSampleHabits() {
  const now = today()
  const random = seeded(42)

  return SAMPLES.map((s, i) => {
    const log = {}
    const start = addDays(now, -s.since)
    const planned = []

    for (let day = start; day < now; day = addDays(day, 1)) {
      if (!s.days.includes(day.getDay())) continue
      planned.push(day)
      if (random() < s.rate) log[toKey(day)] = true
    }
    // Make the most recent few planned days a clean streak
    planned.slice(-s.tail).forEach((day) => (log[toKey(day)] = true))
    // ...and break it just before, so the streak number is believable
    const before = planned[planned.length - s.tail - 1]
    if (before) delete log[toKey(before)]

    if (s.doneToday && s.days.includes(now.getDay())) log[toKey(now)] = true

    return {
      id: `sample-${i}`,
      name: s.name,
      color: s.color,
      days: s.days,
      createdAt: toKey(start),
      log,
    }
  })
}

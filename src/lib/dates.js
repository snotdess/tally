// Small date helpers. We store days as "YYYY-MM-DD" strings ("keys") in the
// user's LOCAL time zone, so "today" always means the user's today.

export function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, n) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + n)
  return copy
}

export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.round((date - start) / 86_400_000)
}

export const formatWeekday = (d) => d.toLocaleDateString('en-GB', { weekday: 'long' })
export const formatDayMonth = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
export const formatMonthYear = (d) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
export const formatShortMonth = (d) => d.toLocaleDateString('en-GB', { month: 'short' })
export const formatLong = (d) =>
  d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

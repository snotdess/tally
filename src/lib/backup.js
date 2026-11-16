// Backups: save the whole notebook to a file, and load it back.
//
// A backup file looks like:
// {
//   "app": "tally",
//   "version": 1,
//   "exportedAt": "2026-11-16T09:30:00.000Z",
//   "habits": [ { id, name, color, days, createdAt, log }, ... ]
// }
//
// Restoring treats the file as untrusted: anything malformed is rejected with a
// plain-language message, and only the fields Tally knows about are kept.

import { fromKey, toKey } from './dates'

export const BACKUP_VERSION = 1
export const REMIND_AFTER_DAYS = 30
const MAX_FILE_BYTES = 5 * 1024 * 1024 // far larger than any real notebook

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const HEX_COLOR = /^#[0-9a-f]{6}$/i

// "2026-02-31" matches the pattern but isn't a real date, so round-trip it to be sure
const isDayKey = (value) => typeof value === 'string' && DAY_KEY.test(value) && toKey(fromKey(value)) === value

export function backupFileName(date = new Date()) {
  return `tally-backup-${toKey(date)}.json`
}

export function createBackup(habits, now = new Date()) {
  return { app: 'tally', version: BACKUP_VERSION, exportedAt: now.toISOString(), habits }
}

// Starts a download of the backup file in the browser
export function downloadBackup(habits) {
  const json = JSON.stringify(createBackup(habits), null, 2)
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = backupFileName()
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const fail = (error) => ({ ok: false, error })

// Reads a File the user picked. Resolves to { ok, habits, exportedAt } or { ok: false, error }.
export async function readBackupFile(file) {
  if (file.size > MAX_FILE_BYTES) return fail('That file is too large to be a Tally backup.')
  let text
  try {
    text = await file.text()
  } catch {
    return fail("That file couldn't be opened. Try choosing it again.")
  }
  return parseBackup(text)
}

export function parseBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return fail("That file isn't a Tally backup.")
  }

  if (!data || typeof data !== 'object' || data.app !== 'tally' || !Array.isArray(data.habits)) {
    return fail("That file isn't a Tally backup.")
  }
  if (typeof data.version !== 'number' || data.version > BACKUP_VERSION) {
    return fail('That backup was made by a newer version of Tally. Refresh the page and try again.')
  }

  const habits = []
  const ids = new Set()
  for (const [i, raw] of data.habits.entries()) {
    const habit = cleanHabit(raw)
    if (!habit || ids.has(habit.id)) {
      return fail(`Habit ${i + 1} in that file is damaged, so nothing was restored.`)
    }
    ids.add(habit.id)
    habits.push(habit)
  }

  const exportedAt = typeof data.exportedAt === 'string' && !Number.isNaN(Date.parse(data.exportedAt))
    ? new Date(data.exportedAt)
    : null

  return { ok: true, habits, exportedAt }
}

// Returns a clean copy of a habit, or null if it isn't valid
function cleanHabit(raw) {
  if (!raw || typeof raw !== 'object') return null
  const { id, name, color, days, createdAt, log } = raw

  if (typeof id !== 'string' || id.length === 0 || id.length > 100) return null
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 200) return null
  if (typeof color !== 'string' || !HEX_COLOR.test(color)) return null
  if (!Array.isArray(days) || days.length === 0) return null
  if (!days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) return null
  if (!isDayKey(createdAt)) return null
  if (!log || typeof log !== 'object' || Array.isArray(log)) return null

  const cleanLog = {}
  for (const [day, done] of Object.entries(log)) {
    if (done === true && isDayKey(day)) cleanLog[day] = true
  }

  return { id, name: name.trim(), color, days: [...new Set(days)], createdAt, log: cleanLog }
}

// Should Today nudge the user to save a copy?
// Not for an empty notebook or the example habits, and not until a month has
// passed since the last copy (or since they started, if they've never saved one).
export function needsBackupReminder(habits, lastBackupAt, now = new Date()) {
  if (habits.length === 0) return false
  if (habits.every((h) => h.id.startsWith('sample-'))) return false

  const since = lastBackupAt
    ? new Date(lastBackupAt)
    : fromKey(habits.map((h) => h.createdAt).sort()[0])

  return (now - since) / 86_400_000 >= REMIND_AFTER_DAYS
}

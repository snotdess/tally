import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useHabits } from '../lib/habitsStore'
import { backupFileName, downloadBackup, readBackupFile } from '../lib/backup'

const longDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const habitCount = (n) => `${n} ${n === 1 ? 'habit' : 'habits'}`

// "Your notebook" on the Habits page: save a copy, restore from a copy,
// load the examples or start over. Linked to as /habits#backup.
export default function NotebookPanel() {
  const { habits, lastBackupAt, markBackedUp, restoreHabits, startFresh, startWithSample } = useHabits()
  const { hash } = useLocation()
  const sectionRef = useRef(null)
  const fileRef = useRef(null)

  // What the panel is showing:
  //   null | { type: 'saved', fileName } | { type: 'error', message }
  //   | { type: 'confirm', backup } | { type: 'restored', count, date }
  const [status, setStatus] = useState(null)

  // Arriving from the reminder on Today: bring this section into view
  useEffect(() => {
    if (hash === '#backup') sectionRef.current?.scrollIntoView({ block: 'start' })
  }, [hash])

  function save() {
    downloadBackup(habits)
    markBackedUp()
    setStatus({ type: 'saved', fileName: backupFileName() })
  }

  async function onFileChosen(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // so picking the same file again still triggers a change
    if (!file) return
    const result = await readBackupFile(file)
    setStatus(result.ok ? { type: 'confirm', backup: result } : { type: 'error', message: result.error })
  }

  function confirmRestore() {
    const { habits: restored, exportedAt } = status.backup
    restoreHabits(restored)
    markBackedUp() // the notebook now matches a copy the user has
    setStatus({ type: 'restored', count: restored.length, date: exportedAt })
  }

  return (
    <section ref={sectionRef} id="backup" className="mt-12 scroll-mt-6 border-t border-dashed border-rule pt-5">
      <h2 className="font-mono text-xs tracking-[0.2em] text-pencil uppercase">Your notebook</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/75">
        It's saved in this browser only. Keep a copy so you can move it to another device, or bring it back if it's
        ever lost.
      </p>
      <p className="mt-2 font-mono text-[11px] tracking-wider text-pencil">
        {lastBackupAt ? `Last copy saved: ${longDate(new Date(lastBackupAt))}` : 'No copy saved yet'}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={habits.length === 0}
          className="cursor-pointer border-2 border-ink bg-ink px-4 py-2.5 font-mono text-xs tracking-[0.15em] text-paper uppercase transition-colors hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:border-rule disabled:bg-rule disabled:text-paper"
        >
          Save a copy
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer border-2 border-ink px-4 py-2.5 font-mono text-xs tracking-[0.15em] uppercase transition-colors hover:bg-ink hover:text-paper"
        >
          Restore from a copy
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileChosen}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      <div role="status" aria-live="polite" className="mt-4">
        {status?.type === 'saved' && (
          <p className="font-hand text-xl text-redpen">Saved. Look for {status.fileName} in your downloads.</p>
        )}

        {status?.type === 'error' && <p className="font-hand text-xl text-redpen">{status.message}</p>}

        {status?.type === 'restored' && (
          <p className="font-hand text-xl text-redpen">
            Restored {habitCount(status.count)}
            {status.date ? ` from your copy of ${longDate(status.date)}` : ''}.
          </p>
        )}

        {status?.type === 'confirm' && (
          <div className="rounded-[3px] border-2 border-redpen/70 bg-paper px-4 py-3">
            <p className="text-[15px] leading-relaxed text-ink">
              This copy {status.backup.exportedAt ? `is from ${longDate(status.backup.exportedAt)} and ` : ''}
              has <strong className="font-semibold">{habitCount(status.backup.habits.length)}</strong>.{' '}
              {habits.length > 0
                ? `Restoring replaces everything in this notebook right now (${habitCount(habits.length)}).`
                : 'They’ll be added to this empty notebook.'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={confirmRestore}
                className="cursor-pointer border-2 border-redpen bg-redpen px-4 py-2 font-mono text-xs tracking-[0.15em] text-paper uppercase transition-colors hover:bg-transparent hover:text-redpen"
              >
                {habits.length > 0 ? 'Replace my notebook' : 'Restore'}
              </button>
              <button
                type="button"
                onClick={() => setStatus(null)}
                className="cursor-pointer font-hand text-xl text-pencil hover:text-ink"
              >
                cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-hand text-xl">
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
  )
}

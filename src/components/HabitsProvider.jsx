import { useEffect, useState } from 'react'
import { HabitsContext } from '../lib/habitsStore'
import { toKey, today } from '../lib/dates'
import { makeSampleHabits } from '../lib/sample'

const STORAGE_KEY = 'tally:v1'

// Saved shape: { onboarded: true, habits: [...] }
function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      const data = JSON.parse(saved)
      if (Array.isArray(data)) return { onboarded: true, habits: data } // older format
      return { onboarded: Boolean(data.onboarded), habits: data.habits ?? [] }
    }
  } catch {
    // Storage blocked or corrupt: start as a first-time visitor
  }
  return { onboarded: false, habits: [] }
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

export default function HabitsProvider({ children }) {
  const [state, setState] = useState(load)

  // Save on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Private mode etc. The app still works, it just won't remember.
    }
  }, [state])

  const setHabits = (update) => setState((s) => ({ ...s, habits: update(s.habits) }))

  const store = {
    habits: state.habits,
    onboarded: state.onboarded,

    addHabit(data) {
      setHabits((list) => [...list, { id: newId(), createdAt: toKey(today()), log: {}, ...data }])
    },

    updateHabit(id, data) {
      setHabits((list) => list.map((h) => (h.id === id ? { ...h, ...data } : h)))
    },

    deleteHabit(id) {
      setHabits((list) => list.filter((h) => h.id !== id))
    },

    // Cross off a day, or un-cross it if it was already done
    toggle(id, dayKey) {
      setHabits((list) =>
        list.map((h) => {
          if (h.id !== id) return h
          const log = { ...h.log }
          if (log[dayKey]) delete log[dayKey]
          else log[dayKey] = true
          return { ...h, log }
        }),
      )
    },

    startFresh() {
      setState({ onboarded: true, habits: [] })
    },

    startWithSample() {
      setState({ onboarded: true, habits: makeSampleHabits() })
    },
  }

  return <HabitsContext.Provider value={store}>{children}</HabitsContext.Provider>
}

// React "context" lets any component reach the habits without passing them
// through every layer of props. <HabitsProvider> fills it; useHabits() reads it.
import { createContext, useContext } from 'react'

export const HabitsContext = createContext(null)

export function useHabits() {
  const store = useContext(HabitsContext)
  if (!store) throw new Error('useHabits() must be used inside <HabitsProvider>')
  return store
}

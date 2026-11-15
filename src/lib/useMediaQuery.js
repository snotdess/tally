import { useSyncExternalStore } from 'react'

// True while a CSS media query matches, e.g. useMediaQuery('(min-width: 768px)').
// useSyncExternalStore keeps React in sync with the browser when it changes.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

import { useLocation, useNavigate } from 'react-router'

// Go back one page — or to `fallback` if the user landed here directly
// (e.g. opened a link), so "back" never leaves the app.
export function useGoBack(fallback = '/') {
  const navigate = useNavigate()
  const location = useLocation()
  return () => (location.key === 'default' ? navigate(fallback) : navigate(-1))
}

import { Navigate, Route, Routes } from 'react-router'
import InkFilters from './components/InkFilters'
import Layout from './components/Layout'
import { useHabits } from './lib/habitsStore'
import WelcomePage from './pages/WelcomePage'
import TodayPage from './pages/TodayPage'
import WeekPage from './pages/WeekPage'
import HabitsPage from './pages/HabitsPage'
import NewHabitPage from './pages/NewHabitPage'
import EditHabitPage from './pages/EditHabitPage'

// Each <Route> maps a URL to a page. Pages inside <Layout> get the
// notebook page + navigation around them; the welcome guide stands alone.
export default function App() {
  const { onboarded } = useHabits()

  return (
    <>
      <InkFilters />
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />

        {/* First-time visitors are sent to the guide before anything else */}
        <Route element={onboarded ? <Layout /> : <Navigate to="/welcome" replace />}>
          <Route index element={<TodayPage />} />
          <Route path="week" element={<WeekPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="habits/new" element={<NewHabitPage />} />
          <Route path="habits/:id" element={<HabitsPage />} />
          <Route path="habits/:id/edit" element={<EditHabitPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

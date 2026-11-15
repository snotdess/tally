import { Navigate, useNavigate, useParams } from 'react-router'
import HabitForm from '../components/HabitForm'
import { useHabits } from '../lib/habitsStore'

export default function EditHabitPage() {
  const { id } = useParams()
  const { habits, updateHabit } = useHabits()
  const navigate = useNavigate()
  const habit = habits.find((h) => h.id === id)

  if (!habit) return <Navigate to="/habits" replace />

  return (
    <HabitForm
      habit={habit}
      onSave={(data) => {
        updateHabit(habit.id, data)
        navigate(`/habits/${habit.id}`)
      }}
      onCancel={() => navigate(`/habits/${habit.id}`)}
    />
  )
}

import { useNavigate, useSearchParams } from 'react-router'
import HabitForm from '../components/HabitForm'
import { useHabits } from '../lib/habitsStore'
import { useGoBack } from '../lib/useGoBack'

export default function NewHabitPage() {
  const { addHabit } = useHabits()
  const navigate = useNavigate()
  const goBack = useGoBack('/')
  const [params] = useSearchParams()

  return (
    <HabitForm
      first={params.has('first')}
      onSave={(data) => {
        addHabit(data)
        navigate('/')
      }}
      onCancel={goBack}
    />
  )
}

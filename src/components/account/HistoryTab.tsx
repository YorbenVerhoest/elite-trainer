import { useEffect } from 'react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { WorkoutHistory } from '@/components/WorkoutHistory'

export function HistoryTab() {
  const { history, historyLoading, fetchHistory } = useWorkouts()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <div className="animate-fade-up" style={{ animationFillMode: 'both' }}>
      <WorkoutHistory workouts={history} loading={historyLoading} />
    </div>
  )
}

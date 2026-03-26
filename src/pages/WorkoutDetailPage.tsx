import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/contexts/AuthContext'
import { WorkoutDetail } from '@/components/WorkoutDetail'
import { AppLogo } from '@/components/AppLogo'
import { PageShell } from '@/components/PageShell'
import { Spinner } from '@/components/Spinner'
import type { SavedWorkout } from '@/types/workout'

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { signOut } = useAuth()
  const { fetchWorkout } = useWorkouts()
  const [workout, setWorkout] = useState<SavedWorkout | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchWorkout(id).then((w) => {
      setWorkout(w)
      if (!w) setNotFound(true)
      setLoading(false)
    })
  }, [id, fetchWorkout])

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fade-up" style={{ animationFillMode: 'both' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <AppLogo
            title="Workout"
            subtitle={workout ? workout.startedAt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : '—'}
          />

          <div className="flex items-center gap-4">
            <Link to="/history" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← History
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {loading && <Spinner centered />}

        {notFound && (
          <p className="text-center text-gray-500 py-12">Workout not found.</p>
        )}

        {workout && <WorkoutDetail workout={workout} />}
      </div>
    </PageShell>
  )
}

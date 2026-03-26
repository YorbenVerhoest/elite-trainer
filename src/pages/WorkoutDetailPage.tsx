import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/contexts/AuthContext'
import { WorkoutDetail } from '@/components/WorkoutDetail'
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
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
    >
      <div className="h-px bg-gradient-to-r from-blue-500 via-orange-400 to-transparent" />

      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(46,170,255,0.4)]">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 21H5L13 3H19L14 11H20L11 21Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-widest uppercase font-sport bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent leading-none">
                Workout
              </h1>
              <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">
                {workout ? workout.startedAt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

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

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {notFound && (
          <p className="text-center text-gray-500 py-12">Workout not found.</p>
        )}

        {workout && <WorkoutDetail workout={workout} />}
      </div>
    </div>
  )
}

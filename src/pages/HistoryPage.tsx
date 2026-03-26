import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/contexts/AuthContext'
import { WorkoutHistory } from '@/components/WorkoutHistory'
import { AppLogo } from '@/components/AppLogo'
import { PageShell } from '@/components/PageShell'

export function HistoryPage() {
  const { signOut } = useAuth()
  const { history, historyLoading, fetchHistory } = useWorkouts()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fade-up" style={{ animationFillMode: 'both' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <AppLogo title="History" subtitle="Past workouts" />

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Trainer
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        <WorkoutHistory workouts={history} loading={historyLoading} />
      </div>
    </PageShell>
  )
}

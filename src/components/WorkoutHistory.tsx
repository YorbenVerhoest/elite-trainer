import { Link } from 'react-router-dom'
import { formatDuration } from '@/lib/workoutStats'
import type { WorkoutSummaryRow } from '@/types/workout'

interface Props {
  workouts: WorkoutSummaryRow[]
  loading: boolean
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function WorkoutHistory({ workouts, loading }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg">No workouts yet.</p>
        <p className="text-sm mt-1">Complete your first ride to see it here.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-gray-800">
      {workouts.map((w) => (
        <Link
          key={w.id}
          to={`/history/${w.id}`}
          className="flex items-center justify-between gap-4 py-4 hover:bg-gray-800/50 px-3 -mx-3 rounded-lg transition-colors group"
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
              {formatDate(w.startedAt)}
            </span>
            <span className="text-xs text-gray-600">{formatDuration(w.durationSeconds)}</span>
          </div>

          <div className="flex items-center gap-5 shrink-0 text-right">
            {w.avgPower !== null && (
              <div className="flex flex-col">
                <span className="text-base font-bold font-sport text-orange-400 tabular-nums">{w.avgPower}</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider">avg W</span>
              </div>
            )}
            {w.distanceKm !== null && (
              <div className="flex flex-col">
                <span className="text-base font-bold font-sport text-green-400 tabular-nums">{w.distanceKm.toFixed(1)}</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider">km</span>
              </div>
            )}
            {w.avgHR !== null && (
              <div className="flex flex-col">
                <span className="text-base font-bold font-sport text-red-400 tabular-nums">{w.avgHR}</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider">bpm</span>
              </div>
            )}
            <span className="text-gray-600 group-hover:text-gray-400 transition-colors">›</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

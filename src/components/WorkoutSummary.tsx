import type { WorkoutRecord } from '@/types/workout'
import type { useStrava } from '@/hooks/useStrava'
import type { SaveStatus } from '@/hooks/useWorkouts'
import { computeStats, formatDuration } from '@/lib/workoutStats'

interface Props {
  record: WorkoutRecord
  onClose: () => void
  strava: ReturnType<typeof useStrava>
  saveStatus?: SaveStatus
  savedWorkoutId?: string | null
}

function StatCard({
  label,
  primary,
  secondary,
  color = 'text-white',
  delay = 0,
}: {
  label: string
  primary: string
  secondary?: string
  color?: string
  delay?: number
}) {
  return (
    <div
      className="bg-gray-700/60 rounded-xl p-4 flex flex-col gap-1 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{primary}</span>
      {secondary && <span className="text-xs text-gray-500">{secondary}</span>}
    </div>
  )
}

function StravaStatus({
  record,
  strava,
}: {
  record: WorkoutRecord
  strava: ReturnType<typeof useStrava>
}) {
  if (!strava.isConnected) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Connect Strava in the header to auto-upload.</span>
        <button
          onClick={() => strava.downloadTCX(record)}
          className="text-sm text-gray-400 hover:text-white transition-colors active:scale-95"
        >
          ↓ Download TCX
        </button>
      </div>
    )
  }

  if (strava.activityId) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
          <span>✓</span>
          <span>Uploaded to Strava</span>
        </div>
        <a
          href={`https://www.strava.com/activities/${strava.activityId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orange-400 hover:text-orange-300 underline"
        >
          View activity →
        </a>
      </div>
    )
  }

  if (strava.isUploading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <span>Uploading to Strava…</span>
      </div>
    )
  }

  if (strava.uploadError) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-red-400 truncate">{strava.uploadError}</span>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => strava.uploadWorkout(record)}
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors active:scale-95"
          >
            Retry
          </button>
          <button
            onClick={() => strava.downloadTCX(record)}
            className="text-sm text-gray-400 hover:text-white transition-colors active:scale-95"
          >
            ↓ TCX
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => strava.uploadWorkout(record)}
        className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors active:scale-95"
      >
        Upload to Strava
      </button>
      <button
        onClick={() => strava.downloadTCX(record)}
        className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors active:scale-95"
        title="Download as TCX file"
      >
        ↓ TCX
      </button>
    </div>
  )
}

export function WorkoutSummary({ record, onClose, strava, saveStatus, savedWorkoutId }: Props) {
  void savedWorkoutId
  const stats = computeStats(record)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div
          className="flex items-center justify-between animate-fade-up"
          style={{ animationFillMode: 'both' }}
        >
          <h2 className="text-lg font-bold">Workout Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none hover:scale-110 active:scale-90 transition-transform"
          >
            ×
          </button>
        </div>

        {/* Duration */}
        <div
          className="text-center py-2 animate-fade-up"
          style={{ animationDelay: '40ms', animationFillMode: 'both' }}
        >
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Duration</p>
          <p className="text-5xl font-bold tabular-nums font-sport">{formatDuration(record.durationSeconds)}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            delay={80}
            label="Avg Power"
            primary={stats.avgPower !== null ? `${stats.avgPower} W` : '—'}
            secondary={stats.maxPower !== null ? `Max ${stats.maxPower} W` : undefined}
            color="text-orange-400"
          />
          <StatCard
            delay={130}
            label="Avg Cadence"
            primary={stats.avgCadence !== null ? `${stats.avgCadence} rpm` : '—'}
            secondary={stats.maxCadence !== null ? `Max ${stats.maxCadence} rpm` : undefined}
            color="text-blue-400"
          />
          <StatCard
            delay={180}
            label="Distance"
            primary={`${stats.distanceKm.toFixed(2)} km`}
            color="text-green-400"
          />
          <StatCard
            delay={230}
            label="Calories"
            primary={stats.calories !== null ? `${stats.calories} kcal` : '—'}
            color="text-yellow-400"
          />
          {stats.avgHR !== null && (
            <StatCard
              delay={280}
              label="Avg Heart Rate"
              primary={`${stats.avgHR} bpm`}
              secondary={stats.maxHR !== null ? `Max ${stats.maxHR} bpm` : undefined}
              color="text-red-400"
            />
          )}
        </div>

        {/* Save status */}
        {saveStatus && saveStatus !== 'idle' && (
          <div className="flex items-center gap-2 text-xs animate-fade-up" style={{ animationFillMode: 'both' }}>
            {saveStatus === 'saving' && (
              <>
                <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500">Saving…</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <span className="text-green-400">✓</span>
                <span className="text-gray-500">Saved to Elite Trainer</span>
              </>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-400">Could not save workout</span>
            )}
          </div>
        )}

        {/* Strava status */}
        <div
          className="border-t border-gray-700 pt-4 animate-fade-up"
          style={{ animationDelay: '320ms', animationFillMode: 'both' }}
        >
          <StravaStatus record={record} strava={strava} />
        </div>
      </div>
    </div>
  )
}

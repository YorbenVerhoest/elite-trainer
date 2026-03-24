import type { WorkoutRecord } from '../types/bluetooth'
import type { useStrava } from '../hooks/useStrava'

interface Props {
  record: WorkoutRecord
  onClose: () => void
  strava: ReturnType<typeof useStrava>
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function computeStats(record: WorkoutRecord) {
  const pts = record.dataPoints
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
  const max = (arr: number[]) => (arr.length ? Math.round(Math.max(...arr)) : null)

  const powers = pts.filter((p) => p.power !== null && p.power > 0).map((p) => p.power as number)
  const cadences = pts
    .filter((p) => p.cadence !== null && p.cadence > 0)
    .map((p) => p.cadence as number)
  const speeds = pts.filter((p) => p.speed !== null).map((p) => p.speed as number)
  const hrs = pts
    .filter((p) => p.heartRate !== null && p.heartRate > 0)
    .map((p) => p.heartRate as number)

  const distanceKm = speeds.reduce((total, s) => total + s / 3600, 0)
  const avgPower = avg(powers)
  const calories =
    avgPower !== null && record.durationSeconds > 0
      ? Math.round((avgPower * record.durationSeconds) / 3600 * 3.6)
      : null

  return {
    avgPower,
    maxPower: max(powers),
    avgCadence: avg(cadences),
    maxCadence: max(cadences),
    avgHR: avg(hrs),
    maxHR: max(hrs),
    distanceKm,
    calories,
  }
}

function StatCard({
  label,
  primary,
  secondary,
  color = 'text-white',
}: {
  label: string
  primary: string
  secondary?: string
  color?: string
}) {
  return (
    <div className="bg-gray-700/60 rounded-xl p-4 flex flex-col gap-1">
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
          className="text-sm text-gray-400 hover:text-white transition-colors"
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
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => strava.downloadTCX(record)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ↓ TCX
          </button>
        </div>
      </div>
    )
  }

  // Connected but upload hasn't fired yet (shouldn't normally happen)
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">Ready to upload</span>
      <button
        onClick={() => strava.uploadWorkout(record)}
        className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
      >
        Upload now
      </button>
    </div>
  )
}

export function WorkoutSummary({ record, onClose, strava }: Props) {
  const stats = computeStats(record)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Workout Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Duration */}
        <div className="text-center py-2">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Duration</p>
          <p className="text-5xl font-bold tabular-nums">{formatDuration(record.durationSeconds)}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Avg Power"
            primary={stats.avgPower !== null ? `${stats.avgPower} W` : '—'}
            secondary={stats.maxPower !== null ? `Max ${stats.maxPower} W` : undefined}
            color="text-orange-400"
          />
          <StatCard
            label="Avg Cadence"
            primary={stats.avgCadence !== null ? `${stats.avgCadence} rpm` : '—'}
            secondary={stats.maxCadence !== null ? `Max ${stats.maxCadence} rpm` : undefined}
            color="text-blue-400"
          />
          <StatCard
            label="Distance"
            primary={`${stats.distanceKm.toFixed(2)} km`}
            color="text-green-400"
          />
          <StatCard
            label="Calories"
            primary={stats.calories !== null ? `${stats.calories} kcal` : '—'}
            color="text-yellow-400"
          />
          {stats.avgHR !== null && (
            <StatCard
              label="Avg Heart Rate"
              primary={`${stats.avgHR} bpm`}
              secondary={stats.maxHR !== null ? `Max ${stats.maxHR} bpm` : undefined}
              color="text-red-400"
            />
          )}
        </div>

        {/* Strava status */}
        <div className="border-t border-gray-700 pt-4">
          <StravaStatus record={record} strava={strava} />
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
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

function StravaSection({
  record,
  strava,
}: {
  record: WorkoutRecord
  strava: ReturnType<typeof useStrava>
}) {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSetup, setShowSetup] = useState(false)

  if (strava.activityId) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
          <span>✓</span>
          <span>Uploaded to Strava successfully</span>
        </div>
        <a
          href={`https://www.strava.com/activities/${strava.activityId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orange-400 hover:text-orange-300 underline"
        >
          View on Strava →
        </a>
      </div>
    )
  }

  if (strava.isConnected) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            Connected as <span className="text-white font-medium">{strava.athleteName}</span>
          </span>
          <button
            onClick={strava.disconnect}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Disconnect
          </button>
        </div>
        {strava.uploadError && (
          <p className="text-sm text-red-400">{strava.uploadError}</p>
        )}
        <button
          onClick={() => strava.uploadWorkout(record)}
          disabled={strava.isUploading}
          className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
        >
          {strava.isUploading ? 'Uploading…' : 'Upload to Strava'}
        </button>
      </div>
    )
  }

  if (showSetup) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-400 leading-relaxed">
          Go to{' '}
          <span className="text-gray-200 font-mono text-xs">strava.com/settings/api</span>, create
          an app, and paste the credentials below. Set the{' '}
          <strong className="text-gray-200">Authorization Callback Domain</strong> to{' '}
          <span className="text-gray-200 font-mono text-xs">{window.location.hostname}</span>.
        </p>
        <input
          type="text"
          placeholder="Client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="password"
          placeholder="Client Secret"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowSetup(false)}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => strava.authorize(clientId.trim(), clientSecret.trim())}
            disabled={!clientId.trim() || !clientSecret.trim()}
            className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            Connect Strava
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowSetup(true)}
        className="flex-1 py-2.5 bg-orange-700 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors text-sm"
      >
        Connect Strava
      </button>
      <button
        onClick={() => strava.downloadTCX(record)}
        className="py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        title="Download as TCX file"
      >
        ↓ TCX
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

        {/* Strava */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Save to Strava</p>
          <StravaSection record={record} strava={strava} />
        </div>
      </div>
    </div>
  )
}

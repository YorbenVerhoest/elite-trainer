import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatDuration } from '@/lib/workoutStats'
import type { SavedWorkout } from '@/types/workout'

interface Props {
  workout: SavedWorkout
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`bg-gray-800 rounded-xl p-4 flex flex-col gap-1 border-t-2 ${color}`}>
      <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
      <span className={`text-3xl font-bold tabular-nums font-sport leading-none ${color.replace('border-', 'text-')}`}>
        {value}
      </span>
    </div>
  )
}

// Sample data points to keep the chart performant (max 300 points)
function samplePoints<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr
  const step = Math.ceil(arr.length / maxPoints)
  return arr.filter((_, i) => i % step === 0)
}

export function WorkoutDetail({ workout }: Props) {
  const chartData = samplePoints(
    workout.dataPoints.map((pt) => ({
      t: pt.timestamp,
      power: pt.power,
      hr: pt.heartRate,
    })),
    300,
  )

  const hasPower = workout.avgPower !== null
  const hasHR = workout.avgHR !== null

  return (
    <div className="flex flex-col gap-6">
      {/* Duration headline */}
      <div className="text-center py-2">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Duration</p>
        <p className="text-5xl font-bold tabular-nums font-sport">{formatDuration(workout.durationSeconds)}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {hasPower && (
          <StatCard
            label="Avg Power"
            value={`${workout.avgPower} W`}
            color="border-orange-400"
          />
        )}
        {hasPower && workout.maxPower !== null && (
          <StatCard
            label="Max Power"
            value={`${workout.maxPower} W`}
            color="border-orange-400"
          />
        )}
        {workout.distanceKm !== null && (
          <StatCard
            label="Distance"
            value={`${workout.distanceKm.toFixed(2)} km`}
            color="border-green-400"
          />
        )}
        {workout.calories !== null && (
          <StatCard
            label="Calories"
            value={`${workout.calories} kcal`}
            color="border-yellow-400"
          />
        )}
        {hasHR && (
          <StatCard
            label="Avg HR"
            value={`${workout.avgHR} bpm`}
            color="border-red-400"
          />
        )}
        {workout.avgCadence !== null && (
          <StatCard
            label="Avg Cadence"
            value={`${workout.avgCadence} rpm`}
            color="border-blue-400"
          />
        )}
      </div>

      {/* Power chart */}
      {chartData.length > 1 && (hasPower || hasHR) && (
        <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-xs uppercase tracking-widest text-gray-500">Power over time</h3>
            <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
              {hasPower && <span className="flex items-center gap-1"><span className="w-3 h-px bg-orange-400 inline-block" /> Power</span>}
              {hasHR && <span className="flex items-center gap-1"><span className="w-3 h-px bg-red-400 inline-block" /> HR</span>}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="t"
                tickFormatter={(ms: number) => formatDuration(Math.round(ms / 1000))}
                tick={{ fontSize: 10, fill: '#4c5480' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#4c5480' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#152240', border: '1px solid #2a4068', borderRadius: 8, fontSize: 12 }}
                labelFormatter={(ms: number) => formatDuration(Math.round(ms / 1000))}
                formatter={(val: number, name: string) => [
                  `${val} ${name === 'power' ? 'W' : 'bpm'}`,
                  name === 'power' ? 'Power' : 'HR',
                ]}
              />
              {hasPower && (
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#ff8040"
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              )}
              {hasHR && (
                <Line
                  type="monotone"
                  dataKey="hr"
                  stroke="#ff5070"
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

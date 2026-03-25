import type { TrainerMetrics } from '@/types/workout'

interface Props {
  metrics: TrainerMetrics
}

function MetricCard({
  label,
  value,
  unit,
  color = 'text-white',
}: {
  label: string
  value: number | null
  unit: string
  color?: string
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
      <span className={`text-4xl font-bold tabular-nums ${color}`}>
        {value !== null ? value.toFixed(0) : '--'}
      </span>
      <span className="text-sm text-gray-500">{unit}</span>
    </div>
  )
}

export function Dashboard({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        label="Power"
        value={metrics.power}
        unit="watts"
        color="text-orange-400"
      />
      <MetricCard
        label="Cadence"
        value={metrics.cadence}
        unit="rpm"
        color="text-blue-400"
      />
      <MetricCard
        label="Speed"
        value={metrics.speed}
        unit="km/h"
        color="text-green-400"
      />
      <MetricCard
        label="Heart Rate"
        value={metrics.heartRate}
        unit="bpm"
        color="text-red-400"
      />
    </div>
  )
}

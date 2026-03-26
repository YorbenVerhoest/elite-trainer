import type { TrainerMetrics } from '@/types/workout'

interface Props {
  metrics: TrainerMetrics
}

function MetricCard({
  label,
  value,
  unit,
  color = 'text-white',
  borderColor,
  glow,
}: {
  label: string
  value: number | null
  unit: string
  color?: string
  borderColor: string
  glow: string
}) {
  return (
    <div className={`bg-gray-800 rounded-xl p-5 flex flex-col items-center gap-1 border-t-2 ${borderColor} ${glow}`}>
      <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
      <span
        key={value ?? 'null'}
        className={`text-5xl font-bold tabular-nums font-sport leading-none ${color} animate-value-pop`}
      >
        {value !== null ? value.toFixed(0) : '--'}
      </span>
      <span className="text-xs text-gray-600 uppercase tracking-wider">{unit}</span>
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
        borderColor="border-orange-400"
        glow="shadow-[0_4px_24px_rgba(255,120,32,0.12)]"
      />
      <MetricCard
        label="Cadence"
        value={metrics.cadence}
        unit="rpm"
        color="text-blue-400"
        borderColor="border-blue-400"
        glow="shadow-[0_4px_24px_rgba(90,171,255,0.12)]"
      />
      <MetricCard
        label="Speed"
        value={metrics.speed}
        unit="km/h"
        color="text-green-400"
        borderColor="border-green-400"
        glow="shadow-[0_4px_24px_rgba(52,217,195,0.12)]"
      />
      <MetricCard
        label="Heart Rate"
        value={metrics.heartRate}
        unit="bpm"
        color="text-red-400"
        borderColor="border-red-400"
        glow="shadow-[0_4px_24px_rgba(255,110,136,0.12)]"
      />
    </div>
  )
}

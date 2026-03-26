import type { WorkoutRecord } from '@/types/workout'

export interface WorkoutStats {
  avgPower: number | null
  maxPower: number | null
  avgCadence: number | null
  maxCadence: number | null
  avgHR: number | null
  maxHR: number | null
  distanceKm: number
  calories: number | null
}

export function computeStats(record: WorkoutRecord): WorkoutStats {
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

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

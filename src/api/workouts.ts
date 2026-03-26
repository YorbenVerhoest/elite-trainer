import { supabase } from '@/api/supabase'
import { computeStats } from '@/lib/workoutStats'
import type { WorkoutRecord, WorkoutSummaryRow, SavedWorkout, WorkoutDataPoint } from '@/types/workout'

function rowToSummary(row: Record<string, unknown>): WorkoutSummaryRow {
  return {
    id: row.id as string,
    startedAt: new Date(row.started_at as string),
    durationSeconds: row.duration_seconds as number,
    avgPower: row.avg_power as number | null,
    maxPower: row.max_power as number | null,
    avgCadence: row.avg_cadence as number | null,
    avgHR: row.avg_hr as number | null,
    distanceKm: row.distance_km as number | null,
    calories: row.calories as number | null,
    stravaActivityId: row.strava_activity_id ? String(row.strava_activity_id) : null,
  }
}

export async function insertWorkout(record: WorkoutRecord, userId: string): Promise<string> {
  const stats = computeStats(record)

  const { data: workout, error: workoutErr } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      started_at: record.startedAt.toISOString(),
      duration_seconds: record.durationSeconds,
      avg_power: stats.avgPower,
      max_power: stats.maxPower,
      avg_cadence: stats.avgCadence,
      max_cadence: stats.maxCadence,
      avg_hr: stats.avgHR,
      max_hr: stats.maxHR,
      distance_km: stats.distanceKm > 0 ? stats.distanceKm : null,
      calories: stats.calories,
    })
    .select('id')
    .single()

  if (workoutErr || !workout) throw new Error(workoutErr?.message ?? 'Failed to save workout')

  const workoutId = workout.id as string

  if (record.dataPoints.length > 0) {
    const rows = record.dataPoints.map((pt) => ({
      workout_id: workoutId,
      timestamp_ms: pt.timestamp,
      power: pt.power,
      cadence: pt.cadence,
      speed_kmh: pt.speed,
      heart_rate: pt.heartRate,
    }))

    // Insert in chunks of 500 to stay within Supabase request limits
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from('workout_data_points').insert(rows.slice(i, i + 500))
      if (error) throw new Error(error.message)
    }
  }

  return workoutId
}

export async function getWorkouts(): Promise<WorkoutSummaryRow[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, started_at, duration_seconds, avg_power, max_power, avg_cadence, avg_hr, distance_km, calories, strava_activity_id')
    .order('started_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToSummary)
}

export async function getWorkout(id: string): Promise<SavedWorkout> {
  const [workoutRes, pointsRes] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, started_at, duration_seconds, avg_power, max_power, avg_cadence, avg_hr, distance_km, calories, strava_activity_id')
      .eq('id', id)
      .single(),
    supabase
      .from('workout_data_points')
      .select('timestamp_ms, power, cadence, speed_kmh, heart_rate')
      .eq('workout_id', id)
      .order('timestamp_ms', { ascending: true }),
  ])

  if (workoutRes.error) throw new Error(workoutRes.error.message)
  if (pointsRes.error) throw new Error(pointsRes.error.message)

  const summary = rowToSummary(workoutRes.data as Record<string, unknown>)
  const dataPoints: WorkoutDataPoint[] = (pointsRes.data ?? []).map((pt) => ({
    timestamp: pt.timestamp_ms as number,
    power: pt.power as number | null,
    cadence: pt.cadence as number | null,
    speed: pt.speed_kmh as number | null,
    heartRate: pt.heart_rate as number | null,
  }))

  return { ...summary, dataPoints }
}

export async function markStravaUploaded(workoutId: string, stravaActivityId: string) {
  await supabase
    .from('workouts')
    .update({ strava_activity_id: stravaActivityId })
    .eq('id', workoutId)
}

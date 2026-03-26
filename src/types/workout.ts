export interface TrainerMetrics {
  power: number | null        // watts
  cadence: number | null      // rpm
  speed: number | null        // km/h
  heartRate: number | null    // bpm
}

export interface WorkoutStep {
  id: string
  label: string
  durationSeconds: number
  targetPower: number         // watts
}

export interface WorkoutProgram {
  id: string
  name: string
  steps: WorkoutStep[]
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface WorkoutDataPoint {
  timestamp: number       // ms since workout start
  power: number | null
  cadence: number | null
  speed: number | null
  heartRate: number | null
}

export interface WorkoutRecord {
  startedAt: Date
  durationSeconds: number
  dataPoints: WorkoutDataPoint[]
}

/** A saved workout row from the `workouts` table (denormalized stats, no data points) */
export interface WorkoutSummaryRow {
  id: string
  startedAt: Date
  durationSeconds: number
  avgPower: number | null
  maxPower: number | null
  avgCadence: number | null
  avgHR: number | null
  distanceKm: number | null
  calories: number | null
  stravaActivityId: string | null
}

/** A fully loaded saved workout: summary + raw data points */
export interface SavedWorkout extends WorkoutSummaryRow {
  dataPoints: WorkoutDataPoint[]
}

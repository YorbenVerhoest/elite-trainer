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

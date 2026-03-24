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

// FTMS Bluetooth GATT UUIDs
export const FTMS_SERVICE = 0x1826
export const INDOOR_BIKE_DATA = 0x2ad2
export const CONTROL_POINT = 0x2ad9
export const FITNESS_MACHINE_STATUS = 0x2ada

// FTMS Control Point opcodes
export const OP_REQUEST_CONTROL = 0x00
export const OP_RESET = 0x01
export const OP_SET_TARGET_RESISTANCE = 0x04
export const OP_SET_TARGET_POWER = 0x05
export const OP_START_RESUME = 0x07
export const OP_STOP_PAUSE = 0x08

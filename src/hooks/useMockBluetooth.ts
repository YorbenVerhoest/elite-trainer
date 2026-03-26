import { useState, useCallback, useRef, useEffect } from 'react'
import type { TrainerMetrics, ConnectionState, WorkoutDataPoint, WorkoutRecord } from '@/types/workout'

const DEFAULT_METRICS: TrainerMetrics = {
  power: null,
  cadence: null,
  speed: null,
  heartRate: null,
}

function jitter(value: number, range: number) {
  return value + (Math.random() - 0.5) * 2 * range
}

export function useMockBluetooth() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [metrics, setMetrics] = useState<TrainerMetrics>(DEFAULT_METRICS)

  const targetPowerRef = useRef(150)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingRef = useRef<{ startTime: number; dataPoints: WorkoutDataPoint[] } | null>(null)
  const externalHeartRateRef = useRef<number | null>(null)
  const metricsRef = useRef<TrainerMetrics>(DEFAULT_METRICS)
  const simulatedHRRef = useRef(120)

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startSimulation = useCallback(() => {
    stopSimulation()
    intervalRef.current = setInterval(() => {
      const targetPower = targetPowerRef.current
      // Slowly drift HR toward a target based on power output
      const targetHR = 100 + targetPower * 0.22
      simulatedHRRef.current +=
        (targetHR - simulatedHRRef.current) * 0.03 + (Math.random() - 0.5) * 0.8

      const power = Math.max(0, Math.round(jitter(targetPower, 8)))
      const cadence = Math.round(jitter(88, 4))
      const speed = parseFloat((cadence * 0.34).toFixed(1))
      const heartRate = Math.round(simulatedHRRef.current)

      const updated: TrainerMetrics = { power, cadence, speed, heartRate }
      metricsRef.current = updated
      setMetrics(updated)

      if (recordingRef.current) {
        recordingRef.current.dataPoints.push({
          timestamp: Date.now() - recordingRef.current.startTime,
          power,
          cadence,
          speed,
          heartRate: externalHeartRateRef.current ?? heartRate,
        })
      }
    }, 1000)
  }, [stopSimulation])

  const connect = useCallback(async () => {
    setConnectionState('connecting')
    await new Promise((r) => setTimeout(r, 800))
    simulatedHRRef.current = 120
    startSimulation()
    setConnectionState('connected')
  }, [startSimulation])

  const disconnect = useCallback(() => {
    stopSimulation()
    setConnectionState('disconnected')
    setMetrics(DEFAULT_METRICS)
    metricsRef.current = DEFAULT_METRICS
  }, [stopSimulation])

  const setTargetPower = useCallback(async (watts: number) => {
    targetPowerRef.current = watts
  }, [])

  const setTargetResistance = useCallback(async (_level: number) => {}, [])
  const startResume = useCallback(async () => {}, [])
  const stopPause = useCallback(async () => {}, [])

  const setExternalHeartRate = useCallback((rate: number | null) => {
    externalHeartRateRef.current = rate
  }, [])

  const startRecording = useCallback(() => {
    recordingRef.current = { startTime: Date.now(), dataPoints: [] }
  }, [])

  const stopRecording = useCallback((): WorkoutRecord | null => {
    if (!recordingRef.current) return null
    const { startTime, dataPoints } = recordingRef.current
    recordingRef.current = null
    return {
      startedAt: new Date(startTime),
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
      dataPoints,
    }
  }, [])

  useEffect(() => stopSimulation, [stopSimulation])

  return {
    connectionState,
    metrics,
    error: null,
    connect,
    disconnect,
    setTargetPower,
    setTargetResistance,
    startResume,
    stopPause,
    setExternalHeartRate,
    startRecording,
    stopRecording,
  }
}

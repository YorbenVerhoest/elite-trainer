import { useState, useCallback, useRef } from 'react'
import type { TrainerMetrics, ConnectionState, WorkoutDataPoint, WorkoutRecord } from '../types/bluetooth'
import {
  FTMS_SERVICE,
  INDOOR_BIKE_DATA,
  CONTROL_POINT,
  OP_REQUEST_CONTROL,
  OP_SET_TARGET_POWER,
  OP_SET_TARGET_RESISTANCE,
  OP_START_RESUME,
  OP_STOP_PAUSE,
} from '../types/bluetooth'

const DEFAULT_METRICS: TrainerMetrics = {
  power: null,
  cadence: null,
  speed: null,
  heartRate: null,
}

function parseIndoorBikeData(value: DataView): Partial<TrainerMetrics> {
  // FTMS Indoor Bike Data characteristic — little-endian
  // Flags field (2 bytes) determines which fields are present
  const flags = value.getUint16(0, true)
  const metrics: Partial<TrainerMetrics> = {}
  let offset = 2

  // Bit 0: More Data — when 0, Instantaneous Speed is present
  if ((flags & 0x01) === 0) {
    metrics.speed = value.getUint16(offset, true) * 0.01
    offset += 2
  }

  // Bit 1: Average Speed present
  if (flags & 0x02) offset += 2

  // Bit 2: Instantaneous Cadence present
  if (flags & 0x04) {
    metrics.cadence = value.getUint16(offset, true) * 0.5
    offset += 2
  }

  // Bit 3: Average Cadence present
  if (flags & 0x08) offset += 2

  // Bit 4: Total Distance present
  if (flags & 0x10) offset += 3

  // Bit 5: Resistance Level present
  if (flags & 0x20) offset += 2

  // Bit 6: Instantaneous Power present
  if (flags & 0x40) {
    metrics.power = value.getInt16(offset, true)
    offset += 2
  }

  return metrics
}

export function useBluetooth() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [metrics, setMetrics] = useState<TrainerMetrics>(DEFAULT_METRICS)
  const [error, setError] = useState<string | null>(null)

  const deviceRef = useRef<BluetoothDevice | null>(null)
  const controlPointRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)
  const metricsRef = useRef<TrainerMetrics>(DEFAULT_METRICS)
  const recordingRef = useRef<{ startTime: number; dataPoints: WorkoutDataPoint[] } | null>(null)
  const externalHeartRateRef = useRef<number | null>(null)

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth is not supported in this browser. Use Chrome or Edge.')
      setConnectionState('error')
      return
    }

    try {
      setConnectionState('connecting')
      setError(null)

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [FTMS_SERVICE] }],
        optionalServices: [FTMS_SERVICE],
      })

      deviceRef.current = device

      device.addEventListener('gattserverdisconnected', () => {
        setConnectionState('disconnected')
        setMetrics(DEFAULT_METRICS)
        metricsRef.current = DEFAULT_METRICS
        controlPointRef.current = null
      })

      const server = await device.gatt!.connect()
      const service = await server.getPrimaryService(FTMS_SERVICE)

      // Subscribe to live bike data
      const bikeDataChar = await service.getCharacteristic(INDOOR_BIKE_DATA)
      await bikeDataChar.startNotifications()
      bikeDataChar.addEventListener('characteristicvaluechanged', (event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value!
        const parsed = parseIndoorBikeData(value)
        const updated: TrainerMetrics = { ...metricsRef.current, ...parsed }
        metricsRef.current = updated
        setMetrics(updated)
        if (recordingRef.current) {
          recordingRef.current.dataPoints.push({
            timestamp: Date.now() - recordingRef.current.startTime,
            power: updated.power,
            cadence: updated.cadence,
            speed: updated.speed,
            heartRate: externalHeartRateRef.current ?? updated.heartRate,
          })
        }
      })

      // Get control point characteristic
      const controlPoint = await service.getCharacteristic(CONTROL_POINT)
      // FTMS spec §4.16: the server must not process any CP procedure unless the
      // client has configured the CP characteristic for indications first.
      await controlPoint.startNotifications()
      controlPointRef.current = controlPoint

      // Request control — non-fatal if the device rejects it.
      try {
        await controlPoint.writeValueWithResponse(new Uint8Array([OP_REQUEST_CONTROL]))
      } catch {
        // ignore
      }

      setConnectionState('connected')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      // User cancelling the picker is not an error worth showing
      if (message.includes('cancelled') || message.includes('chosen')) {
        setConnectionState('disconnected')
      } else {
        setError(message)
        setConnectionState('error')
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    deviceRef.current?.gatt?.disconnect()
    setConnectionState('disconnected')
    setMetrics(DEFAULT_METRICS)
  }, [])

  const setTargetPower = useCallback(async (watts: number) => {
    const cp = controlPointRef.current
    if (!cp) return
    try {
      // OP_SET_TARGET_POWER + int16 little-endian
      const buf = new ArrayBuffer(3)
      const view = new DataView(buf)
      view.setUint8(0, OP_SET_TARGET_POWER)
      view.setInt16(1, watts, true)
      await cp.writeValueWithResponse(new Uint8Array(buf))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set power')
    }
  }, [])

  const setTargetResistance = useCallback(async (level: number) => {
    const cp = controlPointRef.current
    if (!cp) return
    try {
      // OP_SET_TARGET_RESISTANCE + uint8 (level * 10 for 0.1 resolution)
      const buf = new Uint8Array([OP_SET_TARGET_RESISTANCE, Math.round(level * 10)])
      await cp.writeValueWithResponse(buf)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set resistance')
    }
  }, [])

  const startResume = useCallback(async () => {
    const cp = controlPointRef.current
    if (!cp) return
    await cp.writeValueWithResponse(new Uint8Array([OP_START_RESUME]))
  }, [])

  const stopPause = useCallback(async () => {
    const cp = controlPointRef.current
    if (!cp) return
    // 0x01 = pause, 0x02 = stop
    await cp.writeValueWithResponse(new Uint8Array([OP_STOP_PAUSE, 0x01]))
  }, [])

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

  return {
    connectionState,
    metrics,
    error,
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

import { useState, useCallback, useRef } from 'react'
import type { TrainerMetrics, ConnectionState } from '../types/bluetooth'
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
        setMetrics((prev) => ({ ...prev, ...parsed }))
      })

      // Get control point characteristic
      const controlPoint = await service.getCharacteristic(CONTROL_POINT)
      controlPointRef.current = controlPoint

      // Request control of the trainer
      await controlPoint.writeValueWithResponse(new Uint8Array([OP_REQUEST_CONTROL]))

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
    // OP_SET_TARGET_POWER + int16 little-endian
    const buf = new ArrayBuffer(3)
    const view = new DataView(buf)
    view.setUint8(0, OP_SET_TARGET_POWER)
    view.setInt16(1, watts, true)
    await cp.writeValueWithResponse(new Uint8Array(buf))
  }, [])

  const setTargetResistance = useCallback(async (level: number) => {
    const cp = controlPointRef.current
    if (!cp) return
    // OP_SET_TARGET_RESISTANCE + uint8 (level * 10 for 0.1 resolution)
    const buf = new Uint8Array([OP_SET_TARGET_RESISTANCE, Math.round(level * 10)])
    await cp.writeValueWithResponse(buf)
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
  }
}

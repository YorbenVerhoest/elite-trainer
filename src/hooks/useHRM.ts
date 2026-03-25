import { useState, useCallback, useRef } from 'react'
import { HR_SERVICE, HR_MEASUREMENT, parseHeartRate } from '@/lib/hrm'

export type HRMConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export function useHRM() {
  const [connectionState, setConnectionState] = useState<HRMConnectionState>('disconnected')
  const [heartRate, setHeartRate] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const deviceRef = useRef<BluetoothDevice | null>(null)

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth not supported')
      setConnectionState('error')
      return
    }
    try {
      setConnectionState('connecting')
      setError(null)

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HR_SERVICE] }],
      })
      deviceRef.current = device

      device.addEventListener('gattserverdisconnected', () => {
        setConnectionState('disconnected')
        setHeartRate(null)
      })

      const server = await device.gatt!.connect()
      const service = await server.getPrimaryService(HR_SERVICE)
      const char = await service.getCharacteristic(HR_MEASUREMENT)
      await char.startNotifications()
      char.addEventListener('characteristicvaluechanged', (event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value!
        setHeartRate(parseHeartRate(value))
      })

      setConnectionState('connected')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
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
    setHeartRate(null)
  }, [])

  return { connectionState, heartRate, error, connect, disconnect }
}

import { useState, useCallback, useRef } from 'react'

const HR_SERVICE = 0x180d
const HR_MEASUREMENT = 0x2a37

function parseHeartRate(value: DataView): number {
  // Bit 0 of flags: 0 = UINT8 format, 1 = UINT16 format
  const flags = value.getUint8(0)
  return (flags & 0x01) ? value.getUint16(1, true) : value.getUint8(1)
}

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

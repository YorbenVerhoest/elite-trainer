// Minimal Web Bluetooth API type declarations
// Full spec: https://webbluetoothcg.github.io/web-bluetooth/

interface BluetoothRequestDeviceFilter {
  services?: BluetoothServiceUUID[]
  name?: string
  namePrefix?: string
}

interface RequestDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[]
  optionalServices?: BluetoothServiceUUID[]
  acceptAllDevices?: boolean
}

type BluetoothServiceUUID = number | string
type BluetoothCharacteristicUUID = number | string

interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>
}

interface BluetoothDevice extends EventTarget {
  id: string
  name?: string
  gatt?: BluetoothRemoteGATTServer
  addEventListener(type: 'gattserverdisconnected', listener: EventListener): void
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>
}

interface BluetoothRemoteGATTService {
  device: BluetoothDevice
  uuid: string
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  service: BluetoothRemoteGATTService
  uuid: string
  value?: DataView
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  readValue(): Promise<DataView>
  writeValue(value: BufferSource): Promise<void>
  writeValueWithResponse(value: BufferSource): Promise<void>
  writeValueWithoutResponse(value: BufferSource): Promise<void>
  addEventListener(type: 'characteristicvaluechanged', listener: EventListener): void
}

interface Navigator {
  bluetooth: Bluetooth
}

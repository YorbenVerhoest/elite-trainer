export const HR_SERVICE = 0x180d
export const HR_MEASUREMENT = 0x2a37

export function parseHeartRate(value: DataView): number {
  // Bit 0 of flags: 0 = UINT8 format, 1 = UINT16 format
  const flags = value.getUint8(0)
  return (flags & 0x01) ? value.getUint16(1, true) : value.getUint8(1)
}

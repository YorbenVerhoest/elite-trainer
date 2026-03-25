import type { TrainerMetrics } from '@/types/workout'

export function parseIndoorBikeData(value: DataView): Partial<TrainerMetrics> {
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

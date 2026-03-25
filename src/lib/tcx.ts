import type { WorkoutRecord } from '@/types/workout'

export function buildTCX(record: WorkoutRecord): string {
  const startIso = record.startedAt.toISOString()
  let distanceMeters = 0
  const trackpoints = record.dataPoints
    .map((point) => {
      const time = new Date(record.startedAt.getTime() + point.timestamp).toISOString()
      const speedMs = (point.speed ?? 0) / 3.6
      distanceMeters += speedMs  // one data point ≈ 1 second
      const parts: string[] = [
        `<Trackpoint>`,
        `<Time>${time}</Time>`,
        `<DistanceMeters>${distanceMeters.toFixed(1)}</DistanceMeters>`,
      ]
      if (point.heartRate !== null)
        parts.push(`<HeartRateBpm><Value>${Math.round(point.heartRate)}</Value></HeartRateBpm>`)
      if (point.cadence !== null)
        parts.push(`<Cadence>${Math.round(point.cadence)}</Cadence>`)
      const exts: string[] = []
      if (point.speed !== null)
        exts.push(`<ns3:Speed>${speedMs.toFixed(3)}</ns3:Speed>`)
      if (point.power !== null)
        exts.push(`<ns3:Watts>${Math.round(point.power)}</ns3:Watts>`)
      if (exts.length)
        parts.push(`<Extensions><ns3:TPX>${exts.join('')}</ns3:TPX></Extensions>`)
      parts.push(`</Trackpoint>`)
      return parts.join('')
    })
    .join('\n          ')

  const pts = record.dataPoints
  const powers = pts.filter((p) => p.power !== null && p.power > 0).map((p) => p.power as number)
  const hrs = pts.filter((p) => p.heartRate !== null && p.heartRate > 0).map((p) => p.heartRate as number)
  const speeds = pts.filter((p) => p.speed !== null).map((p) => p.speed as number)

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const avgPower = powers.length ? Math.round(avg(powers)) : 0
  const maxPower = powers.length ? Math.max(...powers) : 0
  const avgHR = hrs.length ? Math.round(avg(hrs)) : 0
  const maxHR = hrs.length ? Math.max(...hrs) : 0
  const maxSpeedMs = speeds.length ? Math.max(...speeds) / 3.6 : 0
  const calories = avgPower > 0 ? Math.round((avgPower * record.durationSeconds) / 3600 * 3.6) : 0

  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase
  xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd"
  xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2"
  xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Activities>
    <Activity Sport="Biking">
      <Id>${startIso}</Id>
      <Lap StartTime="${startIso}">
        <TotalTimeSeconds>${record.durationSeconds}</TotalTimeSeconds>
        <DistanceMeters>${distanceMeters.toFixed(1)}</DistanceMeters>
        <MaximumSpeed>${maxSpeedMs.toFixed(3)}</MaximumSpeed>
        <Calories>${calories}</Calories>
        ${avgHR > 0 ? `<AverageHeartRateBpm><Value>${avgHR}</Value></AverageHeartRateBpm>` : ''}
        ${maxHR > 0 ? `<MaximumHeartRateBpm><Value>${maxHR}</Value></MaximumHeartRateBpm>` : ''}
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>
          ${trackpoints}
        </Track>
        ${avgPower > 0 ? `<Extensions><ns3:LX><ns3:AvgWatts>${avgPower}</ns3:AvgWatts><ns3:MaxWatts>${maxPower}</ns3:MaxWatts></ns3:LX></Extensions>` : ''}
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`
}

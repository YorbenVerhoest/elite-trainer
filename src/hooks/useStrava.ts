import { useState, useCallback } from 'react'
import type { WorkoutRecord } from '../types/bluetooth'

interface StravaTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number     // unix timestamp seconds
  athleteName: string
}

const TOKENS_KEY = 'strava_tokens'
const CONFIG_KEY = 'strava_config'

function loadTokens(): StravaTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? (JSON.parse(raw) as StravaTokens) : null
  } catch {
    return null
  }
}

function saveTokens(t: StravaTokens | null) {
  if (t) localStorage.setItem(TOKENS_KEY, JSON.stringify(t))
  else localStorage.removeItem(TOKENS_KEY)
}

function loadConfig(): { clientId: string; clientSecret: string } | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// TCX generator
// ---------------------------------------------------------------------------

function buildTCX(record: WorkoutRecord): string {
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

// ---------------------------------------------------------------------------

export function useStrava() {
  const [tokens, setTokens] = useState<StravaTokens | null>(loadTokens)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activityId, setActivityId] = useState<string | null>(null)

  function persistTokens(t: StravaTokens | null) {
    saveTokens(t)
    setTokens(t)
  }

  function configure(clientId: string, clientSecret: string) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ clientId, clientSecret }))
  }

  function authorize(clientId: string, clientSecret: string) {
    configure(clientId, clientSecret)
    const redirectUri = window.location.origin + window.location.pathname
    const url = new URL('https://www.strava.com/oauth/authorize')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'activity:write,read')
    url.searchParams.set('state', 'strava_oauth')
    window.location.href = url.toString()
  }

  const handleCallback = useCallback(async (code: string): Promise<void> => {
    const config = loadConfig()
    if (!config) return
    try {
      const resp = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          grant_type: 'authorization_code',
        }),
      })
      if (!resp.ok) throw new Error(`Auth failed (${resp.status})`)
      const data = await resp.json()
      persistTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        athleteName: data.athlete?.firstname ?? 'Athlete',
      })
    } catch (err) {
      console.error('Strava auth error:', err)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function getValidToken(currentTokens: StravaTokens): Promise<string | null> {
    const nowSec = Math.floor(Date.now() / 1000)
    if (currentTokens.expiresAt > nowSec + 60) return currentTokens.accessToken

    const config = loadConfig()
    if (!config) return null
    try {
      const resp = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: currentTokens.refreshToken,
          grant_type: 'refresh_token',
        }),
      })
      if (!resp.ok) throw new Error('Refresh failed')
      const data = await resp.json()
      const refreshed: StravaTokens = {
        ...currentTokens,
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? currentTokens.refreshToken,
        expiresAt: data.expires_at,
      }
      persistTokens(refreshed)
      return refreshed.accessToken
    } catch {
      persistTokens(null)
      return null
    }
  }

  const uploadWorkout = useCallback(
    async (record: WorkoutRecord, name?: string): Promise<void> => {
      if (!tokens) return
      setIsUploading(true)
      setUploadError(null)
      setActivityId(null)

      try {
        const token = await getValidToken(tokens)
        if (!token) throw new Error('Not connected to Strava')

        const tcx = buildTCX(record)
        const blob = new Blob([tcx], { type: 'application/octet-stream' })
        const form = new FormData()
        form.append('file', blob, 'workout.tcx')
        form.append('data_type', 'tcx')
        form.append('name', name ?? `Elite Trainer — ${record.startedAt.toLocaleDateString()}`)
        form.append('trainer', '1')
        form.append('sport_type', 'VirtualRide')

        const resp = await fetch('https://www.strava.com/api/v3/uploads', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}))
          throw new Error(errData.error ?? `Upload failed (${resp.status})`)
        }
        const uploadData = await resp.json()
        const uploadId = String(uploadData.id ?? '')

        // Poll until Strava processes the upload and assigns an activity ID
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 2000))
          const pollResp = await fetch(`https://www.strava.com/api/v3/uploads/${uploadId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!pollResp.ok) break
          const pollData = await pollResp.json()
          if (pollData.error) throw new Error(pollData.error)
          if (pollData.activity_id) {
            setActivityId(String(pollData.activity_id))
            break
          }
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [tokens], // eslint-disable-line react-hooks/exhaustive-deps
  )

  function downloadTCX(record: WorkoutRecord) {
    const blob = new Blob([buildTCX(record)], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-${record.startedAt.toISOString().slice(0, 10)}.tcx`
    a.click()
    URL.revokeObjectURL(url)
  }

  function disconnect() {
    persistTokens(null)
    setActivityId(null)
    setUploadError(null)
  }

  function resetUpload() {
    setActivityId(null)
    setUploadError(null)
  }

  return {
    isConnected: tokens !== null,
    athleteName: tokens?.athleteName ?? null,
    isUploading,
    uploadError,
    activityId,
    authorize,
    handleCallback,
    uploadWorkout,
    downloadTCX,
    disconnect,
    resetUpload,
  }
}

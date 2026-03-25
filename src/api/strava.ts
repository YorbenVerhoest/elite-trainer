import type { WorkoutRecord } from '@/types/workout'
import { buildTCX } from '@/lib/tcx'

export interface StravaTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number     // unix timestamp seconds
  athleteName: string
}

export interface StravaConfig {
  clientId: string
  clientSecret: string
}

const TOKENS_KEY = 'strava_tokens'
const CONFIG_KEY = 'strava_config'

export function loadTokens(): StravaTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? (JSON.parse(raw) as StravaTokens) : null
  } catch {
    return null
  }
}

export function saveTokens(t: StravaTokens | null) {
  if (t) localStorage.setItem(TOKENS_KEY, JSON.stringify(t))
  else localStorage.removeItem(TOKENS_KEY)
}

export function loadConfig(): StravaConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveConfig(config: StravaConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export async function exchangeCode(code: string, config: StravaConfig): Promise<StravaTokens> {
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
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athleteName: data.athlete?.firstname ?? 'Athlete',
  }
}

export async function getValidToken(
  tokens: StravaTokens,
  config: StravaConfig,
): Promise<{ token: string; refreshed: StravaTokens | null }> {
  const nowSec = Math.floor(Date.now() / 1000)
  if (tokens.expiresAt > nowSec + 60) return { token: tokens.accessToken, refreshed: null }

  const resp = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: tokens.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!resp.ok) throw new Error('Token refresh failed')
  const data = await resp.json()
  const refreshed: StravaTokens = {
    ...tokens,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? tokens.refreshToken,
    expiresAt: data.expires_at,
  }
  return { token: refreshed.accessToken, refreshed }
}

export async function uploadActivity(
  token: string,
  record: WorkoutRecord,
  name: string,
): Promise<string> {
  const tcx = buildTCX(record)
  const blob = new Blob([tcx], { type: 'application/octet-stream' })
  const form = new FormData()
  form.append('file', blob, 'workout.tcx')
  form.append('data_type', 'tcx')
  form.append('name', name)
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
  const data = await resp.json()
  return String(data.id ?? '')
}

export async function pollUpload(token: string, uploadId: string): Promise<string | null> {
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const resp = await fetch(`https://www.strava.com/api/v3/uploads/${uploadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) break
    const data = await resp.json()
    if (data.error) throw new Error(data.error)
    if (data.activity_id) return String(data.activity_id)
  }
  return null
}

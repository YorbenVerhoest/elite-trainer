import { useState, useCallback } from 'react'
import type { WorkoutRecord } from '@/types/workout'
import {
  loadTokens,
  saveTokens,
  loadConfig,
  saveConfig,
  exchangeCode,
  getValidToken,
  uploadActivity,
  pollUpload,
  type StravaTokens,
} from '@/api/strava'
import { buildTCX } from '@/lib/tcx'

export function useStrava() {
  const [tokens, setTokens] = useState<StravaTokens | null>(loadTokens)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activityId, setActivityId] = useState<string | null>(null)

  function persistTokens(t: StravaTokens | null) {
    saveTokens(t)
    setTokens(t)
  }

  function authorize(clientId: string, clientSecret: string) {
    saveConfig({ clientId, clientSecret })
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
      const newTokens = await exchangeCode(code, config)
      persistTokens(newTokens)
    } catch (err) {
      console.error('Strava auth error:', err)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const uploadWorkout = useCallback(
    async (record: WorkoutRecord, name?: string): Promise<void> => {
      if (!tokens) return
      setIsUploading(true)
      setUploadError(null)
      setActivityId(null)

      try {
        const config = loadConfig()
        if (!config) throw new Error('Not connected to Strava')

        const { token, refreshed } = await getValidToken(tokens, config)
        if (refreshed) persistTokens(refreshed)

        const uploadId = await uploadActivity(
          token,
          record,
          name ?? `Elite Trainer — ${record.startedAt.toLocaleDateString()}`,
        )
        const id = await pollUpload(token, uploadId)
        if (id) setActivityId(id)
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

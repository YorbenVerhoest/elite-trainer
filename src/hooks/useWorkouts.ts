import { useState, useCallback } from 'react'
import { insertWorkout, getWorkouts, getWorkout } from '@/api/workouts'
import type { WorkoutRecord, WorkoutSummaryRow, SavedWorkout } from '@/types/workout'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useWorkouts() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null)
  const [history, setHistory] = useState<WorkoutSummaryRow[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const saveWorkout = useCallback(async (record: WorkoutRecord, userId: string) => {
    setSaveStatus('saving')
    setSavedWorkoutId(null)
    try {
      const id = await insertWorkout(record, userId)
      setSavedWorkoutId(id)
      setSaveStatus('saved')
      return id
    } catch {
      setSaveStatus('error')
      return null
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const rows = await getWorkouts()
      setHistory(rows)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const fetchWorkout = useCallback(async (id: string): Promise<SavedWorkout | null> => {
    try {
      return await getWorkout(id)
    } catch {
      return null
    }
  }, [])

  function resetSave() {
    setSaveStatus('idle')
    setSavedWorkoutId(null)
  }

  return { saveStatus, savedWorkoutId, saveWorkout, resetSave, history, historyLoading, fetchHistory, fetchWorkout }
}

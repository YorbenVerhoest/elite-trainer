import { useState, useCallback, useEffect } from 'react'
import { getPrograms, upsertProgram, deleteProgram, type SavedProgram } from '@/api/programs'
import { useAuth } from '@/contexts/AuthContext'
import type { WorkoutStep } from '@/types/workout'

export type ProgramSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function usePrograms() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<SavedProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<ProgramSaveStatus>('idle')

  useEffect(() => {
    if (!user) return
    getPrograms()
      .then(setPrograms)
      .finally(() => setLoading(false))
  }, [user])

  const saveProgram = useCallback(
    async (program: { dbId: string | null; name: string; steps: WorkoutStep[] }): Promise<SavedProgram | null> => {
      if (!user) return null
      setSaveStatus('saving')
      try {
        const saved = await upsertProgram(program, user.id)
        setPrograms((prev) => {
          const idx = prev.findIndex((p) => p.id === saved.id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = saved
            return next
          }
          return [saved, ...prev]
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
        return saved
      } catch {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
        return null
      }
    },
    [user],
  )

  const removeProgram = useCallback(async (id: string) => {
    await deleteProgram(id)
    setPrograms((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { programs, loading, saveStatus, saveProgram, removeProgram }
}

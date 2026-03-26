import { supabase } from '@/api/supabase'
import type { WorkoutStep } from '@/types/workout'

export interface SavedProgram {
  id: string
  name: string
  steps: WorkoutStep[]
  createdAt: Date
}

function rowToProgram(row: Record<string, unknown>): SavedProgram {
  return {
    id: row.id as string,
    name: row.name as string,
    steps: row.steps as WorkoutStep[],
    createdAt: new Date(row.created_at as string),
  }
}

export async function getPrograms(): Promise<SavedProgram[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('id, name, steps, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToProgram)
}

export async function upsertProgram(
  program: { dbId: string | null; name: string; steps: WorkoutStep[] },
  userId: string,
): Promise<SavedProgram> {
  if (program.dbId) {
    // UPDATE existing row
    const { data, error } = await supabase
      .from('workout_programs')
      .update({ name: program.name, steps: program.steps, updated_at: new Date().toISOString() })
      .eq('id', program.dbId)
      .select('id, name, steps, created_at')
      .single()
    if (error) throw new Error(error.message)
    return rowToProgram(data as Record<string, unknown>)
  } else {
    // INSERT new row
    const { data, error } = await supabase
      .from('workout_programs')
      .insert({ user_id: userId, name: program.name, steps: program.steps })
      .select('id, name, steps, created_at')
      .single()
    if (error) throw new Error(error.message)
    return rowToProgram(data as Record<string, unknown>)
  }
}

export async function deleteProgram(id: string): Promise<void> {
  const { error } = await supabase.from('workout_programs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

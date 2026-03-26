import { supabase } from '@/api/supabase'

export interface Profile {
  displayName: string | null
}

export async function getProfile(): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return { displayName: (data as Record<string, unknown>).display_name as string | null }
}

export async function updateDisplayName(displayName: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

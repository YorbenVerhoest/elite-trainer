import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/api/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<AuthError | null>
  signIn: (email: string, password: string) => Promise<AuthError | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      // Ensure a profile row exists whenever a session is established
      if (session?.user) {
        supabase.from('profiles').upsert({ id: session.user.id }, { onConflict: 'id' })
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string): Promise<AuthError | null> {
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (!error && data.user) {
      // Ensure a profile row exists (upsert is safe to call even if trigger handles it)
      await supabase.from('profiles').upsert({ id: data.user.id }, { onConflict: 'id' })
    }
    return error
  }

  async function signIn(email: string, password: string): Promise<AuthError | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

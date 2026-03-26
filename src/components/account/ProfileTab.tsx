import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getProfile, updateDisplayName, updatePassword } from '@/api/profile'

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-6 border-b border-gray-700/50 last:border-0 last:pb-0">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-widest text-gray-500">{label}</label>
      {children}
    </div>
  )
}

type Status = 'idle' | 'saving' | 'saved' | 'error'

function SaveButton({ status, label = 'Save' }: { status: Status; label?: string }) {
  return (
    <button
      type="submit"
      disabled={status === 'saving'}
      className={`self-start px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
        status === 'saved'  ? 'bg-green-700/40 text-green-300 border border-green-600/50' :
        status === 'error'  ? 'bg-red-800/40 text-red-300 border border-red-700/50' :
        status === 'saving' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                              'bg-gray-700 hover:bg-gray-600 text-white'
      }`}
    >
      {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : status === 'error' ? 'Error' : label}
    </button>
  )
}

function useStatusReset(status: Status, setStatus: (s: Status) => void) {
  useEffect(() => {
    if (status === 'saved' || status === 'error') {
      const t = setTimeout(() => setStatus('idle'), 2500)
      return () => clearTimeout(t)
    }
  }, [status, setStatus])
}

export function ProfileTab() {
  const { user } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [nameStatus, setNameStatus] = useState<Status>('idle')
  useStatusReset(nameStatus, setNameStatus)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<Status>('idle')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  useStatusReset(passwordStatus, setPasswordStatus)

  useEffect(() => {
    getProfile().then(({ displayName }) => setDisplayName(displayName ?? ''))
  }, [])

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault()
    setNameStatus('saving')
    try {
      await updateDisplayName(displayName.trim())
      setNameStatus('saved')
    } catch {
      setNameStatus('error')
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Minimum 6 characters')
      return
    }
    setPasswordStatus('saving')
    try {
      await updatePassword(newPassword)
      setPasswordStatus('saved')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordStatus('error')
      setPasswordError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <div className="flex flex-col animate-fade-up" style={{ animationFillMode: 'both' }}>
      <Section title="Display name" description="This name is shown across your workouts.">
        <form onSubmit={handleNameSave} className="flex flex-col gap-3">
          <Field label="Name">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition max-w-sm"
            />
          </Field>
          <SaveButton status={nameStatus} />
        </form>
      </Section>

      <Section title="Email">
        <Field label="Email address">
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="bg-gray-700/40 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed max-w-sm"
          />
        </Field>
        <p className="text-xs text-gray-600">Email changes are not yet supported.</p>
      </Section>

      <Section title="Change password">
        <form onSubmit={handlePasswordSave} className="flex flex-col gap-3">
          <Field label="New password">
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition max-w-sm"
            />
          </Field>
          <Field label="Confirm password">
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition max-w-sm"
            />
          </Field>
          {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
          <SaveButton status={passwordStatus} label="Update password" />
        </form>
      </Section>
    </div>
  )
}

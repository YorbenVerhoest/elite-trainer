import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppLogo } from '@/components/AppLogo'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/Button'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signUp(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <AppLogo title="Elite Trainer" />

          <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-6 flex flex-col gap-5 animate-slide-up" style={{ animationFillMode: 'both' }}>
            <h2 className="text-lg font-semibold">Create account</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-gray-500">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-gray-500">Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-600">Minimum 6 characters</p>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  )
}

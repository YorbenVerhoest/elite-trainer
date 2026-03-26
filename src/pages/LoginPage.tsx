import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      <div className="h-px bg-gradient-to-r from-blue-500 via-orange-400 to-transparent fixed top-0 left-0 right-0" />

      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(46,170,255,0.4)]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 21H5L13 3H19L14 11H20L11 21Z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase font-sport bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            Elite Trainer
          </h1>
        </div>

        <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-6 flex flex-col gap-5 animate-slide-up" style={{ animationFillMode: 'both' }}>
          <h2 className="text-lg font-semibold">Sign in</h2>

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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-[0_0_16px_rgba(46,170,255,0.35)] hover:shadow-[0_0_24px_rgba(46,170,255,0.55)] disabled:shadow-none active:scale-95"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

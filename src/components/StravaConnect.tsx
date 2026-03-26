import { useState } from 'react'
import type { useStrava } from '@/hooks/useStrava'
import { Button } from '@/components/Button'

interface Props {
  strava: ReturnType<typeof useStrava>
}

export function StravaConnect({ strava }: Props) {
  const [showSetup, setShowSetup] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  if (strava.isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-orange-400" />
        <span className="text-gray-400">
          Strava: <span className="text-white">{strava.athleteName}</span>
        </span>
        <button
          onClick={strava.disconnect}
          className="text-gray-600 hover:text-gray-400 transition-colors text-xs cursor-pointer"
        >
          disconnect
        </button>
      </div>
    )
  }

  if (showSetup) {
    return (
      <div className="flex flex-col gap-2 bg-gray-800 rounded-xl p-4 w-full sm:w-auto">
        <p className="text-xs text-gray-400 leading-relaxed">
          Create an app at{' '}
          <span className="font-mono text-gray-200">strava.com/settings/api</span> and set the
          callback domain to{' '}
          <span className="font-mono text-gray-200">{window.location.hostname}</span>.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 min-w-0"
          />
          <input
            type="password"
            placeholder="Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 min-w-0"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="solid" color="gray" fullWidth size="sm" onClick={() => setShowSetup(false)}>
            Cancel
          </Button>
          <Button
            color="orange"
            fullWidth
            size="sm"
            disabled={!clientId.trim() || !clientSecret.trim()}
            onClick={() => strava.authorize(clientId.trim(), clientSecret.trim())}
          >
            Authorize
          </Button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowSetup(true)}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
    >
      <div className="w-2 h-2 rounded-full bg-gray-600" />
      Connect Strava
    </button>
  )
}

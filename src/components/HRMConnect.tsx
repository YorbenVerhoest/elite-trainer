import type { useHRM } from '@/hooks/useHRM'

interface Props {
  hrm: ReturnType<typeof useHRM>
}

export function HRMConnect({ hrm }: Props) {
  const { connectionState, heartRate, error, connect, disconnect } = hrm
  const isConnected = connectionState === 'connected'
  const isConnecting = connectionState === 'connecting'

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-gray-400">
          Heart Rate:{' '}
          <span className="text-red-400 font-medium tabular-nums">
            {heartRate !== null ? `${heartRate} bpm` : '—'}
          </span>
        </span>
        <button
          onClick={disconnect}
          className="text-gray-600 hover:text-gray-400 transition-colors text-xs cursor-pointer"
        >
          disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {error && <span className="text-red-400 text-xs">{error}</span>}
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-300 disabled:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <div className="w-2 h-2 rounded-full bg-gray-600" />
        {isConnecting ? 'Searching…' : 'Connect Heart Rate Monitor'}
      </button>
    </div>
  )
}

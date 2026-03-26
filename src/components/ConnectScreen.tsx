import type { ConnectionState } from '@/types/workout'

interface Props {
  connectionState: ConnectionState
  error: string | null
  onConnect: () => void
  onDisconnect: () => void
}

export function ConnectScreen({ connectionState, error, onConnect, onDisconnect }: Props) {
  const isConnected = connectionState === 'connected'
  const isConnecting = connectionState === 'connecting'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="relative w-3 h-3 shrink-0">
          {isConnected && (
            <div className="absolute inset-0 rounded-full bg-green-500 opacity-40 animate-ping" />
          )}
          <div
            className={`relative w-3 h-3 rounded-full ${
              isConnected
                ? 'bg-green-500'
                : isConnecting
                  ? 'bg-yellow-400 animate-pulse'
                  : 'bg-gray-600'
            }`}
          />
        </div>
        <span className="text-sm font-medium text-gray-300">
          {isConnected
            ? 'Connected to Elite Suito Pro'
            : isConnecting
              ? 'Searching for device...'
              : 'Not connected'}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-400 max-w-sm text-center">{error}</p>
      )}

      {!isConnected ? (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-[0_0_16px_rgba(46,170,255,0.35)] hover:shadow-[0_0_24px_rgba(46,170,255,0.55)] disabled:shadow-none active:scale-95"
        >
          {isConnecting ? 'Connecting...' : 'Connect Trainer'}
        </button>
      ) : (
        <button
          onClick={onDisconnect}
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-lg font-medium transition-colors"
        >
          Disconnect
        </button>
      )}
    </div>
  )
}

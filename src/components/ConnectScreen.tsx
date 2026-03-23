import type { ConnectionState } from '../types/bluetooth'

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
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected
              ? 'bg-green-500'
              : isConnecting
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-gray-400'
          }`}
        />
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
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isConnecting ? 'Connecting...' : 'Connect Trainer'}
        </button>
      ) : (
        <button
          onClick={onDisconnect}
          className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Disconnect
        </button>
      )}
    </div>
  )
}

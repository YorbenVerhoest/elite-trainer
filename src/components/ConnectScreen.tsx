import type { ConnectionState } from '@/types/workout'
import { Button } from '@/components/Button'

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
        <Button variant="primary" size="lg" onClick={onConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Trainer'}
        </Button>
      ) : (
        <Button variant="secondary" size="lg" onClick={onDisconnect}>
          Disconnect
        </Button>
      )}
    </div>
  )
}

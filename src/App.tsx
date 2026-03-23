import { useState } from 'react'
import { useBluetooth } from './hooks/useBluetooth'
import { ConnectScreen } from './components/ConnectScreen'
import { Dashboard } from './components/Dashboard'
import { ResistanceControl } from './components/ResistanceControl'
import { ProgramEditor } from './components/ProgramEditor'

type Tab = 'manual' | 'program'

function Tabs({
  setTargetPower,
  setTargetResistance,
  onStart,
  onStop,
}: {
  setTargetPower: (w: number) => void
  setTargetResistance: (l: number) => void
  onStart: () => void
  onStop: () => void
}) {
  const [tab, setTab] = useState<Tab>('manual')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex rounded-lg overflow-hidden border border-gray-700 w-fit">
        <button
          onClick={() => setTab('manual')}
          className={`px-5 py-2 text-sm font-medium transition-colors ${
            tab === 'manual' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setTab('program')}
          className={`px-5 py-2 text-sm font-medium transition-colors ${
            tab === 'program' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          Program
        </button>
      </div>

      {tab === 'manual' ? (
        <ResistanceControl
          onSetPower={setTargetPower}
          onSetResistance={setTargetResistance}
          onStart={onStart}
          onStop={onStop}
        />
      ) : (
        <ProgramEditor onSetPower={setTargetPower} onStart={onStart} onStop={onStop} />
      )}
    </div>
  )
}

export default function App() {
  const {
    connectionState,
    metrics,
    error,
    connect,
    disconnect,
    setTargetPower,
    setTargetResistance,
    startResume,
    stopPause,
  } = useBluetooth()

  const isConnected = connectionState === 'connected'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Elite Trainer</h1>
            <p className="text-sm text-gray-500">Elite Suito Pro controller</p>
          </div>
          <ConnectScreen
            connectionState={connectionState}
            error={error}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>

        {/* Live metrics — always visible but dimmed when disconnected */}
        <div className={isConnected ? '' : 'opacity-40 pointer-events-none'}>
          <Dashboard metrics={metrics} />
        </div>

        {/* Controls — only shown when connected */}
        {isConnected ? (
          <Tabs
            setTargetPower={setTargetPower}
            setTargetResistance={setTargetResistance}
            onStart={startResume}
            onStop={stopPause}
          />
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-10 text-center text-gray-500 text-sm">
            Connect your trainer to start controlling resistance and running programs.
          </div>
        )}
      </div>
    </div>
  )
}

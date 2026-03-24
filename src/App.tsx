import { useState, useEffect } from 'react'
import { useBluetooth } from './hooks/useBluetooth'
import { useStrava } from './hooks/useStrava'
import { useHRM } from './hooks/useHRM'
import { ConnectScreen } from './components/ConnectScreen'
import { StravaConnect } from './components/StravaConnect'
import { HRMConnect } from './components/HRMConnect'
import { Dashboard } from './components/Dashboard'
import { ResistanceControl } from './components/ResistanceControl'
import { ProgramEditor } from './components/ProgramEditor'
import { WorkoutSummary } from './components/WorkoutSummary'
import type { WorkoutRecord } from './types/bluetooth'

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
    setExternalHeartRate,
    startRecording,
    stopRecording,
  } = useBluetooth()

  const strava = useStrava()
  const hrm = useHRM()
  const [workoutRecord, setWorkoutRecord] = useState<WorkoutRecord | null>(null)

  // Feed HRM heart rate into the trainer recording
  useEffect(() => {
    setExternalHeartRate(hrm.heartRate)
  }, [hrm.heartRate, setExternalHeartRate])

  // Handle Strava OAuth redirect callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    if (code && state === 'strava_oauth') {
      window.history.replaceState({}, '', window.location.pathname)
      strava.handleCallback(code)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleWorkoutStart() {
    startRecording()
    startResume()
  }

  function handleWorkoutStop() {
    stopPause()
    const record = stopRecording()
    if (record && record.dataPoints.length > 0) {
      strava.resetUpload()
      setWorkoutRecord(record)
    }
  }

  const isConnected = connectionState === 'connected'

  // Prefer HRM heart rate over any trainer-reported value
  const displayMetrics = { ...metrics, heartRate: hrm.heartRate ?? metrics.heartRate }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
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
          <HRMConnect hrm={hrm} />
          <StravaConnect strava={strava} />
        </div>

        {/* Live metrics — always visible but dimmed when disconnected */}
        <div className={isConnected ? '' : 'opacity-40 pointer-events-none'}>
          <Dashboard metrics={displayMetrics} />
        </div>

        {/* Controls — only shown when connected */}
        {isConnected ? (
          <Tabs
            setTargetPower={setTargetPower}
            setTargetResistance={setTargetResistance}
            onStart={handleWorkoutStart}
            onStop={handleWorkoutStop}
          />
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-10 text-center text-gray-500 text-sm">
            Connect your trainer to start controlling resistance and running programs.
          </div>
        )}
      </div>

      {workoutRecord && (
        <WorkoutSummary
          record={workoutRecord}
          onClose={() => setWorkoutRecord(null)}
          strava={strava}
        />
      )}
    </div>
  )
}

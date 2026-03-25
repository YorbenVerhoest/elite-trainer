import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useBluetooth } from '@/hooks/useBluetooth'
import { useStrava } from '@/hooks/useStrava'
import { useHRM } from '@/hooks/useHRM'
import { ConnectScreen } from '@/components/ConnectScreen'
import { StravaConnect } from '@/components/StravaConnect'
import { HRMConnect } from '@/components/HRMConnect'
import { Dashboard } from '@/components/Dashboard'
import { Tabs } from '@/components/Tabs'
import { WorkoutSummary } from '@/components/WorkoutSummary'
import type { WorkoutRecord } from '@/types/workout'

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
    toast.success('Workout started')
  }

  function handleWorkoutStop() {
    stopPause()
    const record = stopRecording()
    if (record && record.dataPoints.length > 0) {
      strava.resetUpload()
      setWorkoutRecord(record)
    }
    toast('Workout stopped', { icon: '⏹' })
  }

  const isConnected = connectionState === 'connected'

  // Prefer HRM heart rate over any trainer-reported value
  const displayMetrics = { ...metrics, heartRate: hrm.heartRate ?? metrics.heartRate }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
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

        {/* Controls — always visible; start/resistance require connection */}
        <Tabs
          isConnected={isConnected}
          setTargetPower={setTargetPower}
          setTargetResistance={setTargetResistance}
          onStart={handleWorkoutStart}
          onStop={handleWorkoutStop}
        />
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

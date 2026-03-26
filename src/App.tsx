import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useBluetooth } from '@/hooks/useBluetooth'
import { useMockBluetooth } from '@/hooks/useMockBluetooth'
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
  const isMock = new URLSearchParams(window.location.search).has('mock')
  const realTrainer = useBluetooth()
  const mockTrainer = useMockBluetooth()
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
  } = isMock ? mockTrainer : realTrainer

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
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
    >
      {/* Top accent bar */}
      <div className="h-px bg-gradient-to-r from-blue-500 via-orange-400 to-transparent" />

      <Toaster position="bottom-center" toastOptions={{ style: { background: '#141830', color: '#fff', border: '1px solid #323863' } }} />
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(46,170,255,0.4)]">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 21H5L13 3H19L14 11H20L11 21Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-widest uppercase font-sport bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent leading-none">
                  Elite Trainer
                </h1>
                <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">Elite Suito Pro</p>
              </div>
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

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useBluetooth } from '@/hooks/useBluetooth'
import { useMockBluetooth } from '@/hooks/useMockBluetooth'
import { useStrava } from '@/hooks/useStrava'
import { useHRM } from '@/hooks/useHRM'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/contexts/AuthContext'
import { ConnectScreen } from '@/components/ConnectScreen'
import { StravaConnect } from '@/components/StravaConnect'
import { HRMConnect } from '@/components/HRMConnect'
import { Dashboard } from '@/components/Dashboard'
import { Tabs } from '@/components/Tabs'
import { WorkoutSummary } from '@/components/WorkoutSummary'
import { AppLogo } from '@/components/AppLogo'
import { PageShell } from '@/components/PageShell'
import type { WorkoutRecord } from '@/types/workout'

export function TrainerPage() {
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
  const { user, signOut } = useAuth()
  const workouts = useWorkouts()
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
      workouts.resetSave()
      setWorkoutRecord(record)
      // Auto-save to Supabase in the background
      if (user) {
        workouts.saveWorkout(record, user.id).then((id) => {
          if (id) toast.success('Workout saved')
          else toast.error('Could not save workout')
        })
      }
    }
    toast('Workout stopped', { icon: '⏹' })
  }

  const isConnected = connectionState === 'connected'
  const displayMetrics = { ...metrics, heartRate: hrm.heartRate ?? metrics.heartRate }

  return (
    <PageShell>
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#152240', color: '#fff', border: '1px solid #2a4068' } }} />
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fade-up" style={{ animationFillMode: 'both' }}>
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <AppLogo title="Elite Trainer" subtitle="Elite Suito Pro" />

            <div className="flex items-center gap-4">
              <Link
                to="/account"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Account
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
              >
                Sign out
              </button>
              <ConnectScreen
                connectionState={connectionState}
                error={error}
                onConnect={connect}
                onDisconnect={disconnect}
              />
            </div>
          </div>
          <HRMConnect hrm={hrm} />
          <StravaConnect strava={strava} />
        </div>

        {/* Live metrics */}
        <div className={isConnected ? '' : 'opacity-40 pointer-events-none'}>
          <Dashboard metrics={displayMetrics} />
        </div>

        {/* Controls */}
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
          saveStatus={workouts.saveStatus}
          savedWorkoutId={workouts.savedWorkoutId}
        />
      )}
    </PageShell>
  )
}

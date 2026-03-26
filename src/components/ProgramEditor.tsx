import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProgramRunner } from '@/hooks/useProgramRunner'
import { usePrograms } from '@/hooks/usePrograms'
import { Spinner } from '@/components/Spinner'
import type { SavedProgram } from '@/api/programs'

interface Props {
  isConnected: boolean
  onSetPower: (watts: number) => void
  onStart: () => void
  onStop: () => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function ProgramEditor({ isConnected, onSetPower, onStart, onStop }: Props) {
  const { programs, loading } = usePrograms()
  const runner = useProgramRunner(onStart, onStop)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Auto-select the first program when programs load
  useEffect(() => {
    if (programs.length > 0 && !selectedId) {
      setSelectedId(programs[0].id)
    }
  }, [programs, selectedId])

  const selected: SavedProgram | null = programs.find((p) => p.id === selectedId) ?? null
  const totalDuration = selected ? selected.steps.reduce((s, p) => s + p.durationSeconds, 0) : 0

  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-5 border border-gray-700/50">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">Select Program</h2>
        <Link
          to="/account/programs"
          className="text-xs text-gray-600 hover:text-blue-400 transition-colors"
        >
          Manage →
        </Link>
      </div>

      {/* Program list */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-600 py-2">
          <Spinner size="sm" />
          Loading programs…
        </div>
      ) : programs.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500">No saved programs yet.</p>
          <Link
            to="/account/programs"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1 inline-block"
          >
            Create one in Account →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {programs.map((p) => {
            const dur = p.steps.reduce((s, x) => s + x.durationSeconds, 0)
            const isSelected = p.id === selectedId
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                disabled={runner.isRunning}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all disabled:cursor-not-allowed animate-fade-up ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 text-white'
                    : 'bg-gray-700/40 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}
                style={{ animationFillMode: 'both' }}
              >
                <span className="text-sm font-medium truncate">{p.name}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-3">
                  {p.steps.length} steps · {formatDuration(dur)}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected program step preview */}
      {selected && !runner.isRunning && (
        <div className="flex flex-col gap-1.5 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gray-600">Steps</span>
            <span className="text-xs text-gray-600">Total {formatDuration(totalDuration)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-1.5 bg-gray-700/50 rounded-lg px-2.5 py-1.5 text-xs text-gray-400"
                title={`${step.targetPower} W`}
              >
                <span>{step.label}</span>
                <span className="text-gray-600">·</span>
                <span className="text-orange-400 font-sport font-semibold">{step.targetPower}W</span>
                <span className="text-gray-600">·</span>
                <span>{formatDuration(step.durationSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Running indicator + upcoming steps */}
      {runner.isRunning && selected && selected.steps[runner.currentStepIndex] && (
        <div className="flex flex-col gap-2 animate-slide-up">
          {/* Current step */}
          <div className="bg-blue-900/40 border border-blue-700 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-400 uppercase tracking-wide">Now Running</p>
              <p className="text-white font-medium">{selected.steps[runner.currentStepIndex].label}</p>
              <p className="text-sm text-orange-400">
                {selected.steps[runner.currentStepIndex].targetPower} W
              </p>
            </div>
            <span
              key={runner.stepSecondsLeft}
              className="text-3xl font-bold tabular-nums text-white font-sport animate-value-pop"
            >
              {formatTime(runner.stepSecondsLeft)}
            </span>
          </div>

          {/* Upcoming steps — show up to 3, fade out with distance */}
          {selected.steps.slice(runner.currentStepIndex + 1, runner.currentStepIndex + 4).map((step, i) => (
            <div
              key={step.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-700/30 transition-all"
              style={{ opacity: 1 - (i + 1) * 0.28 }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-gray-600 shrink-0">
                  {i === 0 ? 'Next' : `+${i + 1}`}
                </span>
                <span className="text-xs text-gray-400 truncate">{step.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500">
                <span className="font-sport font-semibold text-gray-400">{step.targetPower}W</span>
                <span className="text-gray-700">·</span>
                <span>{formatDuration(step.durationSeconds)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start / Stop */}
      <div>
        {!runner.isRunning ? (
          <button
            onClick={() => selected && runner.start(selected.steps, onSetPower)}
            disabled={!selected || selected.steps.length === 0 || !isConnected}
            title={!isConnected ? 'Connect your trainer to start' : undefined}
            className="w-full py-2.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors active:scale-95"
          >
            {isConnected ? 'Start Workout' : 'Connect Trainer to Start'}
          </button>
        ) : (
          <button
            onClick={runner.stop}
            className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-lg font-medium transition-colors active:scale-95"
          >
            Stop Workout
          </button>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import type { WorkoutStep, WorkoutProgram } from '../types/bluetooth'

interface Props {
  onSetPower: (watts: number) => void
  onStart: () => void
  onStop: () => void
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

const DEFAULT_PROGRAM: WorkoutProgram = {
  id: generateId(),
  name: 'My Workout',
  steps: [
    { id: generateId(), label: 'Warm Up', durationSeconds: 300, targetPower: 100 },
    { id: generateId(), label: 'Interval 1', durationSeconds: 120, targetPower: 200 },
    { id: generateId(), label: 'Recovery', durationSeconds: 120, targetPower: 100 },
    { id: generateId(), label: 'Interval 2', durationSeconds: 120, targetPower: 220 },
    { id: generateId(), label: 'Cool Down', durationSeconds: 300, targetPower: 80 },
  ],
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ProgramEditor({ onSetPower, onStart, onStop }: Props) {
  const [program, setProgram] = useState<WorkoutProgram>(DEFAULT_PROGRAM)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepSecondsLeft, setStepSecondsLeft] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopWorkout = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(false)
    setCurrentStepIndex(0)
    setStepSecondsLeft(0)
    onStop()
  }, [onStop])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function startWorkout() {
    if (program.steps.length === 0) return
    const firstStep = program.steps[0]
    setCurrentStepIndex(0)
    setStepSecondsLeft(firstStep.durationSeconds)
    setIsRunning(true)
    onStart()
    onSetPower(firstStep.targetPower)

    let stepIdx = 0
    let secondsLeft = firstStep.durationSeconds

    intervalRef.current = setInterval(() => {
      secondsLeft -= 1
      setStepSecondsLeft(secondsLeft)

      if (secondsLeft <= 0) {
        stepIdx += 1
        if (stepIdx >= program.steps.length) {
          // Workout complete
          if (intervalRef.current) clearInterval(intervalRef.current)
          setIsRunning(false)
          setCurrentStepIndex(0)
          setStepSecondsLeft(0)
          onStop()
          return
        }
        const nextStep = program.steps[stepIdx]
        setCurrentStepIndex(stepIdx)
        secondsLeft = nextStep.durationSeconds
        setStepSecondsLeft(secondsLeft)
        onSetPower(nextStep.targetPower)
      }
    }, 1000)
  }

  function addStep() {
    setProgram((p) => ({
      ...p,
      steps: [
        ...p.steps,
        { id: generateId(), label: 'New Step', durationSeconds: 60, targetPower: 150 },
      ],
    }))
  }

  function removeStep(id: string) {
    setProgram((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== id) }))
  }

  function updateStep(id: string, patch: Partial<WorkoutStep>) {
    setProgram((p) => ({
      ...p,
      steps: p.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }

  const totalDuration = program.steps.reduce((acc, s) => acc + s.durationSeconds, 0)

  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">Workout Program</h2>
        <span className="text-xs text-gray-500">Total: {formatTime(totalDuration)}</span>
      </div>

      {/* Program name */}
      <input
        type="text"
        value={program.name}
        onChange={(e) => setProgram((p) => ({ ...p, name: e.target.value }))}
        disabled={isRunning}
        className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Running indicator */}
      {isRunning && program.steps[currentStepIndex] && (
        <div className="bg-blue-900/40 border border-blue-700 rounded-lg p-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-blue-400 uppercase tracking-wide">Now Running</p>
            <p className="text-white font-medium">{program.steps[currentStepIndex].label}</p>
            <p className="text-sm text-orange-400">
              {program.steps[currentStepIndex].targetPower} W
            </p>
          </div>
          <span className="text-3xl font-bold tabular-nums text-white">
            {formatTime(stepSecondsLeft)}
          </span>
        </div>
      )}

      {/* Steps list */}
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {program.steps.map((step, idx) => (
          <div
            key={step.id}
            className={`flex gap-2 items-center rounded-lg p-2 transition-colors ${
              isRunning && idx === currentStepIndex
                ? 'bg-blue-900/30 border border-blue-700'
                : 'bg-gray-700/50'
            }`}
          >
            <span className="text-xs text-gray-500 w-5 text-center">{idx + 1}</span>
            <input
              type="text"
              value={step.label}
              onChange={(e) => updateStep(step.id, { label: e.target.value })}
              disabled={isRunning}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-28 focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={Math.floor(step.durationSeconds / 60)}
                min={0}
                max={120}
                onChange={(e) =>
                  updateStep(step.id, {
                    durationSeconds: Number(e.target.value) * 60 + (step.durationSeconds % 60),
                  })
                }
                disabled={isRunning}
                className="bg-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-14 text-center focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-500 text-xs">min</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={step.targetPower}
                min={50}
                max={500}
                step={5}
                onChange={(e) => updateStep(step.id, { targetPower: Number(e.target.value) })}
                disabled={isRunning}
                className="bg-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-16 text-center focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-500 text-xs">W</span>
            </div>
            <button
              onClick={() => removeStep(step.id)}
              disabled={isRunning}
              className="ml-auto text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <>
            <button
              onClick={addStep}
              className="py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Add Step
            </button>
            <button
              onClick={startWorkout}
              disabled={program.steps.length === 0}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Start Workout
            </button>
          </>
        ) : (
          <button
            onClick={stopWorkout}
            className="flex-1 py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Stop Workout
          </button>
        )}
      </div>
    </div>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import type { WorkoutStep } from '@/types/workout'

export function useProgramRunner(onStart: () => void, onStop: () => void) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepSecondsLeft, setStepSecondsLeft] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
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

  function start(steps: WorkoutStep[], onSetPower: (watts: number) => void) {
    if (steps.length === 0) return
    const firstStep = steps[0]
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
        if (stepIdx >= steps.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setIsRunning(false)
          setCurrentStepIndex(0)
          setStepSecondsLeft(0)
          onStop()
          return
        }
        const nextStep = steps[stepIdx]
        setCurrentStepIndex(stepIdx)
        secondsLeft = nextStep.durationSeconds
        setStepSecondsLeft(secondsLeft)
        onSetPower(nextStep.targetPower)
      }
    }, 1000)
  }

  return { isRunning, currentStepIndex, stepSecondsLeft, start, stop }
}

import { useState } from 'react'
import { ResistanceControl } from '@/components/ResistanceControl'
import { ProgramEditor } from '@/components/ProgramEditor'

interface Props {
  isConnected: boolean
  setTargetPower: (w: number) => void
  setTargetResistance: (l: number) => void
  onStart: () => void
  onStop: () => void
}

export function Tabs({ isConnected, setTargetPower, setTargetResistance, onStart, onStop }: Props) {
  const [programRunning, setProgramRunning] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <ResistanceControl
        isConnected={isConnected}
        onSetPower={setTargetPower}
        onSetResistance={setTargetResistance}
        onStart={onStart}
        onStop={onStop}
        programRunning={programRunning}
      />
      <ProgramEditor
        isConnected={isConnected}
        onSetPower={setTargetPower}
        onStart={onStart}
        onStop={onStop}
        onRunningChange={setProgramRunning}
      />
    </div>
  )
}

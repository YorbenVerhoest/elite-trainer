import { useState } from 'react'
import { ResistanceControl } from '@/components/ResistanceControl'
import { ProgramEditor } from '@/components/ProgramEditor'

type Tab = 'manual' | 'program'

interface Props {
  isConnected: boolean
  setTargetPower: (w: number) => void
  setTargetResistance: (l: number) => void
  onStart: () => void
  onStop: () => void
}

export function Tabs({ isConnected, setTargetPower, setTargetResistance, onStart, onStop }: Props) {
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
          isConnected={isConnected}
          onSetPower={setTargetPower}
          onSetResistance={setTargetResistance}
          onStart={onStart}
          onStop={onStop}
        />
      ) : (
        <ProgramEditor isConnected={isConnected} onSetPower={setTargetPower} onStart={onStart} onStop={onStop} />
      )}
    </div>
  )
}

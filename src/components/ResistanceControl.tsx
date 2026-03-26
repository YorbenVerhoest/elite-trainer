import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/Button'

interface Props {
  isConnected: boolean
  onSetPower: (watts: number) => void
  onSetResistance: (level: number) => void
  onStart: () => void
  onStop: () => void
  programRunning?: boolean
}

type Mode = 'power' | 'resistance'

export function ResistanceControl({ isConnected, onSetPower, onSetResistance, onStart, onStop, programRunning = false }: Props) {
  const [mode, setMode] = useState<Mode>('power')
  const [powerValue, setPowerValue] = useState(150)
  const [resistanceValue, setResistanceValue] = useState(5)
  const [activePower, setActivePower] = useState<number | null>(null)
  const [activeResistance, setActiveResistance] = useState<number | null>(null)

  function handleApply() {
    if (mode === 'power') {
      onSetPower(powerValue)
      setActivePower(powerValue)
      toast.success(`Target power set to ${powerValue} W`)
    } else {
      onSetResistance(resistanceValue)
      setActiveResistance(resistanceValue)
      toast.success(`Resistance set to level ${resistanceValue}`)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-5 border border-gray-700/50">
      <h2 className="text-xs uppercase tracking-widest text-gray-500">Manual Control</h2>

      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-700">
        <button
          onClick={() => setMode('power')}
          className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
            mode === 'power' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          ERG (Power)
        </button>
        <button
          onClick={() => setMode('resistance')}
          className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
            mode === 'resistance' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          Resistance
        </button>
      </div>

      {mode === 'power' ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Target Power</span>
              {activePower !== null && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Active: {activePower} W
                </span>
              )}
            </div>
            <span className="text-3xl font-bold text-orange-400 tabular-nums font-sport">
              {powerValue} W
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={400}
            step={5}
            value={powerValue}
            onChange={(e) => setPowerValue(Number(e.target.value))}
            className="w-full accent-orange-400 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>50 W</span>
            <span>400 W</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Resistance Level</span>
              {activeResistance !== null && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Active: {activeResistance}
                </span>
              )}
            </div>
            <span className="text-3xl font-bold text-blue-400 tabular-nums font-sport">
              {resistanceValue}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={resistanceValue}
            onChange={(e) => setResistanceValue(Number(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span>20</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button fullWidth onClick={handleApply} disabled={!isConnected}>
          Apply
        </Button>
        {!programRunning && (
          <>
            <Button color="green" onClick={onStart} disabled={!isConnected}>
              Start
            </Button>
            <Button color="red" onClick={onStop} disabled={!isConnected}>
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

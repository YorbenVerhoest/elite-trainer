import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  isConnected: boolean
  onSetPower: (watts: number) => void
  onSetResistance: (level: number) => void
  onStart: () => void
  onStop: () => void
}

type Mode = 'power' | 'resistance'

export function ResistanceControl({ isConnected, onSetPower, onSetResistance, onStart, onStop }: Props) {
  const [mode, setMode] = useState<Mode>('power')
  const [powerValue, setPowerValue] = useState(150)
  const [resistanceValue, setResistanceValue] = useState(5)

  function handleApply() {
    if (mode === 'power') {
      onSetPower(powerValue)
      toast.success(`Target power set to ${powerValue} W`)
    } else {
      onSetResistance(resistanceValue)
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
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === 'power' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          ERG (Power)
        </button>
        <button
          onClick={() => setMode('resistance')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === 'resistance' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          Resistance
        </button>
      </div>

      {mode === 'power' ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Target Power</span>
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
            className="w-full accent-orange-400"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>50 W</span>
            <span>400 W</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Resistance Level</span>
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
            className="w-full accent-blue-400"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span>20</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleApply}
          disabled={!isConnected}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Apply
        </button>
        <button
          onClick={onStart}
          disabled={!isConnected}
          className="py-2.5 px-4 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Start
        </button>
        <button
          onClick={onStop}
          disabled={!isConnected}
          className="py-2.5 px-4 bg-red-800 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Stop
        </button>
      </div>
    </div>
  )
}

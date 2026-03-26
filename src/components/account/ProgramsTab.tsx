import { useState } from 'react'
import { usePrograms } from '@/hooks/usePrograms'
import { formatDuration } from '@/lib/workoutStats' // reuse existing helper... wait, it's in workoutStats

// helper — total duration of program steps
function totalSeconds(steps: { durationSeconds: number }[]) {
  return steps.reduce((s, p) => s + p.durationSeconds, 0)
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`
  return `${s}s`
}

export function ProgramsTab() {
  const { programs, loading, saveProgram, removeProgram } = usePrograms()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(id: string, currentName: string) {
    setEditingId(id)
    setEditingName(currentName)
  }

  async function commitRename(id: string, steps: { durationSeconds: number; id: string; label: string; targetPower: number }[]) {
    if (!editingName.trim()) { setEditingId(null); return }
    await saveProgram({ dbId: id, name: editingName.trim(), steps })
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await removeProgram(id)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <p className="text-gray-500">No saved programs yet.</p>
        <p className="text-xs text-gray-600 mt-1">Build a program in the Program tab and hit Save.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-gray-800 animate-fade-up" style={{ animationFillMode: 'both' }}>
      {programs.map((p, index) => (
        <div
          key={p.id}
          className="flex items-start justify-between gap-4 py-4 group animate-fade-up"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {editingId === p.id ? (
              <input
                autoFocus
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => commitRename(p.id, p.steps)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(p.id, p.steps)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="bg-gray-700 border border-blue-500 rounded-lg px-3 py-1.5 text-sm outline-none text-white max-w-xs"
              />
            ) : (
              <button
                onClick={() => startEdit(p.id, p.name)}
                className="text-sm text-white font-medium text-left hover:text-blue-300 transition-colors truncate max-w-xs"
                title="Click to rename"
              >
                {p.name}
              </button>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{p.steps.length} step{p.steps.length !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{formatTime(totalSeconds(p.steps))}</span>
              <span>·</span>
              <span className="text-gray-600">
                {p.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Step preview */}
            <div className="flex flex-wrap gap-1 mt-1">
              {p.steps.map((step) => (
                <span
                  key={step.id}
                  className="text-xs bg-gray-700/60 text-gray-400 rounded px-2 py-0.5"
                  title={`${step.targetPower} W · ${formatTime(step.durationSeconds)}`}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleDelete(p.id)}
            disabled={deletingId === p.id}
            className="shrink-0 text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors opacity-0 group-hover:opacity-100 text-sm mt-0.5 active:scale-90"
            title="Delete program"
          >
            {deletingId === p.id ? (
              <div className="w-4 h-4 border border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      ))}
    </div>
  )
}

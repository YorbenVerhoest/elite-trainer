import { useState } from 'react'
import { usePrograms } from '@/hooks/usePrograms'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/Button'
import type { WorkoutStep } from '@/types/workout'

function generateId() {
  return Math.random().toString(36).slice(2)
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`
  return `${s}s`
}

// ─── Inline step editor ───────────────────────────────────────────────────────
function StepEditor({
  steps,
  onChange,
}: {
  steps: WorkoutStep[]
  onChange: (steps: WorkoutStep[]) => void
}) {
  function add() {
    onChange([...steps, { id: generateId(), label: 'New Step', durationSeconds: 60, targetPower: 150 }])
  }
  function remove(id: string) {
    onChange(steps.filter((s) => s.id !== id))
  }
  function update(id: string, patch: Partial<WorkoutStep>) {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
        {steps.length === 0 && (
          <p className="text-xs text-gray-600 italic py-2">No steps yet — add one below.</p>
        )}
        {steps.map((step, idx) => (
          <div key={step.id} className="flex gap-2 items-center bg-gray-700/50 rounded-lg p-2 animate-fade-up" style={{ animationFillMode: 'both' }}>
            <span className="text-xs text-gray-600 w-4 text-center shrink-0">{idx + 1}</span>
            <input
              type="text"
              value={step.label}
              onChange={(e) => update(step.id, { label: e.target.value })}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-28 focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={Math.floor(step.durationSeconds / 60)}
                min={0}
                max={120}
                onChange={(e) =>
                  update(step.id, { durationSeconds: Number(e.target.value) * 60 + (step.durationSeconds % 60) })
                }
                className="bg-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-14 text-center focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-600 text-xs">min</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={step.targetPower}
                min={50}
                max={500}
                step={5}
                onChange={(e) => update(step.id, { targetPower: Number(e.target.value) })}
                className="bg-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-16 text-center focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-600 text-xs">W</span>
            </div>
            <button
              onClick={() => remove(step.id)}
              className="ml-auto text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="self-start text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700/50 active:scale-95"
      >
        + Add step
      </button>
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────
export function ProgramsTab() {
  const { programs, loading, saveStatus, saveProgram, removeProgram } = usePrograms()

  // 'new' | program DB id | null (nothing open)
  const [openId, setOpenId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSteps, setEditSteps] = useState<WorkoutStep[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openNew() {
    setOpenId('new')
    setEditName('New Program')
    setEditSteps([])
  }

  function openEdit(id: string, name: string, steps: WorkoutStep[]) {
    setOpenId(id)
    setEditName(name)
    setEditSteps(steps.map((s) => ({ ...s })))
  }

  function cancel() {
    setOpenId(null)
    setEditName('')
    setEditSteps([])
  }

  async function save() {
    const result = await saveProgram({
      dbId: openId === 'new' ? null : openId,
      name: editName.trim() || 'Untitled',
      steps: editSteps,
    })
    if (result) cancel()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    if (openId === id) cancel()
    await removeProgram(id)
    setDeletingId(null)
  }

  const isSaving = saveStatus === 'saving'
  const totalEditDuration = editSteps.reduce((s, p) => s + p.durationSeconds, 0)

  if (loading) {
    return <Spinner centered />
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up" style={{ animationFillMode: 'both' }}>

      {/* New program button */}
      {openId !== 'new' && (
        <Button variant="ghost" onClick={openNew} className="self-start">
          + New Program
        </Button>
      )}

      {/* Inline editor — new program */}
      {openId === 'new' && (
        <div className="flex flex-col gap-4 border border-blue-500/30 bg-blue-600/5 rounded-xl p-4 animate-slide-up" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-blue-400">New Program</span>
            <button onClick={cancel} className="text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors">×</button>
          </div>
          <input
            autoFocus
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Program name"
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <StepEditor steps={editSteps} onChange={setEditSteps} />
          <div className="flex items-center justify-between">
            {totalEditDuration > 0 && (
              <span className="text-xs text-gray-600">Total: {formatTime(totalEditDuration)}</span>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={cancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-white transition-colors active:scale-95 cursor-pointer">
                Cancel
              </button>
              <Button size="sm" onClick={save} disabled={isSaving || editSteps.length === 0}>
                {isSaving ? 'Saving…' : 'Save Program'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saved programs list */}
      {programs.length === 0 && openId !== 'new' ? (
        <p className="text-sm text-gray-500 py-4">No saved programs yet. Create one above.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-700/50">
          {programs.map((p, index) => (
            <div
              key={p.id}
              className="flex flex-col py-4 animate-fade-up"
              style={{ animationDelay: `${index * 45}ms`, animationFillMode: 'both' }}
            >
              {/* Program row */}
              <div className="flex items-start justify-between gap-3 group">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-white truncate">{p.name}</span>
                  <span className="text-xs text-gray-500">
                    {p.steps.length} step{p.steps.length !== 1 ? 's' : ''} · {formatTime(p.steps.reduce((s, x) => s + x.durationSeconds, 0))}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      openId === p.id ? cancel() : openEdit(p.id, p.name, p.steps)
                    }
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
                      openId === p.id
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'
                    }`}
                  >
                    {openId === p.id ? 'Close' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-xs text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors opacity-0 group-hover:opacity-100 active:scale-90"
                  >
                    {deletingId === p.id ? <Spinner size="sm" /> : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Inline editor — existing program */}
              {openId === p.id && (
                <div className="flex flex-col gap-4 mt-4 animate-fade-up" style={{ animationFillMode: 'both' }}>
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                  <StepEditor steps={editSteps} onChange={setEditSteps} />
                  <div className="flex items-center justify-between">
                    {totalEditDuration > 0 && (
                      <span className="text-xs text-gray-600">Total: {formatTime(totalEditDuration)}</span>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <button onClick={cancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-white transition-colors active:scale-95 cursor-pointer">
                        Cancel
                      </button>
                      <Button size="sm" onClick={save} disabled={isSaving || editSteps.length === 0}>
                        {isSaving ? 'Saving…' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

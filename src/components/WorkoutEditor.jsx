import { useEffect, useRef, useState } from 'react'
import { formatLong, relative } from '../dates.js'
import { uid } from '../storage.js'
import { workoutStats, convert, fmt } from '../stats.js'

export default function WorkoutEditor({
  workout, defaultUnit, exerciseNames, canCompare, onChange, onDelete, onClose, onCompare, onCopy,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copying, setCopying] = useState(false)
  const [copyTo, setCopyTo] = useState('')
  const [dragId, setDragId] = useState(null)      // exercise being dragged
  const [handleId, setHandleId] = useState(null)  // exercise whose handle is held
  const [overIndex, setOverIndex] = useState(null)
  const [focusId, setFocusId] = useState(null)    // newly added exercise to focus
  const listEnd = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!confirmDelete) return
    const t = setTimeout(() => setConfirmDelete(false), 3000)
    return () => clearTimeout(t)
  }, [confirmDelete])

  const setExercises = (fn) => onChange((w) => ({ ...w, exercises: fn(w.exercises) }))
  const updateExercise = (id, fn) =>
    setExercises((exs) => exs.map((ex) => (ex.id === id ? fn(ex) : ex)))

  function addExercise() {
    const id = uid()
    setExercises((exs) => [
      ...exs,
      { id, name: '', sets: [{ id: uid(), reps: '', weight: '', unit: defaultUnit }] },
    ])
    setFocusId(id)
    setTimeout(() => listEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 30)
  }

  function move(from, to) {
    setExercises((exs) => {
      if (to < 0 || to >= exs.length || from === to) return exs
      const next = [...exs]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  function addSet(exId) {
    updateExercise(exId, (ex) => {
      const last = ex.sets[ex.sets.length - 1]
      const set = last
        ? { ...last, id: uid() }
        : { id: uid(), reps: '', weight: '', unit: defaultUnit }
      return { ...ex, sets: [...ex.sets, set] }
    })
  }

  const updateSet = (exId, setId, patch) =>
    updateExercise(exId, (ex) => ({
      ...ex,
      sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
    }))

  const removeSet = (exId, setId) =>
    updateExercise(exId, (ex) => ({ ...ex, sets: ex.sets.filter((s) => s.id !== setId) }))

  const stats = workoutStats(workout)

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-label="Workout editor">
        <header className="drawer-head">
          <div>
            <div className="eyebrow">{relative(workout.date)}</div>
            <h2>{formatLong(workout.date)}</h2>
          </div>
          <button className="btn icon ghost" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="drawer-sub">
          <input
            className="title-input"
            placeholder="Workout name (optional) — e.g. Push day"
            value={workout.title}
            onChange={(e) => onChange((w) => ({ ...w, title: e.target.value }))}
          />
          <div className="stat-row">
            <span><b>{stats.exercises}</b> exercises</span>
            <span><b>{stats.sets}</b> sets</span>
            <span><b>{fmt(stats.reps)}</b> reps</span>
            <span><b>{fmt(Math.round(convert(stats.volumeKg, defaultUnit)))}</b> {defaultUnit} volume</span>
          </div>
        </div>

        <div className="drawer-body">
          {workout.exercises.length === 0 && (
            <div className="empty">
              <p>No exercises yet.</p>
              <button className="btn primary" onClick={addExercise}>+ Add exercise</button>
            </div>
          )}

          <datalist id="exercise-names">
            {exerciseNames.map((n) => <option key={n} value={n} />)}
          </datalist>

          <ol className="exercise-list">
            {workout.exercises.map((ex, i) => (
              <li
                key={ex.id}
                className={[
                  'exercise',
                  dragId === ex.id && 'dragging',
                  overIndex === i && dragId && dragId !== ex.id && 'drop-target',
                ].filter(Boolean).join(' ')}
                draggable={handleId === ex.id}
                onDragStart={(e) => {
                  setDragId(ex.id)
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', ex.id)
                }}
                onDragOver={(e) => {
                  if (!dragId) return
                  e.preventDefault()
                  setOverIndex(i)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const from = workout.exercises.findIndex((x) => x.id === dragId)
                  if (from !== -1) move(from, i)
                  setDragId(null); setOverIndex(null); setHandleId(null)
                }}
                onDragEnd={() => { setDragId(null); setOverIndex(null); setHandleId(null) }}
              >
                <div className="ex-head">
                  <span
                    className="drag-handle"
                    title="Drag to reorder"
                    onMouseDown={() => setHandleId(ex.id)}
                    onMouseUp={() => setHandleId(null)}
                    aria-hidden
                  >⋮⋮</span>
                  <span className="ex-index">{i + 1}</span>
                  <input
                    className="ex-name"
                    list="exercise-names"
                    placeholder="Exercise name"
                    value={ex.name}
                    autoFocus={focusId === ex.id}
                    onChange={(e) => updateExercise(ex.id, (x) => ({ ...x, name: e.target.value }))}
                  />
                  <div className="ex-tools">
                    <button className="btn icon ghost sm" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up" title="Move up">↑</button>
                    <button className="btn icon ghost sm" onClick={() => move(i, i + 1)} disabled={i === workout.exercises.length - 1} aria-label="Move down" title="Move down">↓</button>
                    <button
                      className="btn icon ghost sm danger"
                      onClick={() => setExercises((exs) => exs.filter((x) => x.id !== ex.id))}
                      aria-label="Remove exercise"
                      title="Remove exercise"
                    >✕</button>
                  </div>
                </div>

                <table className="sets">
                  {ex.sets.length > 0 && (
                    <thead>
                      <tr><th>Set</th><th>Reps</th><th>Weight</th><th>Unit</th><th /></tr>
                    </thead>
                  )}
                  <tbody>
                    {ex.sets.map((s, si) => (
                      <tr key={s.id}>
                        <td className="set-no">{si + 1}</td>
                        <td>
                          <input
                            type="number" inputMode="numeric" min="0" step="1"
                            placeholder="0" aria-label={`Set ${si + 1} reps`}
                            value={s.reps}
                            onChange={(e) => updateSet(ex.id, s.id, { reps: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="number" inputMode="decimal" min="0" step="0.5"
                            placeholder="0" aria-label={`Set ${si + 1} weight`}
                            value={s.weight}
                            onChange={(e) => updateSet(ex.id, s.id, { weight: e.target.value })}
                          />
                        </td>
                        <td>
                          <div className="segmented sm" role="group" aria-label={`Set ${si + 1} unit`}>
                            {['kg', 'lbs'].map((u) => (
                              <button
                                key={u}
                                className={s.unit === u ? 'on' : ''}
                                onClick={() => updateSet(ex.id, s.id, { unit: u })}
                              >{u}</button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn icon ghost sm danger"
                            onClick={() => removeSet(ex.id, s.id)}
                            aria-label={`Remove set ${si + 1}`}
                            title="Remove set"
                          >✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn link" onClick={() => addSet(ex.id)}>+ Add set</button>
              </li>
            ))}
          </ol>
          <div ref={listEnd} />
          {workout.exercises.length > 0 && (
            <button className="btn dashed" onClick={addExercise}>+ Add exercise</button>
          )}
        </div>

        <footer className="drawer-foot">
          <button
            className={`btn ${confirmDelete ? 'danger-solid' : 'danger'}`}
            onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
          >
            {confirmDelete ? 'Click again to delete' : 'Delete workout'}
          </button>
          <div className="spacer" />
          {copying ? (
            <div className="copy-box">
              <input
                type="date"
                aria-label="Copy to date"
                value={copyTo}
                onChange={(e) => setCopyTo(e.target.value)}
              />
              <button
                className="btn primary"
                disabled={!copyTo || copyTo === workout.date}
                onClick={() => onCopy(copyTo)}
                title="Copies exercises and sets, without reps or weight"
              >Copy</button>
              <button className="btn ghost" onClick={() => setCopying(false)}>Cancel</button>
            </div>
          ) : (
            <>
              <button
                className="btn"
                onClick={() => setCopying(true)}
                disabled={workout.exercises.length === 0}
                title="Copy exercises and sets to another day"
              >Copy to…</button>
              <button className="btn" onClick={onCompare} disabled={!canCompare}>Compare…</button>
            </>
          )}
          <button className="btn primary" onClick={onClose}>Done</button>
        </footer>
      </aside>
    </div>
  )
}

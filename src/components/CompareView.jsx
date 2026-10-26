import { useEffect } from 'react'
import { formatShort, relative } from '../dates.js'
import { exerciseStats, workoutStats, convert, fmt, normName, num } from '../stats.js'

const setText = (s) => {
  if (!s) return '—'
  const r = s.reps === '' ? '–' : fmt(num(s.reps))
  const w = s.weight === '' ? '–' : fmt(num(s.weight))
  return `${r} × ${w} ${s.unit}`
}

function Delta({ value, unit }) {
  const rounded = Math.round(value * 10) / 10
  if (!rounded) return <span className="delta same">±0{unit ? ` ${unit}` : ''}</span>
  return (
    <span className={`delta ${rounded > 0 ? 'up' : 'down'}`}>
      {rounded > 0 ? '+' : '−'}{fmt(Math.abs(rounded))}{unit ? ` ${unit}` : ''}
    </span>
  )
}

function Column({ label, dateKey, workout, unit, onOpen }) {
  if (!workout) {
    return <div className="cmp-col empty-col">Pick a workout for {label}.</div>
  }
  const st = workoutStats(workout)
  return (
    <div className="cmp-col">
      <div className="cmp-col-head">
        <div>
          <span className={`pill ${label === 'B' ? 'b' : ''}`}>{label}</span>
          <h3>{formatShort(dateKey)}</h3>
          <div className="muted">
            {relative(dateKey)}{workout.title.trim() && <> · {workout.title}</>}
          </div>
        </div>
        <button className="btn sm" onClick={() => onOpen(dateKey)}>Open</button>
      </div>
      <div className="stat-row">
        <span><b>{st.exercises}</b> ex</span>
        <span><b>{st.sets}</b> sets</span>
        <span><b>{fmt(st.reps)}</b> reps</span>
        <span><b>{fmt(Math.round(convert(st.volumeKg, unit)))}</b> {unit}</span>
      </div>
      {workout.exercises.length === 0 && <p className="muted">No exercises logged.</p>}
      <ol className="cmp-exercises">
        {workout.exercises.map((ex) => (
          <li key={ex.id}>
            <div className="cmp-ex-name">{ex.name.trim() || <i className="muted">Unnamed exercise</i>}</div>
            <div className="cmp-sets">
              {ex.sets.length === 0 && <span className="muted">No sets</span>}
              {ex.sets.map((s, i) => (
                <span key={s.id} className="cmp-set">
                  <span className="set-no">{i + 1}</span>{setText(s)}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function CompareView({ workouts, dates, a, b, unit, onChange, onClose, onOpen }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const wa = a && workouts[a]
  const wb = b && workouts[b]

  // Exercises that appear in both, in B's order
  const shared = []
  if (wa && wb) {
    const byName = new Map()
    for (const ex of wa.exercises) {
      const k = normName(ex.name)
      if (k && !byName.has(k)) byName.set(k, ex)
    }
    const used = new Set()
    for (const ex of wb.exercises) {
      const k = normName(ex.name)
      if (k && byName.has(k) && !used.has(k)) {
        used.add(k)
        shared.push({ name: ex.name.trim(), sa: exerciseStats(byName.get(k)), sb: exerciseStats(ex) })
      }
    }
  }

  const option = (d) => {
    const w = workouts[d]
    return `${formatShort(d)}${w.title.trim() ? ` — ${w.title.trim()}` : ''} (${relative(d)})`
  }

  return (
    <div className="overlay center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal compare" role="dialog" aria-label="Compare workouts">
        <header className="drawer-head">
          <div>
            <div className="eyebrow">Side by side</div>
            <h2>Compare workouts</h2>
          </div>
          <button className="btn icon ghost" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="cmp-pickers">
          <label>
            <span className="pill">A</span>
            <select value={a || ''} onChange={(e) => onChange({ a: e.target.value || null, b })}>
              <option value="">Choose a workout…</option>
              {dates.map((d) => <option key={d} value={d}>{option(d)}</option>)}
            </select>
          </label>
          <button
            className="btn icon"
            onClick={() => onChange({ a: b, b: a })}
            title="Swap"
            aria-label="Swap A and B"
          >⇄</button>
          <label>
            <span className="pill b">B</span>
            <select value={b || ''} onChange={(e) => onChange({ a, b: e.target.value || null })}>
              <option value="">Choose a workout…</option>
              {dates.map((d) => <option key={d} value={d}>{option(d)}</option>)}
            </select>
          </label>
        </div>

        <div className="modal-body">
          {wa && wb && (
            <section className="shared">
              <h4>
                Shared exercises
                <span className="muted"> · change from A → B</span>
              </h4>
              {shared.length === 0 ? (
                <p className="muted">These two workouts have no exercises with the same name.</p>
              ) : (
                <div className="table-wrap">
                  <table className="shared-table">
                    <thead>
                      <tr>
                        <th>Exercise</th>
                        <th>A top set</th>
                        <th>B top set</th>
                        <th>Top weight</th>
                        <th>Volume ({unit})</th>
                        <th>Reps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shared.map(({ name, sa, sb }) => (
                        <tr key={name}>
                          <td className="strong">{name}</td>
                          <td>{setText(sa.top)}</td>
                          <td>{setText(sb.top)}</td>
                          <td><Delta value={convert(sb.topKg - sa.topKg, unit)} unit={unit} /></td>
                          <td><Delta value={Math.round(convert(sb.volumeKg - sa.volumeKg, unit))} /></td>
                          <td><Delta value={sb.reps - sa.reps} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          <div className="cmp-cols">
            <Column label="A" dateKey={a} workout={wa} unit={unit} onOpen={onOpen} />
            <Column label="B" dateKey={b} workout={wb} unit={unit} onOpen={onOpen} />
          </div>
        </div>
      </div>
    </div>
  )
}

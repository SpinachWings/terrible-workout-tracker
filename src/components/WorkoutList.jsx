import { useMemo } from 'react'
import { formatShort } from '../dates.js'

export const workoutLabel = (w) => w.title.trim() || 'Untitled workout'

export default function WorkoutList({ workouts, sort, onChangeSort, onOpen, footer }) {
  const items = useMemo(() => {
    const list = Object.values(workouts)
    if (sort === 'name') {
      return list.sort(
        (a, b) => workoutLabel(a).localeCompare(workoutLabel(b), undefined, { sensitivity: 'base' }) ||
          b.date.localeCompare(a.date)
      )
    }
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [workouts, sort])

  return (
    <section className="workout-list" aria-label="Workout list">
      <div className="list-head">
        <h2>Workouts</h2>
        <div className="segmented sm" role="group" aria-label="Sort workouts by">
          {[
            ['date', 'Date'],
            ['name', 'Name'],
          ].map(([id, label]) => (
            <button key={id} className={sort === id ? 'on' : ''} onClick={() => onChangeSort(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty">No workouts logged yet. Switch to the calendar to add one.</div>
      ) : (
        <ul className="list-items">
          {items.map((w) => {
            const sets = w.exercises.reduce((a, e) => a + e.sets.length, 0)
            return (
              <li key={w.date}>
                <button className="list-item" onClick={() => onOpen(w.date)}>
                  <span className="list-check" aria-hidden />
                  <span className="list-main">
                    <span className="list-name">{workoutLabel(w)}</span>
                    <span className="list-date">{formatShort(w.date)}</span>
                  </span>
                  <span className="list-count">
                    {w.exercises.length} ex · {sets} sets
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <div className="cal-foot">{footer}</div>
    </section>
  )
}

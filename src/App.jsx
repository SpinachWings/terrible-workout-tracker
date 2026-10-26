import { useEffect, useMemo, useState } from 'react'
import Calendar from './components/Calendar.jsx'
import WorkoutEditor from './components/WorkoutEditor.jsx'
import CompareView from './components/CompareView.jsx'
import { loadWorkouts, saveWorkouts, loadPrefs, savePrefs } from './storage.js'
import { toKey, fromKey } from './dates.js'
import { normName } from './stats.js'

export default function App() {
  const [workouts, setWorkouts] = useState(loadWorkouts)
  const [prefs, setPrefs] = useState(loadPrefs)
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [openDate, setOpenDate] = useState(null)
  const [compare, setCompare] = useState(null) // { a, b } date keys

  useEffect(() => saveWorkouts(workouts), [workouts])
  useEffect(() => savePrefs(prefs), [prefs])

  const sortedDates = useMemo(
    () => Object.keys(workouts).sort().reverse(),
    [workouts]
  )

  const exerciseNames = useMemo(() => {
    const seen = new Map()
    for (const w of Object.values(workouts))
      for (const ex of w.exercises)
        if (ex.name.trim() && !seen.has(normName(ex.name))) seen.set(normName(ex.name), ex.name.trim())
    return [...seen.values()].sort((a, b) => a.localeCompare(b))
  }, [workouts])

  function handleDayClick(key) {
    if (!workouts[key]) {
      setWorkouts((ws) => ({ ...ws, [key]: { date: key, title: '', exercises: [] } }))
    }
    setOpenDate(key)
  }

  function updateWorkout(key, updater) {
    setWorkouts((ws) => (ws[key] ? { ...ws, [key]: updater(ws[key]) } : ws))
  }

  function deleteWorkout(key) {
    setWorkouts((ws) => {
      const next = { ...ws }
      delete next[key]
      return next
    })
    setOpenDate(null)
  }

  function closeEditor() {
    // A workout opened from an empty date and left empty isn't kept,
    // so a stray click doesn't colour the calendar.
    const w = workouts[openDate]
    if (w && w.exercises.length === 0 && !w.title.trim()) deleteWorkout(openDate)
    setOpenDate(null)
  }

  function openCompare(fromKey_) {
    if (fromKey_) {
      // Pair with the closest earlier workout sharing an exercise, else the closest earlier one.
      const base = workouts[fromKey_]
      const names = new Set(base.exercises.map((e) => normName(e.name)).filter(Boolean))
      const earlier = sortedDates.filter((d) => d < fromKey_)
      const match =
        earlier.find((d) => workouts[d].exercises.some((e) => names.has(normName(e.name)))) ||
        earlier[0] ||
        sortedDates.find((d) => d !== fromKey_) ||
        null
      setCompare({ a: match, b: fromKey_ })
      setOpenDate(null)
    } else {
      setCompare({ a: sortedDates[1] || null, b: sortedDates[0] || null })
    }
  }

  function goToDate(key) {
    const d = fromKey(key)
    setView({ year: d.getFullYear(), month: d.getMonth() })
  }

  const thisMonthCount = sortedDates.filter((d) => {
    const x = fromKey(d)
    return x.getFullYear() === view.year && x.getMonth() === view.month
  }).length

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>▮▮</span>
          <span>Workout Tracker</span>
        </div>
        <div className="topbar-actions">
          <div className="segmented" role="group" aria-label="Default unit">
            {['kg', 'lbs'].map((u) => (
              <button
                key={u}
                className={prefs.unit === u ? 'on' : ''}
                onClick={() => setPrefs((p) => ({ ...p, unit: u }))}
                title="Default unit for new sets and totals"
              >
                {u}
              </button>
            ))}
          </div>
          <button
            className="btn primary"
            onClick={() => openCompare(null)}
            disabled={sortedDates.length < 2}
            title={sortedDates.length < 2 ? 'Log at least two workouts to compare' : ''}
          >
            Compare workouts
          </button>
        </div>
      </header>

      <main className="main">
        <Calendar
          year={view.year}
          month={view.month}
          todayKey={toKey(today)}
          workouts={workouts}
          onChangeView={setView}
          onDayClick={handleDayClick}
          footer={
            <>
              <span>
                <b>{thisMonthCount}</b> workout{thisMonthCount === 1 ? '' : 's'} this month ·{' '}
                <b>{sortedDates.length}</b> total
              </span>
              <span className="hint">Click any date to log or open a workout</span>
            </>
          }
        />
      </main>

      {openDate && workouts[openDate] && (
        <WorkoutEditor
          workout={workouts[openDate]}
          defaultUnit={prefs.unit}
          exerciseNames={exerciseNames}
          canCompare={sortedDates.length >= 2}
          onChange={(updater) => updateWorkout(openDate, updater)}
          onDelete={() => deleteWorkout(openDate)}
          onClose={closeEditor}
          onCompare={() => openCompare(openDate)}
        />
      )}

      {compare && (
        <CompareView
          workouts={workouts}
          dates={sortedDates}
          a={compare.a}
          b={compare.b}
          unit={prefs.unit}
          onChange={setCompare}
          onClose={() => setCompare(null)}
          onOpen={(key) => {
            setCompare(null)
            goToDate(key)
            setOpenDate(key)
          }}
        />
      )}
    </div>
  )
}

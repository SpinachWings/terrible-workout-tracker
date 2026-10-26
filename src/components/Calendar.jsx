import { MONTHS, WEEKDAYS, monthGrid, toKey } from '../dates.js'

export default function Calendar({ year, month, todayKey, workouts, onChangeView, onDayClick, footer }) {
  const days = monthGrid(year, month)

  const shift = (delta) => {
    const d = new Date(year, month + delta, 1)
    onChangeView({ year: d.getFullYear(), month: d.getMonth() })
  }
  const now = new Date()
  const years = []
  const keys = Object.keys(workouts)
  const minYear = Math.min(now.getFullYear() - 5, year, ...keys.map((k) => +k.slice(0, 4)))
  const maxYear = Math.max(now.getFullYear() + 1, year)
  for (let y = maxYear; y >= minYear; y--) years.push(y)

  return (
    <section className="calendar" aria-label="Workout calendar">
      <div className="cal-head">
        <div className="cal-title">
          <select
            aria-label="Month"
            value={month}
            onChange={(e) => onChangeView({ year, month: +e.target.value })}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            aria-label="Year"
            value={year}
            onChange={(e) => onChangeView({ year: +e.target.value, month })}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="cal-nav">
          <button className="btn icon" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
          <button
            className="btn"
            onClick={() => onChangeView({ year: now.getFullYear(), month: now.getMonth() })}
          >
            Today
          </button>
          <button className="btn icon" onClick={() => shift(1)} aria-label="Next month">›</button>
        </div>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
        {days.map((d) => {
          const key = toKey(d)
          const w = workouts[key]
          const outside = d.getMonth() !== month
          const names = w ? w.exercises.map((e) => e.name.trim()).filter(Boolean) : []
          const cls = [
            'cal-day',
            outside && 'outside',
            w && 'has-workout',
            key === todayKey && 'today',
          ].filter(Boolean).join(' ')
          return (
            <button
              key={key}
              className={cls}
              onClick={() => onDayClick(key)}
              aria-label={`${d.toDateString()}${w ? ', workout logged' : ''}`}
            >
              <span className="day-num">{d.getDate()}</span>
              {w && (
                <span className="day-body">
                  {w.title.trim() && <span className="day-title">{w.title}</span>}
                  {names.slice(0, w.title.trim() ? 1 : 2).map((n, i) => (
                    <span key={i} className="day-ex">{n}</span>
                  ))}
                  <span className="day-count">
                    {w.exercises.length} ex · {w.exercises.reduce((a, e) => a + e.sets.length, 0)} sets
                  </span>
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="cal-foot">{footer}</div>
    </section>
  )
}

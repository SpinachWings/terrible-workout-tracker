const LB_TO_KG = 0.45359237

export const toKg = (weight, unit) => (unit === 'lbs' ? weight * LB_TO_KG : weight)
export const convert = (kg, unit) => (unit === 'lbs' ? kg / LB_TO_KG : kg)

export const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export const fmt = (n) =>
  Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 1 })

export function exerciseStats(ex) {
  let volumeKg = 0
  let reps = 0
  let topKg = 0
  let top = null
  for (const s of ex.sets) {
    const r = num(s.reps)
    const w = num(s.weight)
    const kg = toKg(w, s.unit)
    reps += r
    volumeKg += r * kg
    if (kg > topKg || (top === null && (r || w))) {
      topKg = kg
      top = s
    }
  }
  return { sets: ex.sets.length, reps, volumeKg, topKg, top }
}

export function workoutStats(w) {
  const per = w.exercises.map(exerciseStats)
  return {
    exercises: w.exercises.length,
    sets: per.reduce((a, s) => a + s.sets, 0),
    reps: per.reduce((a, s) => a + s.reps, 0),
    volumeKg: per.reduce((a, s) => a + s.volumeKg, 0),
  }
}

export const normName = (name) => name.trim().toLowerCase()

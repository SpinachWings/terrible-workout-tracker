const KEY = 'twt.workouts.v1'
const PREF_KEY = 'twt.prefs.v1'

export function loadWorkouts() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveWorkouts(workouts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(workouts))
  } catch {
    /* storage full or unavailable */
  }
}

export function loadPrefs() {
  try {
    return { unit: 'kg', ...(JSON.parse(localStorage.getItem(PREF_KEY)) || {}) }
  } catch {
    return { unit: 'kg' }
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

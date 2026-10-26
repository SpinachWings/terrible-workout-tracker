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

export const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'forest', label: 'Forest' },
  { id: 'grape', label: 'Grape' },
]

export function loadPrefs() {
  try {
    return { unit: 'kg', theme: 'system', ...(JSON.parse(localStorage.getItem(PREF_KEY)) || {}) }
  } catch {
    return { unit: 'kg', theme: 'system' }
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

export const pad = (n) => String(n).padStart(2, '0')

export const toKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function formatLong(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function formatShort(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

// "3 months ago", "yesterday", etc.
export function relative(key) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((fromKey(key) - today) / 86400000)
  if (days === 0) return 'today'
  if (days === -1) return 'yesterday'
  if (days === 1) return 'tomorrow'
  const abs = Math.abs(days)
  let text
  if (abs < 14) text = `${abs} days`
  else if (abs < 60) text = `${Math.round(abs / 7)} weeks`
  else if (abs < 730) text = `${Math.round(abs / 30.44)} months`
  else text = `${Math.round(abs / 365.25)} years`
  return days < 0 ? `${text} ago` : `in ${text}`
}

// 6x7 grid of dates starting on Monday
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - offset)
  return Array.from({ length: 42 }, (_, i) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
  )
}

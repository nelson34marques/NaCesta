const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
})

export function startOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function addDays(date, amount) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

export function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatTime(iso) {
  return timeFormatter.format(new Date(iso))
}

export function formatShortDate(iso) {
  return shortDateFormatter.format(new Date(iso)).replace('.', '')
}

export function formatLongDate(date) {
  return longDateFormatter.format(date)
}

export function dayLabel(date) {
  const today = startOfDay(new Date())
  if (sameDay(date, today)) return 'Hoje'
  if (sameDay(date, addDays(today, -1))) return 'Ontem'
  if (sameDay(date, addDays(today, 1))) return 'Amanhã'
  return weekdayFormatter.format(date)
}

export function formatCountdown(iso, now = Date.now()) {
  const diff = new Date(iso).getTime() - now
  if (diff <= 0) return 'a começar'

  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return `em ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const rest = minutes % 60
    return rest ? `em ${hours}h ${rest}min` : `em ${hours}h`
  }

  const days = Math.floor(hours / 24)
  const restHours = hours % 24
  return restHours ? `em ${days}d ${restHours}h` : `em ${days}d`
}

export function formatPct(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return value.toFixed(3).replace(/^0\./, '.')
}

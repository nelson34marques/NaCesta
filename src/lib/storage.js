export function readJSON(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignora falhas de quota/modo privado.
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignora falhas de quota/modo privado.
  }
}

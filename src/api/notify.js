const BASE_URL = (import.meta.env?.VITE_NOTIFY_URL ?? '').replace(/\/+$/, '')
const SECRET = import.meta.env?.VITE_NOTIFY_SECRET ?? ''

function notifyUrl(path) {
  return `${BASE_URL}${path}`
}

function notifyHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(SECRET ? { 'X-Notify-Secret': SECRET } : {}),
  }
}

async function requestJSON(url, options) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`email request failed with ${response.status}`)
  }
  return data
}

export async function fetchEmailStatus(signal) {
  try {
    return await requestJSON(notifyUrl('/api/notify/status'), {
      signal,
      headers: notifyHeaders(),
    })
  } catch {
    return { enabled: false }
  }
}

export function sendEmailAlert({ subject, text }, signal) {
  return requestJSON(notifyUrl('/api/notify'), {
    method: 'POST',
    headers: notifyHeaders(),
    body: JSON.stringify({ subject, text }),
    signal,
  })
}

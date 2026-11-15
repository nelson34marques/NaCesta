import { useCallback, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'nbatoday:notified'
const MAX_ENTRIES = 100

function readNotified() {
  const stored = readJSON(STORAGE_KEY, [])
  return new Set(Array.isArray(stored) ? stored : [])
}

export function useNotifications() {
  const supported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState(() =>
    supported ? window.Notification.permission : 'unsupported',
  )

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported'
    const result = await window.Notification.requestPermission()
    setPermission(result)
    return result
  }, [supported])

  const notify = useCallback(
    (key, title, body) => {
      if (!supported || window.Notification.permission !== 'granted') return
      const notified = readNotified()
      if (notified.has(key)) return

      notified.add(key)
      writeJSON(STORAGE_KEY, [...notified].slice(-MAX_ENTRIES))

      const notification = new window.Notification(title, {
        body,
        tag: key,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      })
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    },
    [supported],
  )

  return { supported, permission, requestPermission, notify }
}

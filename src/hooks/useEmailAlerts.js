import { useCallback, useEffect, useState } from 'react'
import { fetchEmailStatus, sendEmailAlert } from '../api/notify'
import { readJSON, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'nbatoday:emailed'
const MAX_ENTRIES = 100

function readEmailed() {
  const stored = readJSON(STORAGE_KEY, [])
  return new Set(Array.isArray(stored) ? stored : [])
}

function writeEmailed(set) {
  writeJSON(STORAGE_KEY, [...set].slice(-MAX_ENTRIES))
}

export function useEmailAlerts() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchEmailStatus(controller.signal).then((config) => {
      setEnabled(Boolean(config?.enabled))
    })
    return () => controller.abort()
  }, [])

  const email = useCallback(
    (key, subject, text) => {
      if (!enabled) return

      const emailed = readEmailed()
      if (emailed.has(key)) return
      emailed.add(key)
      writeEmailed(emailed)

      sendEmailAlert({ subject, text }).catch(() => {
        const current = readEmailed()
        current.delete(key)
        writeEmailed(current)
      })
    },
    [enabled],
  )

  return { enabled, email }
}

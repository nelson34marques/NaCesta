import { useCallback, useState } from 'react'
import { readJSON, removeKey, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'nbatoday:favorite-team'

export function useFavoriteTeam() {
  const [team, setTeam] = useState(() => readJSON(STORAGE_KEY))

  const selectTeam = useCallback((nextTeam) => {
    writeJSON(STORAGE_KEY, nextTeam)
    setTeam(nextTeam)
  }, [])

  const clearTeam = useCallback(() => {
    removeKey(STORAGE_KEY)
    setTeam(null)
  }, [])

  return { team, selectTeam, clearTeam }
}

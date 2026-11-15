import { useCallback, useEffect, useState } from 'react'

export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    const controller = new AbortController()

    setState((previous) => ({
      data: previous.data,
      loading: previous.data == null,
      error: null,
    }))

    loader(controller.signal)
      .then((data) => {
        if (!alive) return
        setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!alive || controller.signal.aborted) return
        setState((previous) => ({
          data: previous.data,
          loading: false,
          error: previous.data == null ? error : previous.error,
        }))
      })

    return () => {
      alive = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  return { ...state, reload }
}

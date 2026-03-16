import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const prefixedKey = `criterion-${key}`

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        window.localStorage.setItem(prefixedKey, JSON.stringify(next))
      } catch {
        // localStorage full or unavailable
      }
      return next
    })
  }, [prefixedKey])

  return [storedValue, setValue]
}

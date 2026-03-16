import { useRef, useCallback } from 'react'

export function useLongPress(onLongPress, onClick, delay = 500) {
  const timerRef = useRef(null)
  const firedRef = useRef(false)

  const start = useCallback((e) => {
    firedRef.current = false
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      onLongPress(e)
    }, delay)
  }, [onLongPress, delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleClick = useCallback((e) => {
    if (!firedRef.current) {
      onClick(e)
    }
  }, [onClick])

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onClick: handleClick,
  }
}

import { useEffect, useRef } from 'react'

/**
 * Returns the previous render's value.
 * Handy for exit animations and for "did the filter actually change" checks.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

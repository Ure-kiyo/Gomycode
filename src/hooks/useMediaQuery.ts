import { useEffect, useRef } from 'react'

/** Runs a callback on window resize past a breakpoint. */
export function useMediaQuery(query: string): boolean {
  const ref = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const list = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => {
      ref.current = event.matches
    }
    ref.current = list.matches
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return ref.current
}

/** Tailwind's `md` breakpoint — used to switch mobile/desktop layouts. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}

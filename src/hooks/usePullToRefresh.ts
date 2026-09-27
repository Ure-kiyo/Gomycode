import { useCallback, useEffect, useRef, useState } from 'react'

/** Debounces a rapidly-changing value (e.g. composer autocomplete input). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

export interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  enabled?: boolean
  /** How far the user must pull before the refresh arms. */
  threshold?: number
  maxPull?: number
}

/**
 * Pull-to-refresh for a scroll container.
 *
 * Touch-only by design: a mouse drag shouldn't hijack normal scrolling. The
 * returned `handlers` spread onto the scrolling element; `pullDistance` lets the
 * UI show a spinner that tracks the gesture.
 */
export function usePullToRefresh({ onRefresh, enabled = true, threshold = 72, maxPull = 120 }: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isBusy, setIsBusy] = useState(false)
  const startY = useRef<number | null>(null)

  const onTouchStart = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (!enabled || isBusy) return
      // Only pull when the container is already at the top of its scroll.
      if (event.currentTarget.scrollTop > 0) return
      startY.current = event.touches[0]?.clientY ?? null
    },
    [enabled, isBusy],
  )

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (!enabled || startY.current === null || isBusy) return
      const currentY = event.touches[0]?.clientY ?? 0
      const delta = currentY - startY.current
      if (delta <= 0) {
        setPullDistance(0)
        return
      }
      // Rubber-band: resistance increases the further the user pulls.
      setPullDistance(Math.min(maxPull, delta * 0.45))
    },
    [enabled, isBusy, maxPull],
  )

  const onTouchEnd = useCallback(async () => {
    if (startY.current === null) return
    startY.current = null
    if (pullDistance < threshold) {
      setPullDistance(0)
      return
    }
    setIsBusy(true)
    setPullDistance(maxPull * 0.6)
    try {
      await onRefresh()
    } finally {
      setPullDistance(0)
      setIsBusy(false)
    }
  }, [isBusy, maxPull, pullDistance, threshold])

  return {
    pullDistance,
    isArmed: pullDistance >= threshold,
    isBusy,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      style: { touchAction: 'pan-y' } as React.CSSProperties,
    },
  }
}

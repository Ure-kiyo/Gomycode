import { useEffect, useState } from 'react'

import type { CategoryId } from '@/types'
import { useUserStore } from '@/store/useUserStore'

/**
 * Bootstraps the app's mock session:
 *  - loads the profile once
 *  - re-resolves the persisted chat thread against the catalogue
 *  - primes the personalised feed
 *
 * Mounted once, from the app shell.
 */
export function useAppBootstrap() {
  const [isReady, setIsReady] = useState(false)
  const loadProfile = useUserStore((state) => state.loadProfile)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      // Dynamic imports keep the store module graph acyclic at load time.
      const [{ useChatStore }, { useCatalogStore }] = await Promise.all([
        import('@/store/useChatStore'),
        import('@/store/useCatalogStore'),
      ])

      await Promise.all([loadProfile(), useChatStore.getState().hydrateProducts()])
      await useCatalogStore.getState().refresh()

      if (!cancelled) setIsReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [loadProfile])

  return { isReady }
}

/** Categories the user has explicitly picked in preferences. */
export function useInterestCategories(): CategoryId[] {
  return useUserStore((state) => state.preferences.categories)
}

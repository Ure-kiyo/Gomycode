import { useEffect } from 'react'

import { applyThemeToDocument, useThemeStore } from '@/store/useThemeStore'

/**
 * Keeps `<html data-theme>` in sync with the theme store and the OS preference.
 *
 * Mounted once in the app shell. The initial value is already applied by the
 * inline script in `index.html`, so there is never a flash of the wrong theme.
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode)
  const resolved = useThemeStore((state) => state.resolved)
  const setMode = useThemeStore((state) => state.setMode)
  const syncSystemTheme = useThemeStore((state) => state.syncSystemTheme)

  useEffect(() => {
    applyThemeToDocument(resolved)
  }, [resolved])

  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'system') return

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      syncSystemTheme(event.matches ? 'dark' : 'light')
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [mode, syncSystemTheme])

  return { mode, resolved, setMode }
}

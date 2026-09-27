import { create } from 'zustand'

import { STORAGE_KEYS } from '@/constants/app'
import type { ThemePreference } from '@/types'
import { readStorage, writeStorage } from '@/utils/storage'

export type ThemeMode = ThemePreference
export type ResolvedTheme = 'light' | 'dark'

/**
 * Theme is deliberately *not* persisted through zustand's `persist` middleware:
 * the pre-paint script in `index.html` reads the same storage key as a plain
 * string, so the two can never disagree (and there is no flash of wrong theme).
 */
function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initialMode(): ThemeMode {
  const stored = readStorage(STORAGE_KEYS.theme)
  return isThemeMode(stored) ? stored : 'dark'
}

interface ThemeState {
  /** `system` defers to the OS preference and re-resolves whenever it changes. */
  mode: ThemeMode
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  /** Applied by the OS listener; ignored unless `mode === 'system'`. */
  syncSystemTheme: (theme: ResolvedTheme) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode(),
  resolved: initialMode() === 'light' ? 'light' : 'dark',

  setMode: (mode) => {
    writeStorage(STORAGE_KEYS.theme, mode)
    set({ mode, resolved: mode === 'system' ? readSystemTheme() : mode })
  },

  syncSystemTheme: (theme) => {
    if (get().mode !== 'system') return
    set({ resolved: theme })
  },
}))

/** Imperative helper for the `<html data-theme>` effect. */
export function applyThemeToDocument(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

import { STORAGE_KEYS } from '@/constants/app'

/**
 * localStorage wrapper that never throws.
 *
 * Safari private mode, disabled storage and quota errors are all common enough
 * on mobile that every call site would otherwise need a try/catch. Storage
 * failures degrade to in-memory only for the session.
 */
const memoryFallback = new Map<string, string>()

function backend(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    const probeKey = '__sift_probe__'
    window.localStorage.setItem(probeKey, '1')
    window.localStorage.removeItem(probeKey)
    return window.localStorage
  } catch {
    return {
      getItem: (key) => memoryFallback.get(key) ?? null,
      setItem: (key, value) => void memoryFallback.set(key, value),
      removeItem: (key) => void memoryFallback.delete(key),
    }
  }
}

let store: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = null

function lazyStore() {
  store ??= typeof window === 'undefined' ? null : backend()
  return store
}

export function readStorage(key: string): string | null {
  return lazyStore()?.getItem(key) ?? null
}

export function writeStorage(key: string, value: string): void {
  lazyStore()?.setItem(key, value)
}

export function removeStorage(key: string): void {
  lazyStore()?.removeItem(key)
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    // Corrupted or legacy payload — drop it rather than crash on boot.
    removeStorage(key)
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    writeStorage(key, JSON.stringify(value))
  } catch {
    /* value not serialisable or quota exceeded — state stays in memory */
  }
}

export function clearAppStorage(): void {
  Object.values(STORAGE_KEYS).forEach(removeStorage)
}

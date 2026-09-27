/** Collision-resistant enough for client-side mock ids. */
export function createId(prefix = 'id'): string {
  const time = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${time}${rand}`
}

/** Deterministic 32-bit hash — powers the mock engine's stable "randomness". */
export function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

/** Seeded PRNG so reshuffled feeds differ per seed but stay reproducible. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items]
  let state = seed % 2147483647 || 1
  const next = () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1))
    const a = result[i] as T
    const b = result[j] as T
    result[i] = b
    result[j] = a
  }
  return result
}

/** Seeded PRNG (mulberry32) so reshuffled feeds differ per seed but replay. */
export function createSeededRandom(seed: number): () => number {
  let state = (seed % 2147483647) || 1
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}


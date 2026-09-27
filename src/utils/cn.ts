type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, boolean>

/**
 * Tiny `clsx`-style class joiner. Kept local so the app has no runtime class
 * dependency; drop in `clsx` + `tailwind-merge` if class conflicts start
 * needing resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []

  for (const input of inputs) {
    if (!input) continue
    if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) out.push(nested)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key)
      }
    } else {
      out.push(String(input))
    }
  }

  return out.join(' ')
}

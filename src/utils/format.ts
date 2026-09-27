const dzdFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
})

/** `45 000 DA` — full precision, for prices in cards and detail views. */
export function formatPrice(value: number): string {
  return `${dzdFormatter.format(value)} DA`
}

/** `45k DA` — for dense UI like budget chips and feed subtitles. */
export function formatPriceCompact(value: number): string {
  if (value >= 1000) {
    const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(value)
    return `${compact} DA`
  }
  return formatPrice(value)
}

/** `45 000 DA` */
export function formatPriceShort(value: number): string {
  return formatPrice(value)
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10_000 ? 0 : 1)}k`
  return String(count)
}

/** `2 days ago` style relative time for search history. */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diffSeconds = Math.max(0, Math.round((now - timestamp) / 1000))
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.348],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ]

  let value = -diffSeconds
  for (const [unit, step] of units) {
    if (Math.abs(value) < step || unit === 'year') {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round(value), unit)
    }
    value /= step
  }
  return 'just now'
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

/** Whole-percent discount, or `null` when the item isn't discounted. */
export function discountPercent(price: number, listPrice?: number): number | null {
  if (!listPrice || listPrice <= price) return null
  return Math.round(((listPrice - price) / listPrice) * 100)
}

import { PRICE_BOUNDS } from '@/constants/app'
import type { CategoryId, PriceRange, ResolvedQuery, SortKey, StoreId } from '@/types'
import { clamp } from '@/utils/id'
import { CATEGORIES, STORES } from '@/constants/taxonomy'
import { BRANDS, STOP_WORDS } from './catalog'

/* -------------------------------------------------------------------------- */
/* Tokenising helpers                                                         */
/* -------------------------------------------------------------------------- */

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9$%.\- ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** `1.2k` / `1,200` / `$999` → a number. */
function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[,$\s]/g, '').trim()
  const match = /^(\d+(?:\.\d+)?)(k)?$/.exec(cleaned)
  if (!match) return null
  const [, digits, thousands] = match
  if (!digits) return null
  const value = Number(digits) * (thousands ? 1000 : 1)
  return Number.isFinite(value) ? value : null
}

/* -------------------------------------------------------------------------- */
/* Intents — the "conversational refinement" vocabulary                        */
/* -------------------------------------------------------------------------- */

export type RefinementIntent =
  | 'cheaper'
  | 'premium'
  | 'better-rated'
  | 'more-reviewed'
  | 'store-only'
  | 'exclude-store'
  | 'in-stock'
  | 'free-shipping'
  | 'clear-filters'
  | 'more-options'

const REFINEMENT_PATTERNS: Array<{ intent: RefinementIntent; test: RegExp }> = [
  { intent: 'cheaper', test: /\b(cheaper|less expensive|lower price|drop the price|cost less|reduce)\b/ },
  { intent: 'premium', test: /\b(premium|better|higher end|top of the line|nicer|upgrade)\b/ },
  { intent: 'better-rated', test: /\b(highest rated|best rated|top rated|better reviews|better rated)\b/ },
  { intent: 'more-reviewed', test: /\b(most (popular|reviewed)|well reviewed|popular ones)\b/ },
  { intent: 'in-stock', test: /\b(in stock|available now|ships today|ready to ship)\b/ },
  { intent: 'free-shipping', test: /\b(free shipping|free delivery|ships free|prime)\b/ },
  { intent: 'clear-filters', test: /\b(clear (filters|it|that)|start over|reset|show everything|no filters)\b/ },
  { intent: 'exclude-store', test: /\b(not|except|exclude|don'?t (show|include))\b/ },
  { intent: 'store-only', test: /\b(show only|only from|just (amazon|ebay|walmart|target|best ?buy|newegg|nike|ikea|rei)|amazon only|ebay only)\b/ },
]

/** "cheaper ones", "the second one" — refine vs. brand-new intent. */
const REFINEMENT_ONLY = /^(cheaper|expensive|premium|others|ones|those|these|more|less|similar|another|different|better)$/

export function detectIntents(query: string): RefinementIntent[] {
  const normalized = query.toLowerCase()
  return REFINEMENT_PATTERNS.filter(({ test }) => test.test(normalized)).map(({ intent }) => intent)
}

export function isPureRefinement(query: string): boolean {
  const tokens = tokenize(query).filter((token) => !STOP_WORDS.has(token))
  if (tokens.length === 0) return false
  // Contains a category/brand/store noun → treat as a fresh search.
  return tokens.every((token) => REFINEMENT_ONLY.test(token) || /^\d+(\.\d+)?k?$/.test(token))
}

/* -------------------------------------------------------------------------- */
/* Entity extraction                                                          */
/* -------------------------------------------------------------------------- */

function matchCategory(tokens: string[]): CategoryId | undefined {
  let best: { id: CategoryId; score: number } | undefined
  for (const category of CATEGORIES) {
    for (const keyword of category.keywords) {
      if (!tokens.some((token) => token === keyword || token.startsWith(keyword))) continue
      // Prefer the longest matching keyword (e.g. "gaming laptop" over "laptop").
      const score = keyword.length
      if (!best || score > best.score) best = { id: category.id, score }
    }
  }
  return best?.id
}

function matchBrand(tokens: string[]): string | undefined {
  for (const { canonical, aliases } of BRANDS) {
    if (aliases.length === 0) continue
    if (tokens.some((token) => aliases.includes(token))) return canonical
  }
  return undefined
}

function matchStore(text: string): StoreId | undefined {
  const normalized = text.toLowerCase()
  const found = STORES.find((store) => {
    const name = store.name.toLowerCase()
    const short = store.shortName.toLowerCase()
    return normalized.includes(name) || (short.length > 3 && normalized.includes(short))
  })
  return found?.id
}

function matchPrice(tokens: string[]): PriceRange | undefined {
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] as string
    const next = tokens[i + 1]
    const previous = tokens[i - 1]

    // "under $1000", "below 500", "less than 800"
    if (/(under|below|less|cheaper than|up to|max)/.test(token) && next) {
      const amount = parseAmount(next)
      if (amount !== null) return { min: 0, max: amount }
    }
    // "over $2000", "above 1500"
    if (/(over|above|more than|at least|from)/.test(token) && next) {
      const amount = parseAmount(next)
      if (amount !== null) return { min: amount, max: PRICE_BOUNDS.max }
    }
    // "between 500 and 1000"
    if (/^between$/.test(token) && next) {
      const low = parseAmount(next)
      const andIndex = i + 2
      if (low !== null && /^(and|to|-|\u2013|\u2014)$/.test(tokens[andIndex] ?? '')) {
        const high = parseAmount(tokens[andIndex + 1] ?? '')
        if (high !== null) return { min: low, max: high }
      }
    }
    // "1000 dollars", "$1000 budget", "around 500"
    if (amountFromToken(token) !== null && previous && /(budget|dollars|usd|around|about|approx)/.test(previous)) {
      const amount = amountFromToken(token)
      if (amount !== null) return { min: 0, max: amount }
    }
  }
  return undefined
}

function amountFromToken(token: string): number | null {
  if (!/^\$?\d[\d,.]*k?$/.test(token)) return null
  return parseAmount(token)
}

function matchRating(tokens: string[]): number | undefined {
  for (const token of tokens) {
    if (/^\d(\.\d)?\+?$/.test(token)) {
      const value = Number(token.replace('+', ''))
      if (value >= 3 && value <= 5) return value
    }
  }
  return undefined
}

function matchSort(text: string): SortKey | undefined {
  const normalized = text.toLowerCase()
  if (/\b(cheapest|lowest price|price low|sort by price)\b/.test(normalized)) return 'price-asc'
  if (/\b(most expensive|priciest|price high)\b/.test(normalized)) return 'price-desc'
  if (/\b(highest rated|best rated|top rated|rating)\b/.test(normalized)) return 'rating'
  if (/\b(most popular|most reviewed|popular)\b/.test(normalized)) return 'reviews'
  return undefined
}

/* -------------------------------------------------------------------------- */
/* The resolver                                                               */
/* -------------------------------------------------------------------------- */

export interface ResolveOptions {
  query: string
  /** Previous turn's filters — enables "cheaper ones" style refinements. */
  context?: ResolvedQuery
}

/**
 * Turns free text + conversational context into structured filters.
 *
 * This is the heart of the mocked "AI": pure, synchronous and unit-testable, so
 * a real implementation can be swapped in behind the same interface.
 */
export function resolveQuery({ query, context }: ResolveOptions): ResolvedQuery {
  const text = query.trim()
  const tokens = tokenize(text)
  const intents = detectIntents(text)
  const pureRefinement = isPureRefinement(text)

  // Refinements inherit the previous turn's shape; fresh queries start clean.
  const base: ResolvedQuery = pureRefinement && context
    ? { ...context, raw: text, terms: [...context.terms] }
    : {
        raw: text,
        terms: [],
        sort: 'relevance',
        summary: '',
      }

  const category = matchCategory(tokens) ?? base.category
  const brand = matchBrand(tokens) ?? base.brand
  let store = base.store
  let price = matchPrice(tokens) ?? base.price
  let minRating = matchRating(tokens) ?? base.minRating
  let minReviews = base.minReviews
  let inStockOnly = base.inStockOnly
  let freeShippingOnly = base.freeShippingOnly
  let sort: SortKey = matchSort(text) ?? base.sort

  /* ---- store filters, including "show only Amazon" / "not Target" -------- */
  const storeMatch = matchStore(text)
  if (storeMatch) {
    // "not Target" / "except Target" removes the store instead of selecting it.
    const isExclusion =
      intents.includes('exclude-store') ||
      new RegExp(`\\b(not|except|exclude|don'?t)\\s+(show\\s+)?${storeMatch}\\b`, 'i').test(text)
    if (isExclusion) {
      if (store === storeMatch) store = undefined
    } else {
      store = storeMatch
    }
  }

  /* ---- explicit budget language always wins over the inherited budget ----- */
  if (intents.includes('cheaper')) {
    const ceiling = price?.max ?? (category ? 1000 : PRICE_BOUNDS.max)
    price = { min: 0, max: Math.max(50, Math.round((ceiling * 0.75) / 10) * 10) }
    sort = 'price-asc'
  }
  if (intents.includes('premium')) {
    const floor = price?.min ?? 0
    price = { min: Math.round(floor * 1.25), max: PRICE_BOUNDS.max }
    sort = 'price-desc'
  }
  if (intents.includes('better-rated')) {
    minRating = Math.max(minRating ?? 0, 4.4)
    sort = 'rating'
  }
  if (intents.includes('more-reviewed')) {
    minReviews = Math.max(minReviews ?? 0, 800)
    sort = 'reviews'
  }
  if (intents.includes('in-stock')) inStockOnly = true
  if (intents.includes('free-shipping')) freeShippingOnly = true

  if (intents.includes('clear-filters')) {
    return {
      raw: text,
      terms: [],
      sort: 'relevance',
      summary: 'Filters cleared — showing everything we can find.',
    }
  }

  /* ---- residual search terms (used for text matching downstream) --------- */
  const terms = tokens.filter(
    (token) =>
      !STOP_WORDS.has(token) &&
      !/^\d/.test(token) &&
      !/^(under|below|over|above|between|only|from|at|about|around)$/.test(token),
  )

  return {
    raw: text,
    terms,
    category,
    brand,
    store,
    price: price
      ? {
          min: clamp(price.min, PRICE_BOUNDS.min, PRICE_BOUNDS.max),
          max: clamp(price.max, PRICE_BOUNDS.min, PRICE_BOUNDS.max),
        }
      : undefined,
    minRating,
    minReviews,
    inStockOnly,
    freeShippingOnly,
    sort,
    summary: buildSummary({ category, brand, store, price, sort, minRating, terms }),
  }
}

function buildSummary(input: {
  category?: CategoryId
  brand?: string
  store?: StoreId
  price?: PriceRange
  sort: SortKey
  minRating?: number
  terms: string[]
}): string {
  const parts: string[] = []
  const categoryName = CATEGORIES.find((c) => c.id === input.category)?.name
  if (input.brand && categoryName) parts.push(`${input.brand} ${categoryName.toLowerCase()}`)
  else if (input.brand) parts.push(input.brand)
  else if (categoryName) parts.push(categoryName)
  else if (input.terms.length) parts.push(input.terms.slice(0, 3).join(' '))

  let summary = parts[0] ?? 'Everything'
  const constraints: string[] = []
  if (input.price) {
    constraints.push(
      input.price.max >= PRICE_BOUNDS.max
        ? `any budget`
        : `${input.price.min} DA–${Math.round(input.price.max)} DA`,
    )
  }
  if (input.store) constraints.push(STORES.find((s) => s.id === input.store)?.shortName ?? input.store)
  if (input.minRating) constraints.push(`${input.minRating}★ and up`)

  if (constraints.length) summary += ` · ${constraints.join(' · ')}`
  if (input.sort !== 'relevance') summary += ` · sorted by ${SORT_LABELS[input.sort]}`
  return summary
}

export const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'relevance',
  'price-asc': 'lowest price',
  'price-desc': 'highest price',
  rating: 'rating',
  reviews: 'popularity',
}

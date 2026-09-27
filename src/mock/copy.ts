import { CATEGORY_LABELS, CHAT_COPY, SEARCH_STAGES } from '@/constants/app'
import type { Product, ResolvedQuery, SearchProgress, SearchStage } from '@/types'
import { CATEGORY_MAP, STORE_MAP } from '@/constants/taxonomy'
import { formatPrice } from '@/utils/format'
import { describePriceBand, type SearchResult } from './searchEngine'

/**
 * Assistant copywriting.
 *
 * Keeping generated copy in one module means the mock "AI voice" can be tuned
 * without touching search logic — and a real backend simply returns the same
 * strings over the wire.
 *
 * All reply functions now consume a SearchResult so the text always reflects
 * the actual confidence level of the match, never a static fallback.
 */

export function buildProgress(): SearchProgress[] {
  return SEARCH_STAGES.map((stage) => ({ ...stage }))
}

export function stageLabel(stage: SearchStage): string {
  return SEARCH_STAGES.find((entry) => entry.stage === stage)?.label ?? 'Working'
}

function countLabel(count: number): string {
  return `${count} match${count === 1 ? '' : 'es'}`
}

function topCategoryName(query: ResolvedQuery): string {
  if (query.brand && query.category) return `${query.brand} ${CATEGORY_LABELS[query.category].toLowerCase()}`
  if (query.brand) return query.brand
  if (query.category) return CATEGORY_LABELS[query.category].toLowerCase()
  return 'products'
}

/**
 * Builds the assistant's written reply above a result set.
 *
 * Branches strictly on SearchResult.confidence:
 *   high  → "Found N matches for X. Top pick is…"
 *   low   → "Here's what's closest to '…' in our catalog:"
 *   none  → Honest no-results with category suggestions. No product cards shown.
 */
export function buildReply(query: ResolvedQuery, result: SearchResult): string {
  const { matchedProducts, confidence, matchedCategory, suggestedFallbackCategories, relaxed } = result

  // ── confidence: none ─────────────────────────────────────────────────────
  if (confidence === 'none') {
    const categoryList = suggestedFallbackCategories?.length
      ? suggestedFallbackCategories.join(', ')
      : 'Laptops, Audio, Shoes'
    return (
      `Sift doesn't currently have results for **"${query.raw}"**.\n\n` +
      `Our catalog covers electronics, furniture, kitchen appliances, fashion, and outdoor gear. ` +
      `Try browsing: ${categoryList}.`
    )
  }

  const best = matchedProducts[0] as Product
  const budget = query.price
    ? describePriceBand(query.price.min, query.price.max).toLowerCase()
    : null
  const store = query.store ? ` on ${STORE_MAP[query.store]?.name ?? query.store}` : ''

  // ── confidence: low (term-only match, no resolved category) ──────────────
  if (confidence === 'low') {
    const relaxNote = relaxed
      ? ' I loosened a few filters to find these — you can refine further below.'
      : ''
    return (
      `Here's what's closest to **"${query.raw}"** in our catalog:${relaxNote}\n\n` +
      `Top pick: **${best.title}** at **${formatPrice(best.price)}** — ` +
      `${best.blurb.charAt(0).toLowerCase()}${best.blurb.slice(1)}.`
    )
  }

  // ── confidence: high ─────────────────────────────────────────────────────
  const categoryLabel = matchedCategory ?? topCategoryName(query)
  const opener = `Found ${countLabel(matchedProducts.length)} for ${categoryLabel}${store}${budget ? ` ${budget}` : ''}.`

  const lead =
    `Top pick is the **${best.title}** at **${formatPrice(best.price)}** — ` +
    `${best.blurb.charAt(0).toLowerCase()}${best.blurb.slice(1)}`

  const body = relaxed
    ? ' Nothing matched every filter, so I loosened the constraints rather than send you an empty grid.'
    : ''

  return `${opener}\n\n${lead}.${body}`
}

export function buildMeta(_query: ResolvedQuery, products: Product[]): string {
  if (products.length === 0) return ''
  const stores = new Set(products.map((product) => product.store))
  const delivered = products.filter((product) => product.inStock).length
  return `${products.length} result${products.length === 1 ? '' : 's'} · ${stores.size} store${
    stores.size === 1 ? '' : 's'
  } · ${delivered} in stock`
}

/** Follow-up chips rendered under a result set. */
export function buildSuggestions(query: ResolvedQuery, products: Product[]): string[] {
  const suggestions: string[] = ['Cheaper ones', 'Highest rated']
  const store = query.store ? STORE_MAP[query.store] : undefined

  // Offer a store filter that isn't already applied.
  if (!store) {
    const storeCounts = new Map(products.map((product) => [product.store, 0]))
    products.forEach((product) => storeCounts.set(product.store, (storeCounts.get(product.store) ?? 0) + 1))
    const [topStore] = [...storeCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? []
    if (topStore) suggestions.push(`Show only ${STORE_MAP[topStore]?.name ?? topStore}`)
  } else {
    suggestions.push('Compare all stores')
  }

  if (query.category) {
    const neighbour = CATEGORY_MAP[query.category]
    if (neighbour && !products.some((product) => product.freeShipping)) {
      suggestions.push('Free shipping only')
    }
  }
  if (query.price?.max) suggestions.push('Something more premium')

  return suggestions.slice(0, 4)
}

/** Greeting text for the empty chat state. */
export const GREETING = CHAT_COPY.greeting

/** Hint rendered below the composer on an empty thread. */
export const EMPTY_THREAD_HINT = CHAT_COPY.emptyHint


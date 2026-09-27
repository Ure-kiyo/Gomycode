import type { Product, ResolvedQuery, SortKey } from '@/types'
import { hashString } from '@/utils/id'
import { CATEGORY_MAP, STORE_MAP, CATEGORIES } from '@/constants/taxonomy'
import { PRODUCTS } from './products'

/* -------------------------------------------------------------------------- */
/* SearchResult — the canonical shape this module always returns              */
/* -------------------------------------------------------------------------- */

export type SearchConfidence = 'high' | 'low' | 'none'

export interface SearchResult {
  matchedProducts: Product[]
  matchedCategory: string | null
  confidence: SearchConfidence
  /** Only set when confidence === 'none'. Lists 2-3 browsable categories. */
  suggestedFallbackCategories?: string[]
  /** True when filters were progressively relaxed to surface results. */
  relaxed: boolean
}

/* -------------------------------------------------------------------------- */
/* Scoring                                                                    */
/* -------------------------------------------------------------------------- */

interface Scored {
  product: Product
  /**
   * Relevance-only score: quality signals (rating, reviews) are NOT included.
   * Only this score is used to decide whether a product clears the gate.
   */
  relevanceScore: number
  /**
   * Total score = relevance + quality. Used only for ordering within the
   * matched set — never for the inclusion gate.
   */
  totalScore: number
  reasons: string[]
}

/**
 * Minimum relevance score a product must reach to appear in results.
 *
 * Key insight: quality signals (rating / reviews) go into totalScore for
 * *ordering* within a matched set, but are excluded from relevanceScore so
 * they can never rescue an unrelated product past the gate.
 *
 * A product earns relevance points by:
 *   - Category match:       60 pts  (strongest signal)
 *   - Brand match (exact):  45 pts
 *   - Store match:          40 pts
 *   - Price range hit:      25-35 pts
 *   - Brand in title:       30 pts
 *   - Term in title:        14 pts
 *   - Term in brand:        12 pts
 *   - Term in tags:         10 pts
 *   - Category name match:   8 pts
 *   - Category keyword:      6 pts
 *   - Term in blurb:         4 pts
 *
 * A product with ONLY quality signals (e.g. "car" query → Herman Miller chair)
 * scores 0 relevance and is rejected before any results are returned.
 */
const MIN_RELEVANCE_SCORE = 10

/**
 * Returns true only when `needle` appears as a complete word (or exact token)
 * within `haystack`. Prevents 'car' from matching inside 'cameras' or 'creator'.
 */
function matchesWholeWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(haystack)
}

function scoreProduct(product: Product, query: ResolvedQuery): Scored {
  const reasons: string[] = []
  let relevanceScore = 0

  // ── Category match (strongest signal) ──────────────────────────────────
  if (query.category && product.category === query.category) {
    relevanceScore += 60
    reasons.push(CATEGORY_MAP[query.category]?.name ?? query.category)
  }

  // ── Brand match ─────────────────────────────────────────────────────────
  if (query.brand) {
    if (product.brand.toLowerCase() === query.brand.toLowerCase()) {
      relevanceScore += 45
      reasons.push(query.brand)
    } else if (product.title.toLowerCase().includes(query.brand.toLowerCase())) {
      relevanceScore += 30
    }
  }

  // ── Store filter ─────────────────────────────────────────────────────────
  if (query.store) {
    if (product.store === query.store) relevanceScore += 40
    // Not in the requested store: penalise so it falls below the gate.
    else relevanceScore -= 150
  }

  // ── Price range ──────────────────────────────────────────────────────────
  if (query.price) {
    if (product.price >= query.price.min && product.price <= query.price.max) {
      const span = Math.max(1, query.price.max - query.price.min)
      const utilisation = 1 - Math.abs(product.price - query.price.max) / span
      relevanceScore += 25 + Math.round(utilisation * 10)
    } else {
      // Out-of-budget: penalise heavily so these never appear as matches.
      relevanceScore -= 120
    }
  }

  // ── Rating / review filters ──────────────────────────────────────────────
  if (query.minRating) {
    if (product.rating >= query.minRating) relevanceScore += 20
    else relevanceScore -= 60
  }
  if (query.minReviews && product.reviewCount < query.minReviews) relevanceScore -= 30
  if (query.inStockOnly && !product.inStock) relevanceScore -= 200
  if (query.freeShippingOnly && !product.freeShipping) relevanceScore -= 80

  // ── Free-text term matching ──────────────────────────────────────────────
  // Tags and category keywords use WHOLE-WORD matching to prevent false positives
  // like 'car' matching inside 'creator' or 'cameras'.
  // Title/brand/blurb use substring matching intentionally (e.g. "samsung" in
  // "Samsung Galaxy S24 Ultra") — the category gate handles overall relevance.
  for (const term of query.terms) {
    const needle = term.toLowerCase()
    if (matchesWholeWord(product.title.toLowerCase(), needle)) relevanceScore += 14
    if (product.tags.some((tag) => matchesWholeWord(tag, needle))) relevanceScore += 10
    if (matchesWholeWord(product.brand.toLowerCase(), needle)) relevanceScore += 12
    if (matchesWholeWord(product.blurb.toLowerCase(), needle)) relevanceScore += 4
    // Also match against the product's category name and keywords (whole-word)
    const cat = CATEGORY_MAP[product.category]
    if (cat) {
      if (matchesWholeWord(cat.name, needle)) relevanceScore += 8
      if (cat.keywords.some((kw) => matchesWholeWord(kw, needle))) relevanceScore += 6
    }
  }

  // ── Quality signals (sorting only, never gating) ─────────────────────────
  const qualityBoost =
    product.rating * 6 + Math.min(10, Math.log10(product.reviewCount + 1) * 2)
  // Deterministic tiebreaker so identical scores don't shuffle between renders.
  const tiebreaker = (hashString(product.id) % 100) / 100

  if (reasons.length === 0) reasons.push('Matches your search')
  return {
    product,
    relevanceScore,
    totalScore: relevanceScore + qualityBoost + tiebreaker,
    reasons,
  }
}

const SORTERS: Record<SortKey, (a: Scored, b: Scored) => number> = {
  relevance: (a, b) => b.totalScore - a.totalScore,
  'price-asc': (a, b) => a.product.price - b.product.price,
  'price-desc': (a, b) => b.product.price - a.product.price,
  rating: (a, b) =>
    b.product.rating - a.product.rating || b.product.reviewCount - a.product.reviewCount,
  reviews: (a, b) => b.product.reviewCount - a.product.reviewCount,
}

/* -------------------------------------------------------------------------- */
/* Core search function — pure and testable                                   */
/* -------------------------------------------------------------------------- */

/**
 * Pure, testable search function — decoupled from UI and chat logic.
 *
 * GUARANTEE: a product MUST exceed MIN_RELEVANCE_SCORE to appear in
 * matchedProducts. If zero products clear the threshold, confidence === 'none'
 * and matchedProducts === []. Callers must show an honest fallback message.
 */
export function searchProducts(
  query: ResolvedQuery,
  pool: Product[] = PRODUCTS,
  limit = 24,
): SearchResult {
  const sorter = SORTERS[query.sort] ?? SORTERS.relevance

  const scored = pool
    .map((product) => scoreProduct(product, query))
    .filter((entry) => entry.relevanceScore >= MIN_RELEVANCE_SCORE)
    .sort(sorter)
    .slice(0, limit)

  const matchedProducts = scored.map((entry) => entry.product)
  const matchedCategory = query.category
    ? (CATEGORY_MAP[query.category]?.name ?? null)
    : null

  // Confidence:
  //   high  → category was resolved and we have results
  //   low   → results exist but no category (term-only match)
  //   none  → nothing passed the relevance threshold
  let confidence: SearchConfidence
  if (matchedProducts.length === 0) {
    confidence = 'none'
  } else if (query.category) {
    confidence = 'high'
  } else {
    confidence = 'low'
  }

  const suggestedFallbackCategories =
    confidence === 'none' ? pickFallbackCategories(query) : undefined

  return { matchedProducts, matchedCategory, confidence, suggestedFallbackCategories, relaxed: false }
}

export function searchWithFallback(query: ResolvedQuery, limit = 24): SearchResult {
  // We no longer progressively relax filters (silently broadening the search).
  // If the user asks for a strict set of constraints and we have only 1-2 matches,
  // we return those 1-2 matches. If we have 0, we return 0.
  return searchProducts(query, PRODUCTS, limit)
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function pickFallbackCategories(query: ResolvedQuery): string[] {
  const usedCategory = query.category
  const defaults = ['Laptops', 'Audio', 'Shoes', 'Kitchen', 'Outdoor']
  const pool = CATEGORIES.filter((c) => c.id !== usedCategory).map((c) => c.name)
  return [...new Set([...pool, ...defaults])].slice(0, 3)
}

/** Formats a price band the way a shopper would say it. */
export function describePriceBand(min: number, max: number): string {
  if (max <= 0) return 'free'
  if (min <= 0 && max >= 5000) return 'any budget'
  if (min <= 0) return `under ${Math.round(max).toLocaleString('en-US')} DA`
  return `${Math.round(min).toLocaleString('en-US')} DA–${Math.round(max).toLocaleString('en-US')} DA`
}

export function getStoreLabel(storeId: Product['store']): string {
  return STORE_MAP[storeId]?.name ?? storeId
}

/* -------------------------------------------------------------------------- */
/* Legacy compatibility shims (for recommendation engine, feed engine)       */
/* -------------------------------------------------------------------------- */

/** @deprecated Use searchProducts() directly. */
export function searchCatalogue(
  query: ResolvedQuery,
  limit = 24,
  pool: Product[] = PRODUCTS,
): Product[] {
  return searchProducts(query, pool, limit).matchedProducts
}

/** @deprecated */
export function isNarrowQuery(query: ResolvedQuery): boolean {
  return Boolean(query.price && query.store && query.brand && query.category)
}

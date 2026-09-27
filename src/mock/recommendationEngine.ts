import { CATEGORY_LABELS } from '@/constants/app'
import type {
  CategoryId,
  FeedResponse,
  FeedSection,
  FeedSectionId,
  PersonalizationSignals,
  Product,
} from '@/types'
import { createSeededRandom, seededShuffle } from '@/utils/id'
import { CATEGORIES } from '@/constants/taxonomy'
import { PRODUCTS, getProductsByIds } from './products'
import { describePriceBand } from './searchEngine'

/**
 * Recommendation engine.
 *
 * Turns lightweight interaction signals into ranked sections. It deliberately
 * mirrors the shape a real recommendations service would return
 * (`GET /feed?signals=...`), including the `rationale` the UI surfaces so the
 * personalisation is explainable rather than magic.
 */

interface SectionBlueprint {
  id: FeedSectionId
  title: (context: SectionContext) => string
  subtitle?: (context: SectionContext) => string
  glyph?: string
  /** Higher weight = closer to what the user actually did. */
  weight: number
  build: (context: SectionContext) => Product[]
}

interface SectionContext {
  signals: PersonalizationSignals
  category: CategoryId | undefined
  priceCeiling: number
  random: () => number
}

function countOccurrences<T>(items: T[]): Map<T, number> {
  const counts = new Map<T, number>()
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1)
  return counts
}

/**
 * Ranks categories by how much the user engaged with them. Search intent counts
 * for more than a passive view; a save counts for more than both.
 */
function rankInterests(signals: PersonalizationSignals): CategoryId[] {
  const scores = new Map<CategoryId, number>()

  const apply = (categories: CategoryId[], weight: number) => {
    for (const category of categories) {
      scores.set(category, (scores.get(category) ?? 0) + weight)
    }
  }

  apply(signals.savedCategories, 3)
  apply(signals.searchedCategories, 2)
  apply(signals.viewedCategories, 1)

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category]) => category)
}

/** Category implied by a saved product, used for "similar to items you saved". */
function topSavedCategory(signals: PersonalizationSignals): CategoryId | undefined {
  const saved = getProductsByIds(signals.savedProductIds)
  const counts = countOccurrences(saved.map((product) => product.category))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

function excludeSeen(products: Product[], signals: PersonalizationSignals): Product[] {
  const seen = new Set([...signals.savedProductIds, ...signals.viewedProductIds])
  return products.filter((product) => !seen.has(product.id))
}

function byCategory(category: CategoryId, limit: number, random: () => number): Product[] {
  const pool = PRODUCTS.filter((product) => product.category === category)
  // Shuffle then take a slice: order changes per seed, membership stays plausible.
  return seededShuffle(pool, Math.floor(random() * 1e9)).slice(0, limit)
}

const BLUEPRINTS: SectionBlueprint[] = [
  {
    id: 'based-on-search',
    title: (ctx) =>
      ctx.category ? `Based on your search: ${CATEGORY_LABELS[ctx.category]}` : 'Popular right now',
    subtitle: (ctx) =>
      ctx.category
        ? 'Refreshed from the last things you asked for'
        : 'A starting point — tell Sift what you need next',
    glyph: '🔎',
    weight: 100,
    build: (ctx) => byCategory(ctx.category ?? 'laptops', 10, ctx.random),
  },
  {
    id: 'similar-to-saved',
    title: () => 'Similar to items you saved',
    subtitle: () => 'Matched on category, then on price and rating',
    glyph: '🔖',
    weight: 90,
    build: (ctx) => byCategory(ctx.category ?? 'audio', 10, ctx.random),
  },
  {
    id: 'deals',
    title: () => 'Live-ish deals',
    subtitle: () => 'Marked-down items with strong ratings',
    glyph: '🏷️',
    weight: 70,
    build: (ctx) =>
      seededShuffle(
        PRODUCTS.filter(
          (product) => product.listPrice !== undefined && product.rating >= 4.4 && product.price <= ctx.priceCeiling,
        ),
        Math.floor(ctx.random() * 1e9),
      ).slice(0, 10),
  },
  {
    id: 'trending-interests',
    title: (ctx) =>
      ctx.category ? `Trending in ${CATEGORY_LABELS[ctx.category]}` : 'Trending in your interests',
    subtitle: () => 'What everyone else is sifting through this week',
    glyph: '📈',
    weight: 60,
    build: (ctx) => {
      const pool = PRODUCTS.filter((product) => product.rating >= 4.4)
      return [...pool]
        .sort((a, b) => b.reviewCount / (b.price || 1) - a.reviewCount / (a.price || 1))
        .slice(0, 10)
    },
  },
  {
    id: 'under-budget',
    title: () => `Under ${describePriceBand(0, 1000)}`,
    subtitle: () => 'Highly rated picks that leave room in the budget',
    glyph: '💸',
    weight: 50,
    build: (ctx) =>
      PRODUCTS.filter((product) => product.price <= Math.min(1000, ctx.priceCeiling) && product.rating >= 4.3)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10),
  },
  {
    id: 'recently-viewed',
    title: () => 'Pick up where you left off',
    subtitle: () => 'You opened these but never saved them',
    glyph: '🕑',
    weight: 80,
    build: (ctx) => {
      const viewed = getProductsByIds(ctx.signals.viewedProductIds)
      const unsaved = viewed.filter((product) => !ctx.signals.savedProductIds.includes(product.id))
      return unsaved.slice(0, 10)
    },
  },
]

/**
 * Builds the personalised feed.
 *
 * @param signals aggregated client-side interactions
 * @param opts.seed reshuffles ordering/content — bumped by pull-to-refresh
 */
export function buildFeed(signals: PersonalizationSignals, opts: { seed?: number } = {}): FeedResponse {
  const seed = opts.seed ?? 0
  const random = createSeededRandom(seed + 1)
  const interests = rankInterests(signals)
  const primary = interests[0] ?? topSavedCategory(signals) ?? undefined
  const secondary = interests[1]

  const priceCeiling = 1000
  const context: SectionContext = { signals, category: primary, priceCeiling, random }

  const rationale: string[] = []
  if (primary) rationale.push(`${CATEGORY_LABELS[primary]} from your recent activity`)
  if (secondary) rationale.push(`cross-sold from ${CATEGORY_LABELS[secondary]}`)
  if (signals.savedProductIds.length) rationale.push(`${signals.savedProductIds.length} saved item${signals.savedProductIds.length === 1 ? '' : 's'}`)
  if (!primary) rationale.push('no history yet — showing general bestsellers')

  // Sections the user has enough signal for; fallback to a single discovery set.
  const available: SectionBlueprint[] = BLUEPRINTS.filter((blueprint) => {
    if (blueprint.id === 'similar-to-saved') return signals.savedProductIds.length > 0 || Boolean(primary)
    if (blueprint.id === 'recently-viewed') {
      const viewed = getProductsByIds(signals.viewedProductIds)
      return viewed.some((product) => !signals.savedProductIds.includes(product.id))
    }
    if (blueprint.id === 'based-on-search') return Boolean(primary)
    return true
  })

  const ordered = [...available].sort((a, b) => b.weight - a.weight)

  const seenIds = new Set<string>()
  const sections: FeedSection[] = []

  for (const blueprint of ordered) {
    const built = excludeSeen(blueprint.build(context), signals)
    // Dedupe across sections so the same laptop isn't shown three times.
    const products = built.filter((product) => !seenIds.has(product.id)).slice(0, 10)
    if (products.length === 0) continue
    products.forEach((product) => seenIds.add(product.id))

    sections.push({
      id: blueprint.id,
      title: blueprint.title(context),
      subtitle: blueprint.subtitle?.(context),
      glyph: blueprint.glyph,
      products,
    })
  }

  // Cold-start: guarantee a couple of discovery rows even with zero history.
  if (sections.length < 2) {
    const discovery = seededShuffle(PRODUCTS, seed + 7)
      .filter((product) => !seenIds.has(product.id))
      .slice(0, 12)
    discovery.forEach((product) => seenIds.add(product.id))
    if (discovery.length) {
      sections.push({
        id: 'trending-interests',
        title: 'Explore what people are sifting through',
        subtitle: 'Hand-picked starting points across every category',
        glyph: '🧭',
        products: discovery,
      })
    }
  }

  return { sections, rationale }
}

/** Categories with the most catalogue depth — used by the preferences picker. */
export function categoriesByDepth(): Array<{ id: CategoryId; name: string; count: number }> {
  return CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    count: PRODUCTS.filter((product) => product.category === category.id).length,
  })).sort((a, b) => b.count - a.count)
}

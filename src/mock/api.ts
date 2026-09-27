import { MOCK_TIMING } from '@/constants/app'
import type {
  PersonalizationSignals,
  Product,
  SiftApi,
  SearchRequest,
  SearchResponse,
  UserProfile,
} from '@/types'
import { buildMeta, buildProgress, buildReply, buildSuggestions } from './copy'
import { CATEGORIES, STORES } from '@/constants/taxonomy'
import { getProductById } from './products'
import { resolveQuery } from './queryResolver'
import { buildFeed } from './recommendationEngine'
import { searchWithFallback } from './searchEngine'

/* -------------------------------------------------------------------------- */
/* Fake network                                                               */
/* -------------------------------------------------------------------------- */

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Simulated round-trip. */
async function simulateLatency(range: readonly [number, number]): Promise<void> {
  const [min, max] = range
  await delay(min + Math.random() * (max - min))
}

/* -------------------------------------------------------------------------- */
/* Mock profile                                                               */
/* -------------------------------------------------------------------------- */

const MOCK_PROFILE: UserProfile = {
  id: 'u_mock_1',
  name: 'Avery Quinn',
  email: 'avery@example.com',
  avatarInitials: 'AQ',
  memberSince: '2024-11-03',
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

async function search(req: SearchRequest): Promise<SearchResponse> {
  await simulateLatency(MOCK_TIMING.search)

  const resolved = resolveQuery({ query: req.query, context: req.context })
  const result = searchWithFallback(resolved)
  const { matchedProducts: products } = result

  return {
    reply: buildReply(resolved, result),
    products,
    resolved,
    suggestions: products.length ? buildSuggestions(resolved, products) : [],
    meta: buildMeta(resolved, products),
    progress: buildProgress(),
  }
}

/* -------------------------------------------------------------------------- */
/* Suggestions for the composer                                               */
/* -------------------------------------------------------------------------- */

function getSuggestions(partial: string): string[] {
  const needle = partial.trim().toLowerCase()
  if (needle.length < 2) return []

  const pool = new Set<string>()
  for (const category of CATEGORIES) {
    pool.add(`${category.name.toLowerCase()} under $500`)
    for (const keyword of category.keywords.slice(0, 3)) {
      pool.add(`best ${keyword}`)
    }
  }
  for (const store of STORES.slice(0, 5)) {
    pool.add(`deals on ${store.name}`)
  }

  return [...pool].filter((suggestion) => suggestion.includes(needle)).slice(0, 5)
}

/* -------------------------------------------------------------------------- */
/* The mock backend                                                           */
/* -------------------------------------------------------------------------- */

export const mockApi: SiftApi = {
  async search(req) {
    return search(req)
  },

  async getFeed(signals: PersonalizationSignals, opts) {
    await simulateLatency(MOCK_TIMING.feed)
    return buildFeed(signals, opts)
  },

  async getProduct(id: string): Promise<Product> {
    await simulateLatency(MOCK_TIMING.product)
    const product = getProductById(id)
    if (!product) throw new Error('That product is no longer available.')
    return product
  },

  async getProducts(ids: string[]): Promise<Product[]> {
    await simulateLatency(MOCK_TIMING.product)
    return ids.flatMap((id) => {
      const product = getProductById(id)
      return product ? [product] : []
    })
  },

  async getSuggestions(partial: string): Promise<string[]> {
    await simulateLatency(MOCK_TIMING.suggest)
    return getSuggestions(partial)
  },

  async getProfile(): Promise<UserProfile> {
    await simulateLatency(MOCK_TIMING.product)
    return MOCK_PROFILE
  },
}

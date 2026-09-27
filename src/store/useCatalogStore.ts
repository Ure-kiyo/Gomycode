import { create } from 'zustand'

import { api } from '@/services'
import type { FeedResponse, FeedSection, Product } from '@/types'
import { toErrorMessage } from '@/utils/asyncState'

/**
 * Product data cache.
 *
 * Two consumers need products: the chat thread (which persists only ids so the
 * transcript survives a reload) and the personalised feed. Both read from this
 * single in-memory cache, and both treat it as a cache — never as the source of
 * truth for interaction state, which lives in `useUserStore`.
 */

export interface FeedState {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: FeedResponse | null
  error: string | null
  /** Incremented on pull-to-refresh; passed to the recommender as a seed. */
  seed: number
  /** Bumped whenever interaction state changes, to trigger a re-personalise. */
  revision: number
}

interface CatalogState {
  /** id → product. Populated on demand. */
  products: Record<string, Product>
  /** Ids currently being fetched, so concurrent lookups share one request. */
  inflight: Record<string, true>
  feed: FeedState
  loadProducts: (ids: string[]) => Promise<void>
  getProduct: (id: string) => Product | undefined
  /** Fetch / re-personalise the feed. */
  refresh: (opts?: { reseed?: boolean }) => Promise<void>
  /** Bumps revision so subscribers know interaction state changed. */
  invalidate: () => void
}

function mergeProducts(existing: Record<string, Product>, incoming: Product[]): Record<string, Product> {
  if (incoming.length === 0) return existing
  const next = { ...existing }
  for (const product of incoming) next[product.id] = product
  return next
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: {},
  inflight: {},

  feed: {
    status: 'idle' as const,
    data: null,
    error: null,
    seed: 0,
    revision: 0,
  } as FeedState,

  getProduct: (id) => get().products[id],

  loadProducts: async (ids) => {
    const missing = ids.filter((id) => !get().products[id] && !get().inflight[id])
    if (missing.length === 0) return

    set({ inflight: { ...get().inflight, ...Object.fromEntries(missing.map((id) => [id, true as const])) } })

    try {
      const products = await api.getProducts(missing)
      set((state) => ({ products: mergeProducts(state.products, products) }))
    } catch (error) {
      // A cache miss is not a user-facing failure — screens fall back to ids.
      console.warn('[catalog] failed to load products', toErrorMessage(error))
    } finally {
      const inflight = { ...get().inflight }
      missing.forEach((id) => delete inflight[id])
      set({ inflight })
    }
  },

  refresh: async ({ reseed = false } = {}) => {
    const { feed } = get()
    const seed = reseed ? feed.seed + 1 : feed.seed
    set({ feed: { ...feed, status: 'loading', error: null, seed } })

    try {
      // Imported lazily to avoid a circular import at module-evaluation time.
      const { selectSignals, useUserStore } = await import('@/store/useUserStore')
      const signals = selectSignals(useUserStore.getState(), new Map(Object.entries(get().products)))
      const feedResponse = await api.getFeed(signals, { seed })
      set((state) => ({ feed: { status: 'success', data: feedResponse, error: null, seed, revision: state.feed.revision } }))
    } catch (error) {
      set((state) => ({
        feed: { ...state.feed, status: 'error', data: null, error: toErrorMessage(error) },
      }))
    }
  },

  invalidate: () =>
    set((state) => ({
      feed: { ...state.feed, revision: state.feed.revision + 1 },
    })),
}))

/* -------------------------------------------------------------------------- */
/* Selectors                                                                  */
/* -------------------------------------------------------------------------- */

export function selectProduct(state: CatalogState, id: string | undefined): Product | undefined {
  return id ? state.products[id] : undefined
}

/**
 * Returns the raw products map. Components should call `useCatalogStore(selectProductMap)`
 * instead of a curried selector to avoid creating a new function reference on every render
 * (which causes infinite loops in React 19).
 */
export function selectProductMap(state: CatalogState): Record<string, Product> {
  return state.products
}

/**
 * Stable lookup by ids — reads from the product map directly.
 */
export function getProductsById(products: Record<string, Product>, ids: readonly string[]): Product[] {
  return ids.flatMap((id) => {
    const product = products[id]
    return product ? [product] : []
  })
}

export function selectSections(state: CatalogState): FeedSection[] {
  return state.feed.data?.sections ?? []
}

export function selectHasFeedContent(state: CatalogState): boolean {
  return selectSections(state).some((section) => section.products.length > 0)
}

import type { SiftApi } from '@/types'

/**
 * A REST implementation of `SiftApi`.
 *
 * This module is the designated swap point for a real backend: it satisfies the
 * exact same interface as `mockApi`, so switching between them is a one-line
 * change in `./index.ts` and requires zero component changes.
 *
 * Expected endpoints (all JSON):
 *   POST /v1/search            body: SearchRequest            → SearchResponse
 *   GET  /v1/feed?seed=123     body: PersonalizationSignals   → FeedResponse
 *   GET  /v1/products/:id                                  → Product
 *   POST /v1/products/bulk     body: { ids: string[] }        → Product[]
 *   GET  /v1/suggestions?q=…                                → string[]
 *   GET  /v1/profile                                         → UserProfile
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  query?: Record<string, string | number | undefined>
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

export function createHttpApi(baseUrl: string, fetcher: typeof fetch = fetch): SiftApi {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, signal, query } = options

    const response = await fetcher(buildUrl(baseUrl, path, query), {
      method,
      signal,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      // Prefer the server's message; fall back to something actionable.
      let message = `Request failed (${response.status})`
      try {
        const payload = (await response.json()) as { message?: string }
        if (payload.message) message = payload.message
      } catch {
        /* non-JSON error body — keep the generic message */
      }
      throw new ApiError(message, response.status)
    }

    return (await response.json()) as T
  }

  return {
    search: (req) => request('/v1/search', { method: 'POST', body: req }),
    getFeed: (signals, opts) =>
      request('/v1/feed', { method: 'POST', body: signals, query: { seed: opts?.seed } }),
    getProduct: (id) => request(`/v1/products/${encodeURIComponent(id)}`),
    getProducts: (ids) => request('/v1/products/bulk', { method: 'POST', body: { ids } }),
    getSuggestions: (partial) => request('/v1/suggestions', { query: { q: partial } }),
    getProfile: () => request('/v1/profile'),
  }
}

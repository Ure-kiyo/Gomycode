import { mockApi } from '@/mock/api'
import type { SiftApi } from '@/types'
import { createHttpApi } from './httpApi'

/**
 * Single entry point for all data access.
 *
 * Every component imports `api` from here — never from `@/mock` directly. To go
 * live, set `VITE_API_BASE_URL` (see `.env.example`); no UI code changes.
 */

const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

export const api: SiftApi = baseUrl ? createHttpApi(baseUrl) : mockApi

/** True when the app is running against the in-memory mock. */
export const isMockBackend = !baseUrl

export { ApiError } from './httpApi'

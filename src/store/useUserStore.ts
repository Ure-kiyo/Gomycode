import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { PRICE_BOUNDS, STORAGE_KEYS } from '@/constants/app'
import type {
  CategoryId,
  LanguageCode,
  PersonalizationSignals,
  PriceRange,
  Product,
  ThemePreference,
  UserProfile,
} from '@/types'
import { createId } from '@/utils/id'

/** One row in the Account screen's search history. */
export interface SearchHistoryEntry {
  id: string
  query: string
  /** Resolved category, when the engine could infer one. */
  category?: CategoryId
  resultCount: number
  /** Epoch ms. */
  at: number
}

const MAX_HISTORY = 30
const MAX_VIEWED = 40

export const DEFAULT_PREFERENCES = {
  categories: [] as CategoryId[],
  priceRange: { min: PRICE_BOUNDS.min, max: 1000 } as PriceRange,
  notifications: {
    priceDrops: true,
    restockAlerts: true,
    weeklyDigest: false,
  },
  theme: 'system' as ThemePreference,
  language: 'en' as LanguageCode,
}

export interface UserState {
  profile: UserProfile | null
  profileError: string | null

  /**
   * Drives home-screen routing:
   *   `isNewUser === true`  → app opens on Chat
   *   `hasInteracted === true` → app opens on For You
   */
  isNewUser: boolean
  hasInteracted: boolean

  savedProductIds: string[]
  viewedProductIds: string[]
  searchHistory: SearchHistoryEntry[]
  preferences: typeof DEFAULT_PREFERENCES

  loadProfile: () => Promise<void>
  /** Flips the app out of the first-run state. Idempotent. */
  markInteracted: () => void
  toggleSave: (productId: string) => boolean
  isSaved: (productId: string) => boolean
  recordView: (productId: string) => void
  addSearch: (entry: Omit<SearchHistoryEntry, 'id' | 'at'>) => void
  clearSearchHistory: () => void
  removeSearchEntry: (id: string) => void
  updatePreferences: (patch: Partial<UserState['preferences']>) => void
  toggleCategory: (category: CategoryId) => void
  setPriceRange: (range: PriceRange) => void
  setNotification: (key: keyof UserState['preferences']['notifications'], value: boolean) => void
  /** Sign out: wipes the mock session back to first-run. */
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      profileError: null,

      isNewUser: true,
      hasInteracted: false,

      savedProductIds: [],
      viewedProductIds: [],
      searchHistory: [],
      preferences: DEFAULT_PREFERENCES,

      loadProfile: async () => {
        // If they have already completed the auth flow (either as guest or logged in),
        // we respect their persisted state and skip hydrating the mock profile.
        if (get().hasInteracted) return

        const { api } = await import('@/services')
        try {
          const profile = await api.getProfile()
          set({ profile, profileError: null })
        } catch (error) {
          set({ profileError: error instanceof Error ? error.message : 'Could not load profile.' })
        }
      },

      markInteracted: () => {
        if (get().hasInteracted) return
        set({ hasInteracted: true, isNewUser: false })
      },

      toggleSave: (productId) => {
        const { savedProductIds, markInteracted: interacted } = get()
        const isSaved = savedProductIds.includes(productId)
        set({
          savedProductIds: isSaved
            ? savedProductIds.filter((id) => id !== productId)
            : [productId, ...savedProductIds],
        })
        // Saving counts as intent: a user who saved something is a returning user.
        interacted()
        return !isSaved
      },

      isSaved: (productId) => get().savedProductIds.includes(productId),

      recordView: (productId) => {
        const { viewedProductIds } = get()
        if (viewedProductIds[0] === productId) return
        set({ viewedProductIds: [productId, ...viewedProductIds].slice(0, MAX_VIEWED) })
      },

      addSearch: ({ query, category, resultCount }) => {
        const { searchHistory } = get()
        // De-duplicate: re-running a query moves it to the top.
        const withoutDuplicate = searchHistory.filter((entry) => entry.query.toLowerCase() !== query.toLowerCase())
        set({
          searchHistory: [
            { id: createId('q'), query, category, resultCount, at: Date.now() },
            ...withoutDuplicate,
          ].slice(0, MAX_HISTORY),
        })
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      removeSearchEntry: (id) =>
        set({ searchHistory: get().searchHistory.filter((entry) => entry.id !== id) }),

      updatePreferences: (patch) => set({ preferences: { ...get().preferences, ...patch } }),

      toggleCategory: (category) => {
        const { categories } = get().preferences
        const next = categories.includes(category)
          ? categories.filter((id) => id !== category)
          : [...categories, category]
        get().updatePreferences({ categories: next })
      },

      setPriceRange: (range) => get().updatePreferences({ priceRange: range }),

      setNotification: (key, value) =>
        set({
          preferences: {
            ...get().preferences,
            notifications: { ...get().preferences.notifications, [key]: value },
          },
        }),

      reset: () =>
        set({
          profile: null,
          profileError: null,
          isNewUser: true,
          hasInteracted: false,
          savedProductIds: [],
          viewedProductIds: [],
          searchHistory: [],
          preferences: DEFAULT_PREFERENCES,
        }),
    }),
    {
      name: STORAGE_KEYS.user,
      version: 1,
      // Theme lives in its own store with its own key — exclude it here.
      partialize: (state) => ({
        profile: state.profile,
        isNewUser: state.isNewUser,
        hasInteracted: state.hasInteracted,
        savedProductIds: state.savedProductIds,
        viewedProductIds: state.viewedProductIds,
        searchHistory: state.searchHistory,
        preferences: {
          ...state.preferences,
          theme: 'system',
        },
      }),
    },
  ),
)

/* -------------------------------------------------------------------------- */
/* Selectors                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Turns raw interaction state into the signals the feed engine consumes.
 * `catalog` is needed because the store persists product *ids* while the
 * recommendation engine reasons in *categories*.
 */
export function selectSignals(state: UserState, catalog: ReadonlyMap<string, Product>): PersonalizationSignals {
  const toCategories = (ids: string[]): CategoryId[] =>
    ids.flatMap((id) => {
      const product = catalog.get(id)
      return product ? [product.category] : []
    })

  return {
    searchedCategories: state.searchHistory
      .map((entry) => entry.category)
      .filter((category): category is CategoryId => Boolean(category)),
    savedCategories: toCategories(state.savedProductIds),
    viewedCategories: toCategories(state.viewedProductIds),
    savedProductIds: state.savedProductIds,
    viewedProductIds: state.viewedProductIds,
    recentQueries: state.searchHistory.map((entry) => entry.query),
  }
}

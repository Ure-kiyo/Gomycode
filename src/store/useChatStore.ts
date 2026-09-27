import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { MOCK_TIMING, SEARCH_STAGES, STORAGE_KEYS } from '@/constants/app'
import { api } from '@/services'
import type { ChatMessage, ResolvedQuery, SearchProgress } from '@/types'
import { toErrorMessage } from '@/utils/asyncState'
import { createId } from '@/utils/id'
import { useCatalogStore } from './useCatalogStore'
import { useUserStore } from './useUserStore'

/**
 * Chat transcript + search orchestration.
 *
 * Persisted as plain ids so the thread survives a reload; the product bodies
 * are re-hydrated from the catalogue on mount. That split keeps localStorage
 * small and means a product's price/details always come from the data layer.
 */

export type ChatStatus = 'idle' | 'thinking' | 'error'

export interface SendOptions {
  /** Replace the failed assistant turn instead of appending a new one. */
  isRetry?: boolean
}

export interface ChatState {
  messages: ChatMessage[]
  status: ChatStatus
  /** Which of the assistant's progress stages is currently displayed. */
  progress: SearchProgress[]
  progressIndex: number
  error: string | null
  /** The filters produced by the most recent turn — context for refinements. */
  lastQuery: ResolvedQuery | undefined
  /** Counter backing a "try again" affordance after a failure. */
  retryCount: number

  send: (text: string, options?: SendOptions) => Promise<void>
  /** Re-runs the last query. */
  retryLast: () => Promise<void>
  clear: () => void
  /** Re-resolves persisted product ids against the catalogue. */
  hydrateProducts: () => Promise<void>
  dismissError: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      status: 'idle',
      progress: [],
      progressIndex: 0,
      error: null,
      lastQuery: undefined,
      retryCount: 0,

      clear: () => {
        set({ messages: [], status: 'idle', progress: [], progressIndex: 0, error: null, lastQuery: undefined })
        useUserStore.setState({ isNewUser: true, hasInteracted: false })
      },

      dismissError: () => set({ error: null }),

      hydrateProducts: async () => {
        const ids = get().messages.flatMap((message) => message.productIds)
        await useCatalogStore.getState().loadProducts([...new Set(ids)])
      },

      retryLast: async () => {
        const lastUserMessage = [...get().messages].reverse().find((message) => message.role === 'user')
        if (!lastUserMessage) return
        set({ retryCount: get().retryCount + 1 })
        await get().send(lastUserMessage.text, { isRetry: true })
      },

      send: async (rawText, options = {}) => {
        const text = rawText.trim()
        if (!text || get().status === 'thinking') return

        const { isRetry = false } = options
        const existing = get().messages

        // On retry we drop the failed assistant turn instead of stacking.
        const messages: ChatMessage[] = isRetry
          ? existing.filter((message) => message.status !== 'error')
          : [
              ...existing,
              {
                id: createId('u'),
                role: 'user',
                text,
                createdAt: Date.now(),
                status: 'done',
                productIds: [],
              },
            ]

        const placeholderId = createId('a')
        const placeholder: ChatMessage = {
          id: placeholderId,
          role: 'assistant',
          text: '',
          createdAt: Date.now(),
          status: 'thinking',
          productIds: [],
        }

        const stages: SearchProgress[] = SEARCH_STAGES.map((stage) => ({ ...stage }))

        set({
          messages: [...messages, placeholder],
          status: 'thinking',
          error: null,
          progress: stages,
          progressIndex: 0,
        })

        // The app is no longer a first-time visitor the moment they search.
        useUserStore.getState().markInteracted()

        // Walk the progress stages while the request is in flight. The stages
        // cycle, which reads naturally when the backend takes a while.
        let stageIndex = 0
        const ticker = setInterval(() => {
          stageIndex = (stageIndex + 1) % stages.length
          set({ progressIndex: stageIndex })
        }, MOCK_TIMING.stage)

        try {
          const response = await api.search({
            query: text,
            context: get().lastQuery,
            history: messages,
          })

          const assistantMessage: ChatMessage = {
            id: placeholderId,
            role: 'assistant',
            text: response.reply,
            createdAt: Date.now(),
            status: 'done',
            productIds: response.products.map((product) => product.id),
            filters: response.resolved,
            suggestions: response.suggestions,
            meta: response.meta,
          }

          await useCatalogStore.getState().loadProducts(response.products.map((product) => product.id))

          useUserStore.getState().addSearch({
            query: text,
            category: response.resolved.category,
            resultCount: response.products.length,
          })

          set((state) => ({
            messages: [...state.messages.filter((message) => message.id !== placeholderId), assistantMessage],
            status: 'idle',
            lastQuery: response.resolved,
            progress: [],
            progressIndex: 0,
            error: null,
          }))
        } catch (error) {
          const message = toErrorMessage(error, 'Search failed. Please try again.')
          set((state) => ({
            messages: state.messages.map((entry) =>
              entry.id === placeholderId
                ? { ...entry, text: 'I lost the connection mid-search.', status: 'error' as const }
                : entry,
            ),
            status: 'error',
            error: message,
            progress: [],
            progressIndex: 0,
          }))
        } finally {
          clearInterval(ticker)
        }
      },
    }),
    {
      name: STORAGE_KEYS.chat,
      version: 1,
      // Transient request state is intentionally not persisted.
      partialize: (state) => ({
        messages: state.messages,
        lastQuery: state.lastQuery,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) void state.hydrateProducts()
      },
    },
  ),
)

/* -------------------------------------------------------------------------- */
/* Selectors                                                                  */
/* -------------------------------------------------------------------------- */

export function selectUserMessageCount(state: ChatState): number {
  return state.messages.filter((message) => message.role === 'user').length
}

export function selectIsEmptyThread(state: ChatState): boolean {
  return state.messages.length === 0
}

/** The last assistant turn that carried results — used by Account re-runs. */
export function selectLastAssistantResult(state: ChatState): ChatMessage | undefined {
  return [...state.messages].reverse().find((message) => message.role === 'assistant' && message.productIds.length > 0)
}

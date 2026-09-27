import { create } from 'zustand'

import { createId } from '@/utils/id'

/** Transient, non-persisted UI concerns: overlays, toasts, refresh locks. */

export type ToastTone = 'neutral' | 'success' | 'critical'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

export interface UIState {
  /** Product opened in the detail sheet. `null` = closed. */
  activeProductId: string | null
  /** Source of the open sheet, used for the back affordance + analytics. */
  activeProductSource: 'chat' | 'feed' | 'account' | null
  toasts: Toast[]
  isRefreshingFeed: boolean

  openProduct: (productId: string, source: NonNullable<UIState['activeProductSource']>) => void
  closeProduct: () => void
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
  setRefreshingFeed: (value: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  activeProductId: null,
  activeProductSource: null,
  toasts: [],
  isRefreshingFeed: false,

  openProduct: (productId, source) => {
    set({ activeProductId: productId, activeProductSource: source })
  },

  closeProduct: () => set({ activeProductId: null, activeProductSource: null }),

  pushToast: (message, tone = 'neutral') => {
    const id = createId('t')
    set({ toasts: [...get().toasts, { id, message, tone }] })
    // Auto-dismiss; the timer is fire-and-forget by design.
    setTimeout(() => get().dismissToast(id), 2600)
  },

  dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),

  setRefreshingFeed: (value) => set({ isRefreshingFeed: value }),
}))

export const selectIsProductOpen = (state: UIState): boolean => state.activeProductId !== null

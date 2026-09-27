/**
 * Result type used by the data layer.
 *
 * Components render from `AsyncState` so loading / error / empty are handled
 * explicitly rather than by throwing across the component tree.
 */
export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: T | null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string }

export const asyncState = {
  idle: <T,>(): AsyncState<T> => ({ status: 'idle', data: null, error: null }),
  loading: <T,>(data: T | null = null): AsyncState<T> => ({ status: 'loading', data, error: null }),
  success: <T,>(data: T): AsyncState<T> => ({ status: 'success', data, error: null }),
  error: <T,>(error: string): AsyncState<T> => ({ status: 'error', data: null, error }),
} as const

/** Normalises anything thrown into a message safe to show a user. */
export function toErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

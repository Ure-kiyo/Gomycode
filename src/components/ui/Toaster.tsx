import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/utils/cn'

const TONE_CLASSES = {
  neutral: 'bg-surface-inverse text-ink-inverse',
  success: 'bg-positive text-white',
  critical: 'bg-critical text-white',
} as const

/** Bottom-centred transient feedback (saved, removed, error). */
export function Toaster() {
  const toasts = useUIStore((state) => state.toasts)
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(var(--safe-b) + var(--tabbar-h) + 1rem)' }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto max-w-sm animate-fade-up rounded-2xl px-4 py-2.5 text-sm font-medium shadow-lift',
            TONE_CLASSES[toast.tone],
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

import { useUIStore } from '@/store/useUIStore'
import { useUserStore } from '@/store/useUserStore'
import { cn } from '@/utils/cn'
import { HeartIcon } from '../ui/icons'

export interface SaveButtonProps {
  productId: string
  /** `overlay` floats on product art, `plain` sits inline. */
  variant?: 'overlay' | 'plain'
  className?: string
  label?: string
}

/**
 * Save/unsave toggle.
 *
 * Saving counts as intent: the store flips `hasInteracted`, which is what moves
 * the app's home screen from Chat to For You.
 */
export function SaveButton({ productId, variant = 'overlay', className, label }: SaveButtonProps) {
  const isSaved = useUserStore((state) => state.savedProductIds.includes(productId))
  const toggleSave = useUserStore((state) => state.toggleSave)
  const pushToast = useUIStore((state) => state.pushToast)

  const handlePress = (event: React.MouseEvent) => {
    // Cards are themselves buttons; don't let the tap bubble into a navigation.
    event.stopPropagation()
    const nowSaved = toggleSave(productId)
    pushToast(nowSaved ? 'Saved to your list' : 'Removed from saved', nowSaved ? 'success' : 'neutral')
  }

  const isOverlay = variant === 'overlay'

  return (
    <button
      type="button"
      onClick={handlePress}
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
      className={cn(
        'grid place-items-center transition-all duration-200 active:scale-90',
        isOverlay
          ? isSaved
            ? 'absolute right-2 top-2 size-8 rounded-full bg-brand text-white shadow-soft'
            : 'absolute right-2 top-2 size-8 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60'
          : isSaved
            ? 'size-9 rounded-full bg-brand-soft text-brand'
            : 'size-9 rounded-full text-ink-muted hover:bg-surface-sunken hover:text-ink',
        className,
      )}
    >
      <HeartIcon filled={isSaved} className="size-4" />
      <span className="sr-only">{label ?? (isSaved ? 'Saved' : 'Save')}</span>
    </button>
  )
}

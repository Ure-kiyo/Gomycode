import { formatRating, formatReviewCount } from '@/utils/format'
import { cn } from '@/utils/cn'
import { StarIcon } from '../ui/icons'

export interface RatingStarsProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
  showCount?: boolean
  className?: string
}

/** Star glyph + numeric rating. Colour communicates confidence at a glance. */
export function RatingStars({ rating, reviewCount, size = 'sm', showCount = true, className }: RatingStarsProps) {
  const dimension = size === 'sm' ? 'size-3' : 'size-4'
  const tone = rating >= 4.5 ? 'text-caution' : rating >= 4 ? 'text-brand' : 'text-ink-subtle'

  return (
    <span className={cn('flex items-center gap-1', className)}>
      <StarIcon className={dimension} filled={rating >= 4} />
      <span className={cn('text-[0.6875rem] font-semibold', tone)}>{formatRating(rating)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-[0.6875rem] text-ink-subtle">({formatReviewCount(reviewCount)})</span>
      )}
    </span>
  )
}

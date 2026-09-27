import { cn } from '@/utils/cn'

export interface SkeletonProps {
  className?: string
}

/** Base shimmer block. Compose with Tailwind sizing utilities. */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn('skeleton rounded-xl', className)} />
}

/** Placeholder matching the ProductCard footprint, to avoid layout shift. */
export function ProductCardSkeleton() {
  return (
    <div className="w-44 shrink-0" aria-hidden>
      <Skeleton className="aspect-square w-44 rounded-2xl" />
      <Skeleton className="mt-2.5 h-3 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-2.5 h-4 w-16" />
    </div>
  )
}

/** A row of card skeletons for loading carousels. */
export function ProductRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden px-4" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

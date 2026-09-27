import type { Product } from '@/types'
import { ProductCard, type ProductSource } from './ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'

export interface ProductGridProps {
  products: Product[]
  source?: ProductSource
  showBlurb?: boolean
  loading?: boolean
  skeletonCount?: number
  className?: string
}

/**
 * Vertical product list used for chat result sets and the saved-items grid.
 * Horizontal carousels are handled by `SectionCarousel` instead.
 */
export function ProductGrid({
  products,
  source = 'chat',
  showBlurb = false,
  loading = false,
  skeletonCount = 4,
  className,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={className}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <li key={index}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <ul className={className ?? 'grid grid-cols-2 gap-3 sm:grid-cols-3'}>
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} source={source} compact showBlurb={showBlurb} />
        </li>
      ))}
    </ul>
  )
}

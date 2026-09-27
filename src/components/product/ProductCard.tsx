import { getStoreLabel, STORE_MAP } from '@/constants/taxonomy'
import { useUIStore } from '@/store/useUIStore'
import { useUserStore } from '@/store/useUserStore'
import type { Product } from '@/types'
import { discountPercent, formatPriceShort } from '@/utils/format'
import { cn } from '@/utils/cn'
import { ProductImage } from './ProductImage'
import { RatingStars } from './RatingStars'
import { SaveButton } from './SaveButton'

export type ProductSource = 'chat' | 'feed' | 'account'

export interface ProductCardProps {
  product: Product
  /** Fixed width for horizontal carousels; omit to fill a grid cell. */
  widthClass?: string
  /** Where the card was opened from — drives the detail sheet's back label. */
  source?: ProductSource
  /** Adds the "why this fits" line (chat + feed cards). */
  showBlurb?: boolean
  className?: string
  /** Grid cards need a square image; carousels can stay square too. */
  compact?: boolean
}

/**
 * The single product presentation used by chat results, feed carousels and the
 * saved grid. Keeping one component (rather than three near-duplicates) is what
 * makes the app feel coherent.
 *
 * The whole card is one button so it is a single, correctly-sized tap target;
 * the save control sits above it and stops propagation.
 */
export function ProductCard({
  product,
  widthClass = 'w-44',
  source = 'feed',
  showBlurb = false,
  compact = false,
  className,
}: ProductCardProps) {
  const openProduct = useUIStore((state) => state.openProduct)
  const recordView = useUserStore((state) => state.recordView)
  const markInteracted = useUserStore((state) => state.markInteracted)

  const discount = discountPercent(product.price, product.listPrice)
  const store = STORE_MAP[product.store]

  const handleOpen = () => {
    // Any product click is intent — it promotes the user out of first-run.
    markInteracted()
    recordView(product.id)
    openProduct(product.id, source)
  }

  return (
    <article
      className={cn(
        'group relative shrink-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        'focus-within:-translate-y-0.5 focus-within:shadow-lift',
        compact ? 'w-full' : widthClass,
        className,
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen() } }}
        className="block w-full cursor-pointer text-left focus-visible:outline-none"
        aria-label={`${product.title}, ${formatPriceShort(product.price)}`}
      >
        <div className="relative">
          <ProductImage product={product} className="w-full" />
          <SaveButton productId={product.id} />

          {discount !== null && (
            <span className="absolute bottom-2 left-2 rounded-full bg-critical px-2 py-0.5 text-[0.625rem] font-bold text-white shadow-soft">
              −{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[0.625rem] font-semibold text-ink-inverse">
              Sold out
            </span>
          )}
        </div>

        <div className="space-y-1.5 p-2.5">
          {product.highlight && (
            <span className="inline-block rounded bg-brand/10 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wide text-brand">
              {product.highlight}
            </span>
          )}
          <p className="line-clamp-2 min-h-[2.1em] text-[0.8125rem] font-medium leading-snug text-ink">
            {product.title}
          </p>

          <div className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full ring-1 ring-black/5"
              style={{ backgroundColor: store?.color ?? 'var(--brand)' }}
            />
            <span className="truncate text-[0.6875rem] text-ink-subtle">
              {getStoreLabel(product.store)}
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div className="min-w-0">
              <span className="text-[0.9375rem] font-bold tracking-tight text-ink">
                {formatPriceShort(product.price)}
              </span>
              {product.listPrice && product.listPrice > product.price && (
                <span className="ml-1.5 text-[0.6875rem] text-ink-subtle line-through">
                  {formatPriceShort(product.listPrice)}
                </span>
              )}
            </div>
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          {showBlurb && !compact && (
            <p className="line-clamp-2 pt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
              {product.blurb}
            </p>
          )}

          {product.referenceUrl && (
            <div className="pt-2">
              <a
                href={product.referenceUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block w-full rounded-md bg-surface-alt py-1.5 text-center text-[0.75rem] font-semibold text-brand transition-colors hover:bg-line"
              >
                View on {store?.shortName ?? 'Store'}
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

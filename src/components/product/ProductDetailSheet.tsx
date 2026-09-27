import { useMemo } from 'react'

import { getStoreLabel, STORE_MAP } from '@/constants/taxonomy'
import { useCatalogStore } from '@/store/useCatalogStore'
import { useUIStore } from '@/store/useUIStore'
import { useUserStore } from '@/store/useUserStore'
import { discountPercent, formatPrice } from '@/utils/format'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Skeleton } from '../ui/Skeleton'
import { CheckIcon, ExternalLinkIcon, StarIcon, TagIcon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import { ProductImage } from './ProductImage'
import { SaveButton } from './SaveButton'

/**
 * Product detail sheet.
 *
 * Opened from anywhere via `useUIStore.openProduct()` rather than a route: the
 * sheet is an overlay on top of whatever tab the user is on, so it doesn't
 * interrupt tab state and can be raised from chat, feed and account alike.
 */
export function ProductDetailSheet() {
  const productId = useUIStore((state) => state.activeProductId)
  const closeProduct = useUIStore((state) => state.closeProduct)

  const product = useCatalogStore((state) => (productId ? state.products[productId] : undefined))
  const isSaved = useUserStore((state) => Boolean(productId && state.savedProductIds.includes(productId)))

  // Lazily fetch the body if the sheet is opened from an id we haven't cached.
  const isCached = Boolean(product)

  const store = product ? STORE_MAP[product.store] : undefined
  const discount = product ? discountPercent(product.price, product.listPrice) : null

  const delivery = useMemo(() => {
    if (!store) return ''
    const [min, max] = store.deliveryDays
    return min === max ? `${min} day${min === 1 ? '' : 's'}` : `${min}–${max} days`
  }, [store])

  return (
    <Sheet open={Boolean(productId)} onClose={closeProduct} title={isCached ? 'Product' : 'Loading…'}>
      {product ? (
        <div className="animate-fade-up px-5">
          <div className="relative overflow-hidden rounded-2xl">
            <ProductImage product={product} variant="hero" />
            <SaveButton productId={product.id} />
          </div>

          <div className="mt-4 space-y-4">
            <header className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip tone="brand">{store ? store.shortName : 'Store'}</Chip>
                {product.inStock ? (
                  <Chip tone="positive">
                    <CheckIcon className="size-3" /> In stock
                  </Chip>
                ) : (
                  <Chip tone="caution">Sold out</Chip>
                )}
                {product.freeShipping && <Chip tone="neutral">Free shipping</Chip>}
                {discount !== null && <Chip tone="caution">{discount}% off</Chip>}
              </div>

              <h3 className="text-lg font-semibold leading-tight tracking-tight text-ink">
                {product.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <StarIcon className="size-4 text-caution" />
                  <span className="text-sm font-semibold text-ink">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-ink-subtle">· {product.reviewCount.toLocaleString('en-US')} reviews</span>
                </span>
                <span className="text-xs text-ink-subtle">Ships in {delivery}</span>
              </div>
            </header>

            <div className="flex items-end gap-2.5">
              <span className="text-2xl font-bold tracking-tight text-ink">
                {formatPrice(product.price)}
              </span>
              {product.listPrice && product.listPrice > product.price && (
                <span className="pb-0.5 text-sm text-ink-subtle line-through">
                  {formatPrice(product.listPrice)}
                </span>
              )}
            </div>

            <p className="rounded-2xl bg-brand-soft/60 p-3.5 text-sm leading-relaxed text-ink">
              <span className="font-semibold text-brand">Why it fits: </span>
              {product.blurb}
            </p>

            {product.specs.length > 0 && (
              <section className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  <TagIcon className="size-3.5" /> Specs
                </h4>
                <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between gap-4 px-3.5 py-2.5">
                      <dt className="text-xs text-ink-muted">{spec.label}</dt>
                      <dd className="text-right text-xs font-medium text-ink">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Button fullWidth size="lg" trailingIcon={<ExternalLinkIcon className="size-4" />}>
                View on {getStoreLabel(product.store)}
              </Button>
              <p className="text-center text-[0.6875rem] text-ink-subtle">
                Demo build — no purchase flow is wired up.
              </p>
            </div>

            {isSaved && (
              <p className="pb-1 text-center text-[0.6875rem] text-ink-subtle">
                In your saved items · <span className="text-brand">Account → Saved</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 px-5">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
      )}
    </Sheet>
  )
}

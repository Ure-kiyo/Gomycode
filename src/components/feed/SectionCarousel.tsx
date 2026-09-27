import { useRef } from 'react'

import type { Product } from '@/types'
import { ProductCard, type ProductSource } from '../product/ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'
import { cn } from '@/utils/cn'

export interface SectionCarouselProps {
  products: Product[]
  title: string
  subtitle?: string
  glyph?: string
  source?: ProductSource
  loading?: boolean
  /** Widens the cards slightly on tablet/desktop. */
  itemWidthClass?: string
  className?: string
  /** Rendered instead of the scroller when there is nothing to show. */
  emptySlot?: React.ReactNode
}

/**
 * Horizontally scrolling product row with edge fade + arrow affordances.
 *
 * Arrows are desktop-only affordances; on touch the row is a native snap
 * scroller, which is both faster and more accessible than a JS drag.
 */
export function SectionCarousel({
  products,
  title,
  subtitle,
  glyph,
  source = 'feed',
  loading = false,
  itemWidthClass = 'w-44 sm:w-48',
  className,
  emptySlot,
}: SectionCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollBy = (direction: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section className={cn('space-y-3', className)} aria-busy>
        <div className="px-4">
          <div className="skeleton h-4 w-40 rounded-lg" />
        </div>
        <div className="flex gap-3 overflow-hidden px-4">
          {Array.from({ length: 4 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return emptySlot ? <div className={className}>{emptySlot}</div> : null
  }

  return (
    <section className={cn('space-y-3', className)} aria-labelledby={`section-${slug(title)}`}>
      <div className="flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <h2
            id={`section-${slug(title)}`}
            className="flex items-center gap-2 text-[0.9375rem] font-semibold tracking-tight text-ink"
          >
            {glyph && <span aria-hidden>{glyph}</span>}
            <span className="truncate">{title}</span>
          </h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-ink-subtle">{subtitle}</p>}
        </div>

        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <ArrowButton direction="left" onPress={() => scrollBy(-1)} />
          <ArrowButton direction="right" onPress={() => scrollBy(1)} />
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          className="no-scrollbar snap-x-mandatory flex gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
        >
          {products.map((product) => (
            <div key={product.id} className="snap-start">
              <ProductCard product={product} widthClass={itemWidthClass} source={source} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowButton({ direction, onPress }: { direction: 'left' | 'right'; onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      className="grid size-7 place-items-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-brand hover:text-brand"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        {direction === 'left' ? <path d="m14.5 5.5-6.5 6.5 6.5 6.5" /> : <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />}
      </svg>
    </button>
  )
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

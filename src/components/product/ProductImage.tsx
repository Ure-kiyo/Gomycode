import { useState } from 'react'
import { CATEGORY_MAP } from '@/constants/taxonomy'
import type { Product } from '@/types'
import { hashString } from '@/utils/id'
import { cn } from '@/utils/cn'

export interface ProductImageProps {
  product: Product
  className?: string
  /** `card` = square, `hero` = 4:3, `thumb` = small rounded rect. */
  variant?: 'card' | 'hero' | 'thumb'
  loading?: 'lazy' | 'eager'
}

/**
 * Product imagery.
 *
 * Renders a real product photo when `imageUrl` is available, with a shimmer
 * skeleton while loading and a graceful gradient fallback on error.
 */
export function ProductImage({ product, className, variant = 'card', loading = 'lazy' }: ProductImageProps) {
  const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading')

  const category = CATEGORY_MAP[product.category]
  const [from = '#7c5cff', to = '#06b6d4'] = category?.art ?? ['#7c5cff', '#06b6d4']
  const shift = (hashString(product.id) % 40) - 20
  const glyph = category?.glyph ?? '📦'

  const aspect = variant === 'hero' ? 'aspect-[4/3]' : 'aspect-square'
  const glyphSize = variant === 'hero' ? 'text-6xl' : variant === 'thumb' ? 'text-xl' : 'text-4xl'

  if (product.imageUrl && imgState !== 'error') {
    return (
      <div className={cn('relative overflow-hidden', aspect, className)}>
        {/* Skeleton shimmer while loading */}
        {imgState === 'loading' && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img
          src={product.imageUrl}
          alt={product.title}
          loading={loading}
          decoding="async"
          draggable={false}
          onLoad={() => setImgState('loaded')}
          onError={() => setImgState('error')}
          className={cn(
            'drag-none w-full h-full object-cover transition-opacity duration-300',
            imgState === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
        {/* Gradient overlay so discount badges + save button stay readable */}
        {imgState === 'loaded' && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        )}
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        'relative grid w-full place-items-center overflow-hidden',
        aspect,
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(${140 + shift}deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      <span
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(60% 60% at 28% 22%, rgba(255,255,255,0.55) 0%, transparent 70%)',
        }}
      />
      <span className={cn('relative drop-shadow-sm', glyphSize)}>{glyph}</span>
      <span className="absolute bottom-1.5 left-2 text-[0.625rem] font-semibold uppercase tracking-wider text-white/70">
        {category?.name ?? product.category}
      </span>
    </div>
  )
}

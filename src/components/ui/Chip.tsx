import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

export type ChipTone = 'neutral' | 'brand' | 'positive' | 'caution'

const TONES: Record<ChipTone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  brand: 'bg-brand-soft text-brand',
  positive: 'bg-positive/12 text-positive',
  caution: 'bg-caution/12 text-caution',
}

export interface ChipProps {
  children: ReactNode
  tone?: ChipTone
  className?: string
  /** Leading dot, e.g. a store colour. */
  dotColor?: string
}

export function Chip({ children, tone = 'neutral', className, dotColor }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {dotColor && <span className="size-1.5 rounded-full" style={{ backgroundColor: dotColor }} />}
      {children}
    </span>
  )
}

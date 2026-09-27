import { cn } from '@/utils/cn'

export interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Adds the brand gradient ring used on the Account header. */
  ring?: boolean
}

const SIZES = {
  sm: 'size-8 text-[0.6875rem]',
  md: 'size-10 text-xs',
  lg: 'size-14 text-sm',
  xl: 'size-20 text-lg',
} as const

export function Avatar({ initials, size = 'md', className, ring = false }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white',
        SIZES[size],
        ring && 'ring-2 ring-brand/25 ring-offset-2 ring-offset-surface',
        className,
      )}
    >
      {initials}
    </span>
  )
}

import type { ReactNode } from 'react'
import { Folder } from 'lucide-react'

import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface EmptyStateProps {
  glyph?: ReactNode
  title: string
  description?: ReactNode
  action?: { label: string; onPress: () => void; variant?: 'primary' | 'outline' }
  secondaryAction?: { label: string; onPress: () => void }
  className?: string
  compact?: boolean
}

/** Consistent "nothing here yet" panel used across Chat, For You and Account. */
export function EmptyState({
  glyph = <Folder className="size-6 text-brand" />,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-strong bg-surface/60 text-center',
        compact ? 'gap-2.5 p-6' : 'gap-3.5 p-8',
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          'grid place-items-center rounded-2xl bg-brand-soft',
          compact ? 'size-11 text-xl' : 'size-16 text-3xl',
        )}
      >
        {glyph}
      </div>
      <div className="space-y-1.5">
        <h3 className={cn('font-semibold text-ink', compact ? 'text-sm' : 'text-base')}>{title}</h3>
        {description && (
          <p className={cn('mx-auto max-w-xs text-ink-muted', compact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-col items-center gap-2">
          {action && (
            <Button size={compact ? 'sm' : 'md'} variant={action.variant ?? 'primary'} onClick={action.onPress}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onPress}
              className="text-xs font-medium text-brand hover:underline"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

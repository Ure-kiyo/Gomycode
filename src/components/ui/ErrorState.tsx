import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
  compact?: boolean
}

/** Failure panel with a retry affordance — used wherever data is fetched. */
export function ErrorState({
  title = 'That didn’t load',
  message,
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-3xl border border-critical/25 bg-critical/5 text-center',
        compact ? 'p-5' : 'p-7',
        className,
      )}
    >
      <div aria-hidden className="grid size-11 place-items-center rounded-2xl bg-critical/12 text-xl">
        ⚠️
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mx-auto max-w-xs text-xs text-ink-muted">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

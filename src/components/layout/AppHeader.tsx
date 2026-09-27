import { APP_TAGLINE } from '@/constants/app'
import { Logo } from '../ui/Logo'

export interface AppHeaderProps {
  /** Shown to the right of the lockup — e.g. a search shortcut. */
  trailing?: React.ReactNode
  /** Renders the tagline under the wordmark (splash / first-run only). */
  showTagline?: boolean
  className?: string
}

/** Sticky top bar: brand lockup on the left, contextual actions on the right. */
export function AppHeader({ trailing, showTagline = false, className }: AppHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 border-b border-line/70 bg-surface/85 backdrop-blur-xl ${className ?? ''}`}
      style={{ paddingTop: 'var(--safe-t)' }}
    >
      <div className="mx-auto flex max-w-lg md:max-w-2xl lg:max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Logo variant="lockup" />
        {showTagline && (
          <p className="ml-1 hidden truncate text-[0.6875rem] text-ink-subtle sm:block">{APP_TAGLINE}</p>
        )}
        {trailing && <div className="ml-auto flex items-center gap-1.5">{trailing}</div>}
      </div>
    </header>
  )
}

/** Circular icon button for header actions. */
export function HeaderAction({
  label,
  onPress,
  children,
  active = false,
}: {
  label: string
  onPress: () => void
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      aria-pressed={active}
      className={`grid size-9 place-items-center rounded-full transition-colors ${
        active ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

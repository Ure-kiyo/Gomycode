import { APP_NAME, APP_TAGLINE } from '@/constants/app'
import { cn } from '@/utils/cn'

export interface LogoProps {
  /** `mark` = glyph only, `lockup` = glyph + wordmark, `stacked` = with tagline. */
  variant?: 'mark' | 'lockup' | 'stacked'
  className?: string
  showTagline?: boolean
}

/**
 * The Sift mark: a filter/sieve — stacked bars narrowing to a single pass.
 * Drawn inline so it inherits theme colours and needs no asset pipeline.
 */
export function Logo({ variant = 'lockup', className, showTagline = true }: LogoProps) {
  const isMark = variant === 'mark'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="none"
        className={cn('shrink-0', isMark ? 'size-6' : 'size-7')}
        role="img"
        aria-label={`${APP_NAME} logo`}
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E5CC" />
            <stop offset="100%" stopColor="#00A896" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="120" fill="#0A1A18" />
        {/* S-shaped flowing path */}
        <path
          d="M 310 120 C 310 120, 180 108, 156 168 C 132 228, 220 248, 270 264 C 330 282, 380 304, 356 368 C 334 426, 190 408, 190 408"
          stroke="url(#logo-grad)"
          strokeWidth="48"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Magnifying glass dot at top */}
        <circle cx="320" cy="148" r="26" fill="#00E5CC" opacity="0.9" />
        <circle cx="320" cy="148" r="14" fill="#0A1A18" />
      </svg>

      {!isMark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-[1.0625rem] font-bold tracking-tight text-ink">{APP_NAME}</span>
          {variant === 'stacked' && showTagline && (
            <span className="mt-0.5 truncate text-[0.6875rem] font-medium text-ink-subtle">
              {APP_TAGLINE}
            </span>
          )}
        </span>
      )}
    </span>
  )
}

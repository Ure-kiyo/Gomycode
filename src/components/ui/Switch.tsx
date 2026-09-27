import { cn } from '@/utils/cn'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  /** Hides the visible label for use with `aria-label` only. */
  hideLabel?: boolean
  disabled?: boolean
}

/** Accessible toggle matching the iOS-style switch. */
export function Switch({ checked, onChange, label, hideLabel = false, disabled }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-3', disabled ? 'opacity-50' : 'cursor-pointer')}>
      {!hideLabel && <span className="text-sm text-ink">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
          checked ? 'bg-brand' : 'bg-line-strong',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'inline-block size-5 transform rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-4.5' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  )
}

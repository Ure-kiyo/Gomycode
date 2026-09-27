import { cn } from '@/utils/cn'

export interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (value: string) => void
  disabled?: boolean
  label?: string
  className?: string
}

/**
 * Conversational refinements ("cheaper ones", "show only Amazon").
 *
 * These are the *same* input the composer accepts — a chip simply sends that
 * text as the next turn, so the user never has to learn a second interaction
 * model.
 */
export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
  label = 'Refine',
  className,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-subtle">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            className="rounded-full border border-brand/25 bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand transition-all hover:bg-brand hover:text-on-brand active:scale-95 disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

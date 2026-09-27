import { useEffect, useRef, useState } from 'react'

import { useDebouncedValue } from '@/hooks/usePullToRefresh'
import { api } from '@/services'
import { cn } from '@/utils/cn'
import { ArrowUpIcon, CloseIcon, SearchIcon } from '../ui/icons'

export interface ChatComposerProps {
  onSend: (text: string) => void
  /** External value (used when re-running a query from Account). */
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Suggestions shown as chips when the input is empty. */
  starterChips?: string[]
  autoFocus?: boolean
  className?: string
}

const MAX_TEXTAREA_HEIGHT = 132

/**
 * The single input for the whole app.
 *
 * Deliberately a plain text field — the product promise is that you describe
 * what you want, not that you fill in a form. Autocomplete is opt-in
 * discoverability, not a requirement.
 */
export function ChatComposer({
  onSend,
  value,
  onValueChange,
  placeholder = 'What are you looking for?',
  disabled = false,
  starterChips,
  autoFocus = false,
  className,
}: ChatComposerProps) {
  const [internal, setInternal] = useState('')
  const isControlled = value !== undefined
  const text = isControlled ? value : internal
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const debounced = useDebouncedValue(text, 220)

  const setText = (next: string) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  /* Autocomplete, driven by the same API the results come from. */
  useEffect(() => {
    if (debounced.trim().length < 2) {
      setSuggestions([])
      return
    }
    let cancelled = false
    void api.getSuggestions(debounced).then((results) => {
      if (!cancelled) setSuggestions(results)
    })
    return () => {
      cancelled = true
    }
  }, [debounced])

  /* Grow the field with its content, up to a cap, then scroll. */
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [text])

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    setSuggestions([])
    // Keep focus so the conversation flows without tapping back into the field.
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const canSend = text.trim().length > 0 && !disabled
  const showStarterChips = !text.trim() && starterChips && starterChips.length > 0
  const showDropdown = showSuggestions && suggestions.length > 0 && text.trim().length >= 2

  return (
    <div className={cn('relative', className)}>
      {showDropdown && (
        <ul
          className="absolute bottom-full left-0 right-0 z-20 mb-2 animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  setText(suggestion)
                  setShowSuggestions(false)
                  textareaRef.current?.focus()
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface-sunken"
              >
                <SearchIcon className="size-4 shrink-0 text-ink-subtle" />
                <span className="truncate">{suggestion}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showStarterChips && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {starterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setText(chip)
                requestAnimationFrame(() => textareaRef.current?.focus())
              }}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          'flex items-end gap-2 rounded-3xl border-2 bg-surface p-1.5 pl-3.5 shadow-soft transition-all duration-200',
          'focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(108,99,255,0.18)]',
          disabled ? 'opacity-70 border-line' : 'border-line-strong hover:border-brand/50',
        )}
      >
        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            aria-label="Clear"
            className="mb-1.5 grid size-6 shrink-0 place-items-center rounded-full text-ink-subtle hover:text-ink"
          >
            <CloseIcon className="size-3.5" />
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => {
            setText(event.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
          onKeyDown={(event) => {
            // Enter sends on desktop; Shift+Enter inserts a newline.
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit()
            }
          }}
          className="max-h-[132px] min-h-[2.5rem] flex-1 resize-none bg-transparent py-2.5 text-[0.9375rem] leading-relaxed text-ink outline-none placeholder:text-ink-subtle"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full transition-all duration-200',
            canSend
              ? 'bg-brand text-on-brand shadow-soft hover:brightness-110 active:scale-90'
              : 'bg-surface-raised text-ink-subtle',
          )}
        >
          <ArrowUpIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useEscapeKey } from '@/hooks/useEscapeKey'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { cn } from '@/utils/cn'
import { CloseIcon } from './icons'

export interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Sheet title, also used as the accessible dialog name. */
  title: string
  /** Renders as a centred dialog on ≥md, bottom sheet on phones. */
  describedBy?: string
  className?: string
  showHandle?: boolean
}

/**
 * Bottom sheet on mobile, centred dialog on desktop.
 *
 * Rendered in a portal so it escapes the tab's scroll containers, with focus
 * moved in on open and restored on close.
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  describedBy,
  className,
  showHandle = true,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useLockBodyScroll(open)
  useEscapeKey(open, onClose)

  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => restoreFocusRef.current?.focus?.()
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface shadow-sheet outline-none',
          'animate-sheet-up rounded-t-3xl sm:max-w-lg sm:animate-scale-in sm:rounded-3xl',
          className,
        )}
      >
        {showHandle && (
          <div className="flex shrink-0 justify-center pt-2.5 sm:hidden">
            <span aria-hidden className="h-1 w-10 rounded-full bg-line-strong" />
          </div>
        )}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-3 sm:pt-5">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(var(--safe-b)+1.25rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

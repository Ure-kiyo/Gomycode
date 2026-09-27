import { useMemo } from 'react'

import type { ChatMessage, SearchProgress } from '@/types'
import { formatRelativeTime } from '@/utils/format'
import { renderRichText } from '@/utils/richText'
import { cn } from '@/utils/cn'
import { Logo } from '../ui/Logo'
import { ErrorState } from '../ui/ErrorState'
import { Spinner } from '../ui/Button'

export interface ChatBubbleProps {
  message: ChatMessage
  progress?: SearchProgress
  children?: React.ReactNode
  onRetry?: () => void
}

const ROLE_STYLES = {
  user: {
    bubble: 'rounded-3xl rounded-br-lg bg-brand text-on-brand',
    text: 'text-on-brand',
  },
  assistant: {
    bubble: 'rounded-3xl rounded-bl-lg border border-line bg-surface',
    text: 'text-ink',
  },
} as const

/** A single turn in the conversation. */
export function ChatBubble({ message, progress, children, onRetry }: ChatBubbleProps) {
  const styles = ROLE_STYLES[message.role]
  const isThinking = message.status === 'thinking'
  const timestamp = useMemo(() => formatRelativeTime(message.createdAt), [message.createdAt])

  return (
    <div className={cn('flex w-full animate-fade-up gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
      {message.role === 'assistant' && (
        <div className="mt-0.5 shrink-0">
          <Logo variant="mark" className="size-6" />
        </div>
      )}
      
      <div className={cn('flex flex-col gap-1.5', message.role === 'user' ? 'items-end' : 'items-start', message.role === 'user' ? 'max-w-[85%] md:max-w-[70%] lg:max-w-[60%]' : 'max-w-[calc(100%-2rem)] md:max-w-[85%] lg:max-w-[75%]')}>
        <div className={cn('px-3.5 py-2.5 text-sm shadow-soft w-full', styles.bubble)}>
          {isThinking ? (
            <ThinkingContent progress={progress} />
          ) : (
            <div className={cn('leading-relaxed', styles.text)}>{renderRichText(message.text)}</div>
          )}
        </div>

        {message.meta && message.status === 'done' && (
          <p className="px-1 text-[0.6875rem] text-ink-subtle">{message.meta}</p>
        )}

        {message.status === 'error' && onRetry && (
          <div className="w-full max-w-xs">
            <ErrorState compact message={message.text} onRetry={onRetry} title="Search failed" />
          </div>
        )}

        {children}

        {!isThinking && message.role === 'assistant' && (
          <span className="px-1 text-[0.625rem] text-ink-subtle/70">{timestamp}</span>
        )}
      </div>
    </div>
  )
}

function ThinkingContent({ progress }: { progress?: SearchProgress }) {
  return (
    <div className="flex items-center gap-2.5 py-0.5">
      <span className="flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 rounded-full bg-brand animate-typing-dot"
            style={{ animationDelay: `${dot * 0.18}s` }}
          />
        ))}
      </span>
      <span className="flex flex-col">
        <span className="text-[0.8125rem] font-medium text-ink">{progress?.label ?? 'Sifting through stores'}</span>
        {progress?.detail && (
          <span className="text-[0.6875rem] text-ink-subtle">{progress.detail}</span>
        )}
      </span>
    </div>
  )
}

/** Full-width placeholder row rendered while the very first search runs. */
export function FirstSearchSkeleton() {
  return (
    <div className="flex w-full animate-fade-in gap-2 justify-start">
      <div className="mt-0.5 shrink-0">
        <Logo variant="mark" className="size-6" />
      </div>
      <div className="flex flex-col gap-1.5 w-full max-w-[calc(100%-2rem)] md:max-w-[85%] lg:max-w-[75%] items-start">
        <div className="w-full space-y-2.5 rounded-3xl rounded-bl-lg border border-line bg-surface px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Spinner className="size-3.5 text-brand" />
            <span className="text-[0.8125rem] font-medium text-ink">Sifting through stores</span>
          </div>
          <div className="skeleton h-2.5 w-3/4 rounded-full" />
          <div className="skeleton h-2.5 w-1/2 rounded-full" />
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AppHeader, HeaderAction } from '@/components/layout/AppHeader'
import { ChatBubble, FirstSearchSkeleton } from '@/components/chat/ChatBubble'
import { ChatComposer } from '@/components/chat/ChatComposer'
import { SuggestionChips } from '@/components/chat/SuggestionChips'
import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { Logo } from '@/components/ui/Logo'
import { RefreshIcon } from '@/components/ui/icons'
import { QUERY_KEYS, STARTER_QUERIES } from '@/constants/app'
import { useCatalogStore } from '@/store/useCatalogStore'
import { useChatStore } from '@/store/useChatStore'
import { useUIStore } from '@/store/useUIStore'
import { useUserStore } from '@/store/useUserStore'
import { selectProductMap, getProductsById } from '@/store/useCatalogStore'
import { GREETING, EMPTY_THREAD_HINT } from '@/mock/copy'

/**
 * Chat — the default screen for first-time users, always available as a tab.
 *
 * The whole screen is one conversational thread: no filters, no facets. Every
 * assistant turn can carry a result grid plus refinement chips, and each chip
 * is sent as the next turn so refinements inherit the previous filters.
 */
export function ChatPage() {
  const messages = useChatStore((state) => state.messages)
  const status = useChatStore((state) => state.status)
  const progress = useChatStore((state) => state.progress)
  const progressIndex = useChatStore((state) => state.progressIndex)
  const error = useChatStore((state) => state.error)
  const send = useChatStore((state) => state.send)
  const retryLast = useChatStore((state) => state.retryLast)
  const clearThread = useChatStore((state) => state.clear)

  const productMap = useCatalogStore(selectProductMap)
  const hasInteracted = useUserStore((state) => state.hasInteracted)
  const pushToast = useUIStore((state) => state.pushToast)

  const [searchParams, setSearchParams] = useSearchParams()
  const [prefill, setPrefill] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const autoSendRef = useRef(false)

  const isThinking = status === 'thinking'
  const isEmptyThread = messages.length === 0

  /* ---------------------------------------------------------------------- */
  /* Deep link: Account → "re-run this search" lands here with ?q=…&auto=1   */
  /* ---------------------------------------------------------------------- */
  const queryParam = searchParams.get(QUERY_KEYS.prefill)
  const autoSend = searchParams.get(QUERY_KEYS.autoSend) === '1'

  useEffect(() => {
    if (!queryParam) return
    setPrefill(queryParam)
    if (autoSend && !autoSendRef.current) {
      autoSendRef.current = true
      void send(queryParam)
    }
    // Strip the params so a refresh doesn't re-send the same query.
    setSearchParams({}, { replace: true })
  }, [queryParam, autoSend, send, setSearchParams])

  /* Auto-scroll to the newest content as the thread grows. */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isThinking])

  const handleSend = useCallback(
    (text: string) => {
      setPrefill('')
      void send(text)
    },
    [send],
  )

  const handleClear = () => {
    clearThread()
    setPrefill('')
    autoSendRef.current = false
    pushToast('Conversation cleared')
  }

  const lastAssistantWithSuggestions = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.suggestions?.length)


  return (
    <div className="flex flex-col bg-surface-sunken" style={{ height: '100dvh' }}>
      <AppHeader
        showTagline={!hasInteracted}
        trailing={
          !isEmptyThread ? (
            <HeaderAction label="Clear conversation" onPress={handleClear}>
              <RefreshIcon className="size-5" />
            </HeaderAction>
          ) : null
        }
      />

      {/* Scrollable message thread — takes all remaining space */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: `calc(var(--tabbar-h) + var(--safe-b) + 90px)` }}
      >
        <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-3xl px-4">
          {isEmptyThread ? (
            <WelcomeState onPick={handleSend} />
          ) : (
            <div className="space-y-5 py-4">
              {messages.map((message) => {
                const messageProducts = getProductsById(productMap, message.productIds)

                if (message.role === 'user') {
                  return <ChatBubble key={message.id} message={message} />
                }

                return (
                  <div key={message.id} className="space-y-3">
                    <ChatBubble
                      message={message}
                      progress={progress[progressIndex]}
                      onRetry={retryLast}
                    >
                      {message.status === 'done' && messageProducts.length > 0 && (
                        <ProductGrid
                          products={messageProducts}
                          source="chat"
                          className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                        />
                      )}

                      {message.status === 'done' && messageProducts.length === 0 && message.productIds.length > 0 && (
                        <EmptyState
                          compact
                          glyph="🔍"
                          title="No matches"
                          description="Try widening the budget or dropping a store filter."
                        />
                      )}

                      {message.suggestions && message.suggestions.length > 0 && (
                        <SuggestionChips
                          suggestions={message.suggestions}
                          disabled={isThinking}
                          onSelect={handleSend}
                          className="pt-0.5"
                        />
                      )}
                    </ChatBubble>
                  </div>
                )
              })}

              {isThinking && messages[messages.length - 1]?.status !== 'thinking' && <FirstSearchSkeleton />}
              {error && !isThinking && (
                <p role="alert" className="text-center text-xs text-critical">
                  {error}
                </p>
              )}
              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Composer: FIXED directly above the 3 tab icons ─── */}
      <div
        className="fixed inset-x-0 z-30 border-t border-line/70 bg-surface/98 px-4 py-3 backdrop-blur-xl"
        style={{ bottom: 'var(--tabbar-h)' }}
      >
        <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-3xl">
          <ChatComposer
            value={prefill || undefined}
            onValueChange={setPrefill}
            onSend={handleSend}
            disabled={isThinking}
            placeholder={isEmptyThread ? 'What are you looking for?' : 'Refine your search…'}
            starterChips={isEmptyThread ? STARTER_QUERIES : undefined}
          />
          {isEmptyThread && (
            <p className="mt-2 text-center text-[0.6875rem] text-ink-subtle">{EMPTY_THREAD_HINT}</p>
          )}
        </div>
      </div>

      {lastAssistantWithSuggestions && <span className="sr-only">Refinements available</span>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* First-run state                                                            */
/* -------------------------------------------------------------------------- */

function WelcomeState({ onPick }: { onPick: (query: string) => void }) {
  return (
    <div className="relative aurora flex min-h-[62dvh] flex-col items-center justify-center overflow-hidden py-10 text-center">
      <div className="relative z-10 flex flex-col items-center">
        <span className="grid size-20 animate-drift place-items-center rounded-[2rem] bg-surface shadow-lift">
          <Logo variant="mark" className="size-12" />
        </span>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
          What fits <span className="text-brand">today</span>?
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">{GREETING}</p>

        <ul className="mt-6 w-full max-w-xs space-y-2">
          {STARTER_QUERIES.map((query) => (
            <li key={query}>
              <button
                type="button"
                onClick={() => onPick(query)}
                className="w-full rounded-2xl border border-line bg-surface/80 px-3.5 py-2.5 text-left text-[0.8125rem] font-medium text-ink shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand"
              >
                {query}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

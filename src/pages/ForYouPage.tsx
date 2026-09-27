import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeader, HeaderAction } from '@/components/layout/AppHeader'
import { SectionCarousel } from '@/components/feed/SectionCarousel'
import { SparkleIcon, RefreshIcon } from '@/components/ui/icons'
import { ROUTE_PATHS } from '@/constants/app'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { useCatalogStore, selectSections, selectHasFeedContent } from '@/store/useCatalogStore'
import { useUserStore } from '@/store/useUserStore'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/utils/cn'

/**
 * For You — the personalised home screen for returning users.
 *
 * Shows sections of recommended products driven by the mock recommendation
 * engine (search history, saved items, preferences). Falls back to an empty
 * state + CTA for brand-new users who haven't searched yet.
 */
export function ForYouPage() {
  const sections = useCatalogStore(selectSections)
  const hasFeedContent = useCatalogStore(selectHasFeedContent)
  const feedState = useCatalogStore((state) => state.feed)
  const refresh = useCatalogStore((state) => state.refresh)

  const hasInteracted = useUserStore((state) => state.hasInteracted)
  const profile = useUserStore((state) => state.profile)
  const pushToast = useUIStore((state) => state.pushToast)

  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  /* ---------------------------------------------------------------------- */
  /* Initial load                                                             */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (feedState.status === 'idle') {
      void refresh()
    }
  }, [feedState.status, refresh])

  /* ---------------------------------------------------------------------- */
  /* Pull-to-refresh                                                          */
  /* ---------------------------------------------------------------------- */
  const handleRefresh = useCallback(async () => {
    await refresh({ reseed: true })
    pushToast('Feed refreshed ✨')
  }, [refresh, pushToast])

  const { pullDistance, isArmed, isBusy, handlers } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: hasInteracted,
  })

  const isLoading = feedState.status === 'loading' && !hasFeedContent

  const handleSearchShortcut = () => navigate(ROUTE_PATHS.chat)

  return (
    <div className="flex min-h-dvh flex-col bg-surface-sunken">
      <AppHeader
        trailing={
          hasFeedContent ? (
            <HeaderAction
              label="Refresh feed"
              onPress={() => void handleRefresh()}
              active={isBusy}
            >
              <RefreshIcon
                className={cn('size-5 transition-transform duration-700', isBusy && 'animate-spin')}
              />
            </HeaderAction>
          ) : null
        }
      />

      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden bg-brand-soft transition-all duration-150"
          style={{ height: pullDistance }}
        >
          <RefreshIcon
            className={cn(
              'size-5 text-brand transition-transform',
              isArmed && 'rotate-180',
            )}
          />
          <span className="ml-2 text-xs font-medium text-brand">
            {isArmed ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-safe"
        {...handlers}
      >
        {/* ---------------------------------------------------------------- */}
        {/* No-history empty state                                            */}
        {/* ---------------------------------------------------------------- */}
        {!hasInteracted && !isLoading && (
          <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="relative mb-6">
              <span className="grid size-20 place-items-center rounded-4xl bg-brand-soft text-4xl shadow-soft animate-drift">
                <SparkleIcon className="size-10 text-brand" />
              </span>
              {/* Decorative rings */}
              <span className="absolute inset-0 -m-3 rounded-4xl border border-brand/20 animate-pulse" />
              <span className="absolute inset-0 -m-6 rounded-4xl border border-brand/10" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-ink">
              Your personalised feed
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
              Search for something first — then Sift learns what you love and
              builds a feed just for you.
            </p>
            <button
              id="for-you-search-cta"
              type="button"
              onClick={handleSearchShortcut}
              className="mt-8 rounded-2xl bg-brand px-8 py-3.5 text-sm font-semibold text-on-brand shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:scale-95"
            >
              Start searching ✦
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Loading skeletons                                                 */}
        {/* ---------------------------------------------------------------- */}
        {isLoading && (
          <div className="space-y-8 py-4">
            <div className="px-4 space-y-2">
              <div className="skeleton h-3 w-24 rounded-full" />
              <div className="skeleton h-6 w-32 rounded-lg" />
            </div>
            {Array.from({ length: 3 }, (_, i) => (
              <SectionCarousel key={i} products={[]} title="" loading />
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Personalised sections                                             */}
        {/* ---------------------------------------------------------------- */}
        {hasFeedContent && (
          <div className="space-y-8 py-4">
            {/* Greeting strip */}
            <div className="px-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-subtle">
                {timeGreeting(profile?.name)}
              </p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-ink">
                Your Feed
              </h1>
            </div>

            {sections.map((section) => (
              <SectionCarousel
                key={section.id}
                products={section.products}
                title={section.title}
                subtitle={section.subtitle}
                glyph={section.glyph}
                source="feed"
                className="animate-fade-up"
                // Stagger animation delays via inline style would need a wrapper;
                // the class alone suffices with CSS default delay.
              />
            ))}

            {/* Error overlay below sections */}
            {feedState.status === 'error' && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-critical">{feedState.error}</p>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-3 text-sm font-semibold text-brand underline-offset-2 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Floating search button — always reachable for returning users       */}
      {/* ------------------------------------------------------------------ */}
      {hasInteracted && (
        <button
          id="for-you-fab-search"
          type="button"
          aria-label="New search"
          onClick={handleSearchShortcut}
          className="fixed bottom-[calc(var(--tabbar-h)+var(--safe-b)+1.25rem)] right-4 z-30 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-on-brand shadow-lift transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <SparkleIcon className="size-4" />
          <span>New search</span>
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function timeGreeting(name?: string | null): string {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${part}, ${name.split(' ')[0]}` : part
}

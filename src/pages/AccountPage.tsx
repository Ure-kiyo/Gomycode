import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Sparkles, Settings, Bookmark, Search, Monitor, Sun, Moon } from 'lucide-react'

import { AppHeader } from '@/components/layout/AppHeader'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Switch } from '@/components/ui/Switch'
import { CATEGORY_LABELS, PRICE_PRESETS, ROUTE_PATHS } from '@/constants/app'
import { CATEGORIES } from '@/constants/taxonomy'
import { useCatalogStore, selectProductMap, getProductsById } from '@/store/useCatalogStore'
import { useUserStore } from '@/store/useUserStore'
import { useUIStore } from '@/store/useUIStore'
import { useTheme } from '@/hooks/useTheme'
import type { CategoryId } from '@/types'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/format'

type AccountSection = 'saved' | 'history' | 'preferences' | 'settings'

/**
 * Account — profile, saved products, search history, and preferences.
 *
 * Structured into collapsible sections so the page stays scannable. All data
 * reads from local Zustand stores backed by localStorage — a real backend would
 * just swap the store actions.
 */
export function AccountPage() {
  const [activeSection, setActiveSection] = useState<AccountSection | null>(null)

  const profile = useUserStore((state) => state.profile)
  const savedIds = useUserStore((state) => state.savedProductIds)
  const history = useUserStore((state) => state.searchHistory)
  const preferences = useUserStore((state) => state.preferences)
  const toggleCategory = useUserStore((state) => state.toggleCategory)
  const setNotification = useUserStore((state) => state.setNotification)
  const clearHistory = useUserStore((state) => state.clearSearchHistory)
  const removeEntry = useUserStore((state) => state.removeSearchEntry)
  const reset = useUserStore((state) => state.reset)

  const productMap = useCatalogStore(selectProductMap)
  const savedProducts = getProductsById(productMap, savedIds)

  const pushToast = useUIStore((state) => state.pushToast)
  const { mode, setMode } = useTheme()
  const navigate = useNavigate()

  const toggle = (section: AccountSection) =>
    setActiveSection((prev) => (prev === section ? null : section))

  const handleRerun = (query: string) => {
    navigate(`${ROUTE_PATHS.chat}?q=${encodeURIComponent(query)}&auto=1`)
  }

  const handleLogout = () => {
    reset()
    // Also clear the chat store for a clean slate.
    import('@/store/useChatStore').then(({ useChatStore }) => {
      useChatStore.getState().clear()
    })
    pushToast('Signed out — see you next time!', 'neutral')
    navigate(ROUTE_PATHS.auth)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-sunken">
      <AppHeader />

      {/* Guest banner: shown when user has no profile (guest session) */}
      {!profile && (
        <div className="sticky top-[calc(var(--header-h,56px))] z-10 flex items-center justify-between gap-3 border-b border-brand/20 bg-brand-soft/80 px-4 py-2.5 backdrop-blur-sm">
          <p className="text-xs font-medium text-brand leading-snug">
            Create an account to save your history across devices.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.auth)}
            className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-on-brand shadow-soft transition-all hover:brightness-110"
          >
            Sign up
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* ---------------------------------------------------------------- */}
        {/* Profile hero                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-surface px-4 pb-6 pt-4">
          <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  initials={profile?.avatarInitials ?? '??'}
                  size="lg"
                  className="shadow-soft"
                />
                {/* Edit button overlay */}
                <button
                  id="account-edit-avatar"
                  type="button"
                  aria-label="Edit profile"
                  className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-brand text-on-brand shadow-soft transition-transform hover:scale-110"
                >
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                    <path d="M11.82.18a.6.6 0 0 1 .85 0l3.15 3.15a.6.6 0 0 1 0 .85l-9.5 9.5a.6.6 0 0 1-.29.16l-4 .9a.6.6 0 0 1-.72-.72l.9-4a.6.6 0 0 1 .16-.29l9.45-9.55Z" />
                  </svg>
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-bold tracking-tight text-ink">
                  {profile?.name ?? 'Anonymous Sifter'}
                </h1>
                <p className="truncate text-sm text-ink-muted">
                  {profile?.email ?? 'Not signed in'}
                </p>
                {profile?.memberSince && (
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    Member since {profile.memberSince}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Saved', value: savedIds.length },
                { label: 'Searches', value: history.length },
                { label: 'Categories', value: preferences.categories.length },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-2xl bg-surface-sunken px-2 py-3"
                >
                  <span className="text-xl font-bold text-brand">{value}</span>
                  <span className="mt-0.5 text-[0.6875rem] font-medium text-ink-muted">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl space-y-3 px-4 py-4">
          {/* ---------------------------------------------------------------- */}
          {/* Saved products                                                    */}
          {/* ---------------------------------------------------------------- */}
          <AccordionSection
            id="account-saved-toggle"
            title="Saved products"
            glyph={<Heart className="size-5" />}
            count={savedIds.length}
            isOpen={activeSection === 'saved'}
            onToggle={() => toggle('saved')}
          >
            {savedProducts.length === 0 ? (
              <EmptyState
                compact
                glyph={<Bookmark className="size-6 text-brand" />}
                title="Nothing saved yet"
                description="Tap the heart on any product card to save it here."
              />
            ) : (
              <ProductGrid
                products={savedProducts}
                source="account"
                className="grid grid-cols-2 gap-3"
              />
            )}
          </AccordionSection>

          {/* ---------------------------------------------------------------- */}
          {/* Search history                                                    */}
          {/* ---------------------------------------------------------------- */}
          <AccordionSection
            id="account-history-toggle"
            title="Search history"
            glyph={<Clock className="size-5" />}
            count={history.length}
            isOpen={activeSection === 'history'}
            onToggle={() => toggle('history')}
          >
            {history.length === 0 ? (
              <EmptyState compact glyph={<Search className="size-6 text-brand" />} title="No searches yet" description="Your past queries will appear here." />
            ) : (
              <div className="space-y-1.5">
                {/* Clear all */}
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-ink-subtle">{history.length} searches</p>
                  <button
                    id="account-clear-history"
                    type="button"
                    onClick={() => { clearHistory(); pushToast('History cleared') }}
                    className="text-xs font-medium text-critical underline-offset-2 hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="group flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-soft transition-all hover:shadow-lift"
                  >
                    <Search className="size-4 text-ink-subtle" />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => handleRerun(entry.query)}
                    >
                      <p className="truncate text-sm font-medium text-ink group-hover:text-brand transition-colors">
                        {entry.query}
                      </p>
                      <p className="mt-0.5 text-[0.6875rem] text-ink-subtle">
                        {entry.resultCount} results · {formatRelativeTime(entry.at)}
                        {entry.category && ` · ${CATEGORY_LABELS[entry.category]}`}
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove "${entry.query}" from history`}
                      onClick={() => removeEntry(entry.id)}
                      className="grid size-7 shrink-0 place-items-center rounded-full text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-sunken hover:text-critical"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AccordionSection>

          {/* ---------------------------------------------------------------- */}
          {/* Preferences                                                       */}
          {/* ---------------------------------------------------------------- */}
          <AccordionSection
            id="account-prefs-toggle"
            title="Preferences"
            glyph={<Sparkles className="size-5" />}
            isOpen={activeSection === 'preferences'}
            onToggle={() => toggle('preferences')}
          >
            <div className="space-y-6">
              {/* Category interests */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-subtle">
                  Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = preferences.categories.includes(cat.id as CategoryId)
                    return (
                      <button
                        key={cat.id}
                        id={`pref-cat-${cat.id}`}
                        type="button"
                        onClick={() => toggleCategory(cat.id as CategoryId)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                          isSelected
                            ? 'border-brand bg-brand-soft text-brand'
                            : 'border-line bg-surface text-ink-muted hover:border-brand/40 hover:text-ink',
                        )}
                      >
                        <span aria-hidden>{cat.glyph}</span>
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price range quick presets */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-subtle">
                  Max budget
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_PRESETS.map((preset) => {
                    const isActive = preferences.priceRange.max === preset.max
                    return (
                      <button
                        key={preset.id}
                        id={`pref-price-${preset.id}`}
                        type="button"
                        onClick={() =>
                          useUserStore.getState().setPriceRange({ min: 0, max: preset.max })
                        }
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                          isActive
                            ? 'border-brand bg-brand-soft text-brand'
                            : 'border-line bg-surface text-ink-muted hover:border-brand/40',
                        )}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-subtle">
                  Notifications
                </p>
                <div className="space-y-3">
                  {(
                    [
                      { key: 'priceDrops', label: 'Price drop alerts' },
                      { key: 'restockAlerts', label: 'Back-in-stock alerts' },
                      { key: 'weeklyDigest', label: 'Weekly digest email' },
                    ] as const
                  ).map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-2xl bg-surface p-3 shadow-soft"
                    >
                      <span className="text-sm text-ink">{label}</span>
                      <Switch
                        checked={preferences.notifications[key]}
                        onChange={(val) => setNotification(key, val)}
                        label={label}
                        hideLabel
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* ---------------------------------------------------------------- */}
          {/* Settings                                                          */}
          {/* ---------------------------------------------------------------- */}
          <AccordionSection
            id="account-settings-toggle"
            title="Settings"
            glyph={<Settings className="size-5" />}
            isOpen={activeSection === 'settings'}
            onToggle={() => toggle('settings')}
          >
            <div className="space-y-3">
              {/* Theme */}
              <div className="rounded-2xl bg-surface p-4 shadow-soft">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-subtle">Theme</p>
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      id={`settings-theme-${t}`}
                      type="button"
                      onClick={() => setMode(t)}
                      className={cn(
                        'flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-all',
                        mode === t
                          ? 'border-brand bg-brand-soft text-brand'
                          : 'border-line bg-surface-sunken text-ink-muted hover:border-brand/40',
                      )}
                    >
                      {t === 'system' ? <span className="flex items-center gap-1.5 justify-center"><Monitor className="size-4"/> Auto</span> : t === 'light' ? <span className="flex items-center gap-1.5 justify-center"><Sun className="size-4"/> Light</span> : <span className="flex items-center gap-1.5 justify-center"><Moon className="size-4"/> Dark</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* App version */}
              <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-soft">
                <span className="text-sm text-ink-muted">App version</span>
                <span className="text-sm font-medium text-ink">1.0.0-beta</span>
              </div>

              {/* Log out */}
              <button
                id="account-logout"
                type="button"
                onClick={handleLogout}
                className="w-full rounded-2xl border border-critical/30 bg-surface px-4 py-3.5 text-sm font-semibold text-critical shadow-soft transition-all hover:bg-critical/5 active:scale-[0.98]"
              >
                Sign out
              </button>
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface AccordionSectionProps {
  id: string
  title: string
  glyph: React.ReactNode
  count?: number
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionSection({ id, title, glyph, count, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface shadow-soft">
      <button
        id={id}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-surface-sunken"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-ink-subtle">{glyph}</span>
          <span className="text-[0.9375rem] font-semibold text-ink">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="grid min-w-[1.25rem] place-items-center rounded-full bg-brand-soft px-1.5 py-0.5 text-[0.625rem] font-bold text-brand leading-none">
              {count}
            </span>
          )}
        </div>
        <svg
          viewBox="0 0 24 24"
          className={cn('size-5 text-ink-subtle transition-transform duration-300', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Animated expand/collapse */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="px-4 pb-5 pt-1">{children}</div>
      </div>
    </div>
  )
}

import type { CategoryId, LanguageCode, RouteId, SearchStage } from '@/types'

/** Product brand. Copy is duplicated in index.html's pre-paint theme script. */
export const APP_NAME = 'Sift'
export const APP_TAGLINE = 'Sift through, find what fits'
export const APP_DESCRIPTION =
  'Describe what you need in plain language. Sift searches every store and ranks what actually fits.'

/** Root path for the app — used for router basename + meta tags. */
export const APP_ROOT = '/'

/**
 * Bottom-tab routes. `id` is the stable key stored in navigation state, so
 * reordering or renaming a path never breaks deep links.
 */
export const ROUTES: Record<RouteId, { id: RouteId; path: string; label: string }> = {
  chat: { id: 'chat', path: '/chat', label: 'Chat' },
  forYou: { id: 'forYou', path: '/for-you', label: 'For You' },
  account: { id: 'account', path: '/account', label: 'Account' },
}

/** Rendered order in the bottom tab bar. */
export const TAB_ORDER: RouteId[] = ['chat', 'forYou', 'account']

export const ROUTE_PATHS = {
  root: APP_ROOT,
  auth: '/auth',
  chat: ROUTES.chat.path,
  forYou: ROUTES.forYou.path,
  account: ROUTES.account.path,
} as const

/**
 * Query-string keys. Centralised so link building and parsing never drift
 * apart (e.g. Account → "re-run this search in Chat").
 */
export const QUERY_KEYS = {
  /** Prefill text for the chat composer. */
  prefill: 'q',
  /** Autostart the search without waiting for the user to press send. */
  autoSend: 'auto',
} as const

export const STORAGE_KEYS = {
  theme: 'sift.theme',
  user: 'sift.user',
  chat: 'sift.chat',
  catalog: 'sift.catalog',
  ui: 'sift.ui',
} as const

/** Mock network behaviour, so loading states are actually visible. */
export const MOCK_TIMING = {
  /** Base latency for a search round-trip. */
  search: [700, 1100] as const,
  /** Per-stage dwell time while the assistant "thinks". */
  stage: 420,
  feed: [450, 800] as const,
  product: [120, 260] as const,
  suggest: [90, 160] as const,
} as const

/** Number of stores the mock engine claims to scan. */
export const STORE_COUNT = 12

/**
 * The "AI is searching…" stages shown while a request is in flight.
 *
 * Defined in constants (not in the mock) because the client must render them
 * *before* any response arrives. The mock API returns the same list so a real
 * backend can supply its own.
 */
export const SEARCH_STAGES: ReadonlyArray<{ stage: SearchStage; label: string; detail?: string }> = [
  { stage: 'parsing', label: 'Understanding your request' },
  { stage: 'scanning', label: `Scanning ${STORE_COUNT} stores`, detail: 'prices, stock, delivery' },
  { stage: 'ranking', label: 'Ranking what actually fits', detail: 'value, reviews, fit' },
]

export const PRICE_BOUNDS = { min: 0, max: 5000 } as const
export const PRICE_PRESETS: Array<{ id: string; label: string; max: number }> = [
  { id: 'budget', label: 'Under 50 DA', max: 50 },
  { id: 'value', label: 'Under 250 DA', max: 250 },
  { id: 'mid', label: 'Under 1k DA', max: 1000 },
  { id: 'premium', label: 'Under 2k DA', max: 2000 },
  { id: 'flagship', label: 'No limit', max: PRICE_BOUNDS.max },
]

export const LANGUAGES: Array<{ code: LanguageCode; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
]

/** Query → category/stores shortcuts used by the chat empty state. */
export const STARTER_QUERIES: string[] = [
  'gaming laptop under 1000 DA',
  'noise cancelling headphones for travel',
  'a 4K monitor under 400 DA',
  'running shoes for marathon training',
]

/** Chat copy that lives outside the data layer (it is UI, not mock content). */
export const CHAT_COPY = {
  greeting:
    'Describe what you need in plain language — I sift through every store and rank what actually fits.',
  emptyHint: 'Try naming a budget, a store, or a use case. You can keep refining right here.',
  refinePlaceholder: 'Refine your search…',
  defaultPlaceholder: 'What are you looking for?',
} as const

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  laptops: 'Laptops',
  phones: 'Phones',
  tablets: 'Tablets',
  monitors: 'Monitors',
  audio: 'Audio',
  gaming: 'Gaming',
  cameras: 'Cameras',
  watches: 'Watches',
  kitchen: 'Kitchen',
  furniture: 'Furniture',
  appliances: 'Appliances',
  shoes: 'Shoes',
  outdoor: 'Outdoor',
  bags: 'Bags',
  accessories: 'Accessories',
}

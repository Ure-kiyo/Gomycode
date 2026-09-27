/**
 * Core domain types.
 *
 * These describe the *shape of the data the UI consumes*, deliberately kept
 * independent of the mock implementation so a real backend can be dropped in
 * without touching a single component (see `src/services/api`).
 */

/** Identifiers for the three bottom-tab destinations. */
export type RouteId = 'chat' | 'forYou' | 'account';

export type StoreId =
  | 'amazon'
  | 'bestbuy'
  | 'walmart'
  | 'target'
  | 'ebay'
  | 'newegg'
  | 'bhphoto'
  | 'rei'
  | 'ikea'
  | 'nike'
  | 'sephora'
  | 'wholefoods';

export type CategoryId =
  | 'laptops'
  | 'phones'
  | 'tablets'
  | 'monitors'
  | 'audio'
  | 'gaming'
  | 'cameras'
  | 'watches'
  | 'kitchen'
  | 'furniture'
  | 'appliances'
  | 'shoes'
  | 'outdoor'
  | 'bags'
  | 'accessories';

export interface Store {
  id: StoreId;
  name: string;
  /** Short label used in tight spaces (cards, chips). */
  shortName: string;
  /** Brand colour used for the store badge dot. */
  color: string;
  deliveryDays: [min: number, max: number];
}

export interface Category {
  id: CategoryId;
  name: string;
  /** Emoji glyph — stands in for real imagery in the mock catalogue. */
  glyph: string;
  /** Tailwind gradient classes used to render deterministic product art. */
  art: [from: string, to: string];
  keywords: string[];
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: CategoryId;
  price: number;
  /** Original price when the item is discounted; used for the % off badge. */
  listPrice?: number;
  currency: 'DZD';
  store: StoreId;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  /** Real, working link to a marketplace search/product page */
  referenceUrl?: string;
  /** Short reason why this is a good pick ("Best for gaming", etc) */
  highlight?: string;
  /** Short AI-generated "why this fits" blurb shown in chat + detail. */
  blurb: string;
  specs: Array<{ label: string; value: string }>;
  inStock: boolean;
  freeShipping: boolean;
  tags: string[];
}

/* -------------------------------------------------------------------------- */
/* Chat                                                                       */
/* -------------------------------------------------------------------------- */

export type ChatRole = 'user' | 'assistant';

export type ChatMessageStatus = 'sending' | 'thinking' | 'done' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Rendered copy. Assistant messages are written by the "AI". */
  text: string;
  createdAt: number;
  status: ChatMessageStatus;
  /** Products attached to an assistant message. */
  productIds: string[];
  /** Structured filters the assistant resolved from the conversation. */
  filters?: ResolvedQuery;
  /** Tappable refinements offered under the result set. */
  suggestions?: string[];
  /** Extra assistant context, e.g. the "sources scanned" line. */
  meta?: string;
}

/** The stages the mocked "AI" walks through while it works. */
export type SearchStage = 'parsing' | 'scanning' | 'ranking' | 'done';

export interface SearchProgress {
  stage: SearchStage;
  label: string;
  detail?: string;
}

/* -------------------------------------------------------------------------- */
/* Search / query resolution                                                  */
/* -------------------------------------------------------------------------- */

export interface PriceRange {
  min: number;
  max: number;
}

export type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'reviews';

export interface ResolvedQuery {
  /** The user's raw text, trimmed. */
  raw: string;
  /** Inferred search terms (category + brand + adjectives). */
  terms: string[];
  category?: CategoryId;
  brand?: string;
  store?: StoreId;
  price?: PriceRange;
  minRating?: number;
  minReviews?: number;
  inStockOnly?: boolean;
  freeShippingOnly?: boolean;
  sort: SortKey;
  /** Human-readable summary rendered above the result grid. */
  summary: string;
}

export interface SearchResponse {
  /** Assistant reply text. */
  reply: string;
  products: Product[];
  resolved: ResolvedQuery;
  suggestions: string[];
  meta: string;
  /** Progress trail, so the UI can animate through the "thinking" stages. */
  progress: SearchProgress[];
}

export interface SearchRequest {
  query: string;
  /** Carried forward from the previous turn so "cheaper ones" has context. */
  context?: ResolvedQuery;
  history?: ChatMessage[];
}

/* -------------------------------------------------------------------------- */
/* Personalised feed                                                          */
/* -------------------------------------------------------------------------- */

export type FeedSectionId =
  | 'based-on-search'
  | 'similar-to-saved'
  | 'trending-interests'
  | 'under-budget'
  | 'recently-viewed'
  | 'deals';

export interface FeedSection {
  id: FeedSectionId;
  title: string;
  subtitle?: string;
  /** Decorative glyph for the section header. */
  glyph?: string;
  products: Product[];
}

export interface FeedResponse {
  sections: FeedSection[];
  /** Signals the mock engine used — surfaced in the UI for transparency. */
  rationale: string[];
}

/* -------------------------------------------------------------------------- */
/* User + preferences                                                         */
/* -------------------------------------------------------------------------- */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  memberSince: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de';

export interface Preferences {
  categories: CategoryId[];
  priceRange: PriceRange;
  notifications: {
    priceDrops: boolean;
    restockAlerts: boolean;
    weeklyDigest: boolean;
  };
  theme: ThemePreference;
  language: LanguageCode;
}

/** Everything needed to personalise recommendations. */
export interface PersonalizationSignals {
  searchedCategories: CategoryId[];
  viewedCategories: CategoryId[];
  savedCategories: CategoryId[];
  savedProductIds: string[];
  viewedProductIds: string[];
  recentQueries: string[];
}

/* -------------------------------------------------------------------------- */
/* The API contract (implemented by mock + http)                               */
/* -------------------------------------------------------------------------- */

export interface SiftApi {
  search(req: SearchRequest): Promise<SearchResponse>;
  getFeed(signals: PersonalizationSignals, opts?: { seed?: number }): Promise<FeedResponse>;
  getProduct(id: string): Promise<Product>;
  getProducts(ids: string[]): Promise<Product[]>;
  getSuggestions(partial: string): Promise<string[]>;
  getProfile(): Promise<UserProfile>;
}

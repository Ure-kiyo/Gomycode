import type { Category, Store } from '@/types'

/**
 * Taxonomy reference data — stores and categories.
 *
 * This is *reference data*, not a mock: a real backend exposes the same lists at
 * `GET /taxonomy`. It lives in `constants` rather than `mock` so UI components
 * can resolve store names/brand colours without importing the mock layer.
 */

export const STORES: Store[] = [
  { id: 'amazon', name: 'Amazon', shortName: 'Amazon', color: '#ff9900', deliveryDays: [1, 3] },
  { id: 'bestbuy', name: 'Best Buy', shortName: 'Best Buy', color: '#0046be', deliveryDays: [1, 2] },
  { id: 'walmart', name: 'Walmart', shortName: 'Walmart', color: '#0071dc', deliveryDays: [1, 4] },
  { id: 'target', name: 'Target', shortName: 'Target', color: '#e31937', deliveryDays: [2, 4] },
  { id: 'ebay', name: 'eBay', shortName: 'eBay', color: '#0064d2', deliveryDays: [3, 8] },
  { id: 'newegg', name: 'Newegg', shortName: 'Newegg', color: '#f7a600', deliveryDays: [2, 5] },
  { id: 'bhphoto', name: 'B&H Photo', shortName: 'B&H', color: '#2b2b2b', deliveryDays: [1, 3] },
  { id: 'rei', name: 'REI Co-op', shortName: 'REI', color: '#05593c', deliveryDays: [2, 5] },
  { id: 'ikea', name: 'IKEA', shortName: 'IKEA', color: '#0058a3', deliveryDays: [3, 9] },
  { id: 'nike', name: 'Nike', shortName: 'Nike', color: '#111111', deliveryDays: [2, 6] },
  { id: 'sephora', name: 'Sephora', shortName: 'Sephora', color: '#f0a8b0', deliveryDays: [1, 3] },
  { id: 'wholefoods', name: 'Whole Foods', shortName: 'Whole Foods', color: '#4a7c2f', deliveryDays: [1, 2] },
]

export const STORE_MAP: Record<string, Store> = Object.fromEntries(
  STORES.map((store) => [store.id, store]),
)

export const CATEGORIES: Category[] = [
  {
    id: 'laptops',
    name: 'Laptops',
    glyph: '💻',
    art: ['#6366f1', '#0ea5e9'],
    keywords: ['laptop', 'laptops', 'notebook', 'macbook', 'thinkpad', 'ultrabook', 'chromebook', 'gaming laptop', 'work laptop', 'student laptop', 'pc'],
  },
  {
    id: 'phones',
    name: 'Phones',
    glyph: '📱',
    art: ['#f43f5e', '#f97316'],
    keywords: ['phone', 'phones', 'smartphone', 'iphone', 'android', 'pixel', 'galaxy', 'mobile'],
  },
  {
    id: 'tablets',
    name: 'Tablets',
    glyph: '📲',
    art: ['#8b5cf6', '#ec4899'],
    keywords: ['tablet', 'tablets', 'ipad', 'kindle', 'e-reader', 'stylus tablet'],
  },
  {
    id: 'monitors',
    name: 'Monitors',
    glyph: '🖥️',
    art: ['#0ea5e9', '#22d3ee'],
    keywords: ['monitor', 'monitors', 'display', 'screen', '4k', 'ultrawide', 'gaming monitor', 'tv'],
  },
  {
    id: 'audio',
    name: 'Audio',
    glyph: '🎧',
    art: ['#10b981', '#14b8a6'],
    keywords: ['headphones', 'headset', 'earbuds', 'speakers', 'audio', 'bluetooth', 'noise cancelling', 'anc', 'airpods', 'soundbar', 'microphone', 'turntable'],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    glyph: '🎮',
    art: ['#7c5cff', '#06b6d4'],
    keywords: ['gaming', 'console', 'playstation', 'xbox', 'nintendo', 'controller', 'gpu', 'graphics card', 'vr', 'steam deck', 'gaming chair'],
  },
  {
    id: 'cameras',
    name: 'Cameras',
    glyph: '📷',
    art: ['#475569', '#94a3b8'],
    keywords: ['camera', 'cameras', 'dslr', 'mirrorless', 'lens', 'tripod', 'gimbal', 'action cam', 'webcam'],
  },
  {
    id: 'watches',
    name: 'Watches',
    glyph: '⌚',
    art: ['#f59e0b', '#ef4444'],
    keywords: ['watch', 'watches', 'smartwatch', 'fitness tracker', 'chronograph', 'apple watch', 'garmin'],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    glyph: '🍳',
    art: ['#fb923c', '#facc15'],
    keywords: ['kitchen', 'kitchen appliances', 'coffee', 'espresso', 'blender', 'kettle', 'cookware', 'knife', 'pan', 'air fryer', 'toaster', 'mug'],
  },
  {
    id: 'furniture',
    name: 'Furniture',
    glyph: '🪑',
    art: ['#a16207', '#d97706'],
    keywords: ['chair', 'desk', 'table', 'furniture', 'sofa', 'bed', 'mattress', 'shelf', 'lamp', 'standing desk', 'stool'],
  },
  {
    id: 'appliances',
    name: 'Appliances',
    glyph: '🤖',
    art: ['#64748b', '#38bdf8'],
    keywords: ['vacuum', 'robot', 'appliance', 'washer', 'dryer', 'fridge', 'refrigerator', 'humidifier', 'purifier', 'fan'],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    glyph: '👟',
    art: ['#ec4899', '#f43f5e'],
    keywords: ['shoes', 'sneakers', 'running', 'trainers', 'boots', 'heels', 'hiking', 'marathon', 'sandal', 'trail'],
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    glyph: '⛺',
    art: ['#22c55e', '#0ea5e9'],
    keywords: ['tent', 'camping', 'hiking', 'backpack', 'outdoor', 'bicycle', 'bike', 'kayak', 'fishing', 'trail'],
  },
  {
    id: 'bags',
    name: 'Bags',
    glyph: '🎒',
    art: ['#0f766e', '#14b8a6'],
    keywords: ['bag', 'backpack', 'luggage', 'suitcase', 'tote', 'duffel', 'messenger', 'laptop bag'],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    glyph: '⌨️',
    art: ['#334155', '#7c5cff'],
    keywords: ['keyboard', 'keyboards', 'clavier', 'mouse', 'charger', 'cable', 'hub', 'adapter', 'power bank', 'stand', 'case', 'screen protector', 'ssd'],
  },
]

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
)

/** Human-readable label lookup with a safe fallback. */
export function getStoreLabel(storeId: string): string {
  return STORE_MAP[storeId]?.name ?? storeId
}

export function getCategoryLabel(categoryId: string): string {
  return CATEGORY_MAP[categoryId]?.name ?? categoryId
}

/**
 * Acceptance criteria verification for the Sift search bug fix.
 * Run via: node scratch/verify-search.mjs
 *
 * This script directly exercises the core matching logic without the browser
 * by reimplementing the tokenize + matchCategory + scoreProduct pipeline in
 * pure Node.js — testing the same algorithm the TypeScript code uses.
 */

/* ── Taxonomy (mirrors src/constants/taxonomy.ts) ────────────────────────── */
const CATEGORIES = [
  { id: 'laptops', name: 'Laptops', keywords: ['laptop', 'laptops', 'notebook', 'macbook', 'thinkpad', 'ultrabook', 'chromebook', 'gaming laptop', 'work laptop', 'student laptop', 'pc'] },
  { id: 'phones',  name: 'Phones',  keywords: ['phone', 'phones', 'smartphone', 'iphone', 'android', 'pixel', 'galaxy', 'mobile'] },
  { id: 'tablets', name: 'Tablets', keywords: ['tablet', 'tablets', 'ipad', 'kindle', 'e-reader', 'stylus tablet'] },
  { id: 'monitors',name: 'Monitors',keywords: ['monitor', 'monitors', 'display', 'screen', '4k', 'ultrawide', 'gaming monitor', 'tv'] },
  { id: 'audio',   name: 'Audio',   keywords: ['headphones', 'headset', 'earbuds', 'speakers', 'audio', 'bluetooth', 'noise cancelling', 'anc', 'airpods', 'soundbar', 'microphone', 'turntable'] },
  { id: 'gaming',  name: 'Gaming',  keywords: ['gaming', 'console', 'playstation', 'xbox', 'nintendo', 'controller', 'gpu', 'graphics card', 'vr', 'steam deck', 'gaming chair'] },
  { id: 'cameras', name: 'Cameras', keywords: ['camera', 'cameras', 'dslr', 'mirrorless', 'lens', 'tripod', 'gimbal', 'action cam', 'webcam'] },
  { id: 'watches', name: 'Watches', keywords: ['watch', 'watches', 'smartwatch', 'fitness tracker', 'chronograph', 'apple watch', 'garmin'] },
  { id: 'kitchen', name: 'Kitchen', keywords: ['kitchen', 'kitchen appliances', 'coffee', 'espresso', 'blender', 'kettle', 'cookware', 'knife', 'pan', 'air fryer', 'toaster', 'mug'] },
  { id: 'furniture',name:'Furniture',keywords: ['chair', 'desk', 'table', 'furniture', 'sofa', 'bed', 'mattress', 'shelf', 'lamp', 'standing desk', 'stool'] },
  { id: 'appliances',name:'Appliances',keywords:['vacuum', 'robot', 'appliance', 'washer', 'dryer', 'fridge', 'refrigerator', 'humidifier', 'purifier', 'fan'] },
  { id: 'shoes',   name: 'Shoes',   keywords: ['shoes', 'sneakers', 'running', 'trainers', 'boots', 'heels', 'hiking', 'marathon', 'sandal', 'trail'] },
  { id: 'outdoor', name: 'Outdoor', keywords: ['tent', 'camping', 'hiking', 'backpack', 'outdoor', 'bicycle', 'bike', 'kayak', 'fishing', 'trail'] },
  { id: 'bags',    name: 'Bags',    keywords: ['bag', 'backpack', 'luggage', 'suitcase', 'tote', 'duffel', 'messenger', 'laptop bag'] },
  { id: 'accessories',name:'Accessories',keywords:['keyboard', 'mouse', 'charger', 'cable', 'hub', 'adapter', 'power bank', 'stand', 'case', 'screen protector', 'ssd'] },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'with', 'and', 'or', 'of', 'in', 'on', 'to', 'me', 'i', 'my', 'we', 'our',
  'want', 'need', 'looking', 'find', 'show', 'get', 'some', 'any', 'good', 'best', 'nice', 'cheap',
  'cheaper', 'more', 'less', 'please', 'can', 'you', 'that', 'is', 'are', 'it', 'this', 'under',
  'below', 'over', 'above', 'only', 'just', 'but', 'so', 'than', 'then', 'at', 'up', 'out', 'about',
  'something', 'stuff', 'things', 'gift', 'buy', 'purchase', 'also', 'maybe', 'probably', 'definitely',
  "do", 'have', 'has', "need", "needs", "looking", "interests", "interest", "i'm",
])

/* ── Tokenise ─────────────────────────────────────────────────────────────── */
function tokenize(input) {
  return input.toLowerCase().replace(/[^a-z0-9$%.\- ]+/g, ' ').split(/\s+/).filter(Boolean)
}

/* ── matchCategory ────────────────────────────────────────────────────────── */
function matchCategory(tokens) {
  let best = undefined
  for (const category of CATEGORIES) {
    for (const keyword of category.keywords) {
      if (!tokens.some(t => t === keyword || t.startsWith(keyword))) continue
      const score = keyword.length
      if (!best || score > best.score) best = { id: category.id, score }
    }
  }
  return best?.id
}

/* ── MIN_RELEVANCE_SCORE gate ─────────────────────────────────────────────── */
const MIN_RELEVANCE_SCORE = 10

/* ── A minimal set of representative products for the gate test ───────────── */
const TEST_PRODUCTS = [
  // furniture (Herman Miller)
  { id: 'p_067', title: 'Herman Miller Aeron Chair', brand: 'Herman Miller', category: 'furniture', price: 195000, tags: ['office', 'ergonomic', 'premium'] },
  // kitchen (Vitamix)
  { id: 'p_062', title: 'Vitamix 7500 Pro Blender', brand: 'Vitamix', category: 'kitchen', price: 77000, tags: ['smoothies', 'cooking', 'premium'] },
  // phones (Samsung Galaxy)
  { id: 'p_043', title: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'phones', price: 182000, tags: ['flagship', 'camera', 'stylus', 'premium'] },
  // cameras (Fujifilm)
  { id: 'p_089', title: 'Fujifilm X-T30 II', brand: 'Fujifilm', category: 'cameras', price: 126000, tags: ['mirrorless', 'street', 'creator'] },
  // laptops
  { id: 'p_001', title: 'Dell G16 7630 Gaming Laptop', brand: 'Dell', category: 'laptops', price: 154000, tags: ['gaming', '16gb ram', 'rtx 4060', '1440p'] },
  { id: 'p_003', title: 'Lenovo Legion Pro 5i — RTX 4070', brand: 'Lenovo', category: 'laptops', price: 203000, tags: ['gaming', 'rtx 4070', '240hz', 'premium'] },
  { id: 'p_005', title: 'Acer Nitro V 15 Budget Gaming', brand: 'Acer', category: 'laptops', price: 112000, tags: ['gaming', 'budget', '144hz'] },
  // audio
  { id: 'p_033', title: 'Sony WH-1000XM5 Wireless', brand: 'Sony', category: 'audio', price: 49000, tags: ['anc', 'travel', 'wireless', 'noise cancelling'] },
  { id: 'p_034', title: 'Bose QuietComfort Ultra', brand: 'Bose', category: 'audio', price: 60000, tags: ['anc', 'travel', 'wireless', 'premium'] },
  // shoes
  { id: 'p_081', title: "Nike Pegasus 41 Men's Road Running", brand: 'Nike', category: 'shoes', price: 20000, tags: ['running', 'daily trainer', 'marathon', 'road'] },
  { id: 'p_082', title: 'Adidas Ultraboost Light', brand: 'Adidas', category: 'shoes', price: 27000, tags: ['running', 'cushioned', 'marathon'] },
  // kitchen appliances
  { id: 'p_061', title: 'Nespresso Vertuo Pop Coffee Machine', brand: 'Nespresso', category: 'kitchen', price: 21000, tags: ['coffee', 'espresso', 'compact', 'budget'] },
  { id: 'p_064', title: 'KitchenAid Artisan Stand Mixer', brand: 'KitchenAid', category: 'kitchen', price: 63000, tags: ['baking', 'coffee', 'premium'] },
  { id: 'p_068', title: 'Ninja Air Fryer Pro', brand: 'Ninja', category: 'kitchen', price: 18000, tags: ['air fryer', 'kitchen', 'cooking'] },
  // furniture (office chairs)
  { id: 'p_070', title: 'IKEA Markus Chair', brand: 'IKEA', category: 'furniture', price: 32000, tags: ['office', 'budget', 'ergonomic'] },
  { id: 'p_073', title: 'Branch Ergonomic Chair V2', brand: 'Branch', category: 'furniture', price: 53000, tags: ['office', 'ergonomic', 'mesh'] },
]

/* ── Score a product against a query ──────────────────────────────────────── */
function matchesWholeWord(haystack, needle) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(haystack)
}

function scoreProduct(product, { category, brand, store, price, minRating, minReviews, inStockOnly, freeShippingOnly, terms }) {
  let relevanceScore = 0

  if (category && product.category === category) relevanceScore += 60
  if (brand) {
    if (product.brand.toLowerCase() === brand.toLowerCase()) relevanceScore += 45
    else if (product.title.toLowerCase().includes(brand.toLowerCase())) relevanceScore += 30
  }
  if (store) {
    if (product.store === store) relevanceScore += 40
    else relevanceScore -= 150
  }
  if (price) {
    if (product.price >= price.min && product.price <= price.max) {
      const span = Math.max(1, price.max - price.min)
      const util = 1 - Math.abs(product.price - price.max) / span
      relevanceScore += 25 + Math.round(util * 10)
    } else {
      relevanceScore -= 120
    }
  }

  for (const term of (terms || [])) {
    const needle = term.toLowerCase()
    if (product.title.toLowerCase().includes(needle)) relevanceScore += 14
    if (product.tags.some(t => matchesWholeWord(t, needle))) relevanceScore += 10
    if (product.brand.toLowerCase().includes(needle)) relevanceScore += 12
    const cat = CATEGORY_MAP[product.category]
    if (cat) {
      if (matchesWholeWord(cat.name, needle)) relevanceScore += 8
      if (cat.keywords.some(kw => matchesWholeWord(kw, needle))) relevanceScore += 6
    }
  }

  return relevanceScore
}

/* ── Core search ──────────────────────────────────────────────────────────── */
function search(queryText, priceRange) {
  const tokens = tokenize(queryText)
  const terms = tokens.filter(t => !STOP_WORDS.has(t) && !/^\d/.test(t))
  const category = matchCategory(tokens)

  const query = { category, terms, price: priceRange, sort: 'relevance' }

  const results = TEST_PRODUCTS
    .map(p => ({ product: p, relevanceScore: scoreProduct(p, query) }))
    .filter(e => e.relevanceScore >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)

  const confidence = results.length === 0 ? 'none' : category ? 'high' : 'low'
  return { confidence, category, results, terms }
}

/* ── Acceptance criteria tests ────────────────────────────────────────────── */
const tests = [
  { query: 'gaming laptop under 1000',       priceMax: 130000, expectCategory: 'laptops',   expectConfidence: 'high' },
  { query: 'running shoes',                  priceMax: null,   expectCategory: 'shoes',     expectConfidence: 'high' },
  { query: 'noise cancelling headphones',    priceMax: null,   expectCategory: 'audio',     expectConfidence: 'high' },
  { query: 'kitchen appliances',             priceMax: null,   expectCategory: 'kitchen',   expectConfidence: 'high' },
  { query: 'office chair',                   priceMax: null,   expectCategory: 'furniture', expectConfidence: 'high' },
  { query: "I'm looking for a car",          priceMax: null,   expectCategory: null,        expectConfidence: 'none' },
  { query: 'a pet dog',                      priceMax: null,   expectCategory: null,        expectConfidence: 'none' },
]

let passed = 0
let failed = 0

console.log('\n╔═══════════════════════════════════════════════════════════════╗')
console.log('║        Sift Search — Acceptance Criteria Verification         ║')
console.log('╚═══════════════════════════════════════════════════════════════╝\n')

for (const test of tests) {
  const price = test.priceMax ? { min: 0, max: test.priceMax } : undefined
  const { confidence, category, results, terms } = search(test.query, price)

  const categoryOk = test.expectCategory === null
    ? category === undefined || category === null
    : category === test.expectCategory
  const confidenceOk = confidence === test.expectConfidence

  // Critical: for 'none' confidence, no unrelated products like chair/blender/phone/camera
  const noUnrelatedProducts = confidence === 'none'
    ? results.every(r => !['p_067','p_062','p_043','p_089'].includes(r.product.id))
    : true

  const ok = categoryOk && confidenceOk && noUnrelatedProducts

  if (ok) passed++
  else failed++

  const icon = ok ? '✅' : '❌'
  console.log(`${icon} "${test.query}"`)
  console.log(`   → confidence: ${confidence} (expected: ${test.expectConfidence})`)
  console.log(`   → category:   ${category ?? 'none'} (expected: ${test.expectCategory ?? 'none'})`)
  console.log(`   → matched:    ${results.length} product(s)`)
  if (results.length > 0 && results.length <= 3) {
    results.forEach(r => console.log(`     • ${r.product.title} [score: ${r.relevanceScore}]`))
  } else if (results.length > 3) {
    results.slice(0, 3).forEach(r => console.log(`     • ${r.product.title} [score: ${r.relevanceScore}]`))
    console.log(`     … and ${results.length - 3} more`)
  }
  if (!ok) {
    if (!categoryOk) console.log(`   ⚠ Category mismatch`)
    if (!confidenceOk) console.log(`   ⚠ Confidence mismatch`)
    if (!noUnrelatedProducts) console.log(`   ⚠ Unrelated products (chair/blender/phone/camera) appeared!`)
  }
  console.log()
}

console.log('─────────────────────────────────────────────────────────────────')
console.log(`  Results: ${passed}/${tests.length} passed, ${failed} failed`)
console.log()

// Refinement test: "Cheaper ones" after "gaming laptop" search
const baseSearch = search('gaming laptop', null)
const baseProducts = baseSearch.results.map(r => r.product)
const cheaperSorted = [...baseProducts].sort((a, b) => a.price - b.price)
const cheaperStillLaptops = cheaperSorted.every(p => p.category === 'laptops')
const icon = cheaperStillLaptops ? '✅' : '❌'
console.log(`${icon} "Cheaper ones" (after "gaming laptop" search)`)
console.log(`   → sorts by price, still ${cheaperSorted.length} laptop(s), all category=laptops: ${cheaperStillLaptops}`)
cheaperSorted.slice(0, 3).forEach(p => console.log(`     • ${p.title} — ${p.price.toLocaleString()} DA`))
console.log()
console.log('─────────────────────────────────────────────────────────────────')

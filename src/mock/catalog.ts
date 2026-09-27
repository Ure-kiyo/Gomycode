import { CATEGORIES, CATEGORY_MAP, STORE_MAP, STORES } from '@/constants/taxonomy'

/**
 * Engine-only vocabulary for the mock search implementation.
 *
 * Store/category reference data lives in `@/constants/taxonomy` (shared with the
 * UI); the brand lexicon and stop words are search-implementation details and
 * belong here, behind the data layer.
 */

export { CATEGORIES, CATEGORY_MAP, STORE_MAP, STORES }

/** Brand aliases → canonical name, so "asus zenbook" matches "ASUS Zenbook". */
export const BRANDS: Array<{ canonical: string; aliases: string[] }> = [
  { canonical: 'Apple', aliases: ['apple', 'macbook', 'iphone', 'ipad', 'airpods'] },
  { canonical: 'Dell', aliases: ['dell', 'xps', 'inspiron', 'alienware', 'gseries', 'latitude'] },
  { canonical: 'HP', aliases: ['hp', 'hewlett', 'pavilion', 'omen', 'spectre'] },
  { canonical: 'Lenovo', aliases: ['lenovo', 'thinkpad', 'legion', 'yoga', 'ideapad'] },
  { canonical: 'ASUS', aliases: ['asus', 'zenbook', 'rog', 'tuf', 'vivobook'] },
  { canonical: 'Acer', aliases: ['acer', 'swift', 'predator', 'nitro'] },
  { canonical: 'Samsung', aliases: ['samsung', 'galaxy', 'odyssey'] },
  { canonical: 'Sony', aliases: ['sony', 'wh-1000', 'a7', 'alpha'] },
  { canonical: 'Bose', aliases: ['bose', 'quietcomfort'] },
  { canonical: 'JBL', aliases: ['jbl', 'flip', 'charge'] },
  { canonical: 'Anker', aliases: ['anker', 'soundcore', 'libra', 'eufy'] },
  { canonical: 'Logitech', aliases: ['logitech', 'mx master', 'g pro', 'g502', 'g933'] },
  { canonical: 'LG', aliases: ['lg', 'ultragear', 'gram'] },
  { canonical: 'Google', aliases: ['google', 'pixel', 'nest'] },
  { canonical: 'Microsoft', aliases: ['microsoft', 'surface'] },
  { canonical: 'Nintendo', aliases: ['nintendo', 'switch', 'oled'] },
  { canonical: 'Nike', aliases: ['nike', 'pegasus', 'vomero', 'air max'] },
  { canonical: 'Adidas', aliases: ['adidas', 'ultraboost', 'samba'] },
  { canonical: 'Nikon', aliases: ['nikon', 'z6', 'z50'] },
  { canonical: 'Canon', aliases: ['canon', 'eos', 'r6', 'r50'] },
  { canonical: 'Fujifilm', aliases: ['fujifilm', 'fuji', 'xt30'] },
  { canonical: 'Garmin', aliases: ['garmin', 'forerunner', 'fenix'] },
  { canonical: 'KitchenAid', aliases: ['kitchenaid', 'stand mixer'] },
  { canonical: 'Dyson', aliases: ['dyson', 'v-series', 'airwrap'] },
  { canonical: 'Hydro Flask', aliases: ['hydro flask', 'flask', 'tumbler'] },
  { canonical: 'Yeti', aliases: ['yeti', 'tumbler', 'cooler'] },
  { canonical: 'Herman Miller', aliases: ['herman miller', 'aeron'] },
  { canonical: 'Branch', aliases: ['branch chair', 'branch ergonomic'] },
  { canonical: 'Steelcase', aliases: ['steelcase'] },
  { canonical: 'Secretlab', aliases: ['secretlab', 'titan'] },
  { canonical: 'Crucial', aliases: ['crucial', 'ssd'] },
  { canonical: 'Western Digital', aliases: ['western digital', 'my passport'] },
  { canonical: 'Amazfit', aliases: ['amazfit', 'gts'] },
  { canonical: 'Nothing', aliases: ['nothing phone'] },
  { canonical: 'RØDE', aliases: ['rode'] },
  { canonical: 'Valve', aliases: ['valve', 'steam deck'] },
  { canonical: 'Meta', aliases: ['meta', 'quest'] },
  { canonical: 'OnePlus', aliases: ['oneplus'] },
  { canonical: 'HOKA', aliases: ['hoka', 'clifton'] },
  { canonical: 'Brooks', aliases: ['brooks', 'ghost'] },
  { canonical: 'New Balance', aliases: ['new balance', '1080'] },
  { canonical: 'Asics', aliases: ['asics', 'gel-kayano'] },
  { canonical: 'Salomon', aliases: ['salomon', 'x ultra'] },
  { canonical: 'Osprey', aliases: ['osprey'] },
  { canonical: 'Decathlon', aliases: ['decathlon', 'quechua'] },
  { canonical: 'Uplift', aliases: ['uplift desk'] },
  { canonical: 'AOC', aliases: ['aoc'] },
  { canonical: 'BenQ', aliases: ['benq'] },
  { canonical: 'MSI', aliases: ['msi'] },
]

/** Free-text terms the search engine ignores when matching. */
export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'with', 'and', 'or', 'of', 'in', 'on', 'to', 'me', 'i', 'my', 'we', 'our',
  'want', 'need', 'looking', 'find', 'show', 'get', 'some', 'any', 'good', 'best', 'nice', 'cheap',
  'cheaper', 'more', 'less', 'please', 'can', 'you', 'that', 'is', 'are', 'it', 'this', 'under',
  'below', 'over', 'above', 'only', 'just', 'but', 'so', 'than', 'then', 'at', 'up', 'out', 'about',
  'something', 'stuff', 'things', 'gift', 'buy', 'purchase', 'also', 'maybe', 'probably', 'definitely',
  'do', 'have', 'has', 'need', 'needs', 'looking', 'interests', 'interest',
])

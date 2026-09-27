import type { CategoryId, Product, StoreId } from '@/types'
import { CATEGORY_MAP, STORE_MAP } from '@/constants/taxonomy'

/**
 * The mock catalogue.
 *
 * Authored as a compact tuple array (readable diffs, no repetition) and expanded
 * into `Product` objects by `toProduct()`. A real backend would return the
 * expanded shape over the wire — the UI only ever sees `Product`.
 *
 * tuple = [title, brand, category, price, store, rating, reviews, blurb, specs, tags?]
 *   - `listPrice` (when the item is discounted) is derived from the discount tag.
 */
type ProductSeed = [
  title: string,
  brand: string,
  category: CategoryId,
  price: number,
  store: StoreId,
  rating: number,
  reviews: number,
  blurb: string,
  specs: Array<[string, string]>,
  options?: { listPrice?: number; inStock?: boolean; freeShipping?: boolean; tags?: string[]; referenceUrl?: string; highlight?: string; imageUrl?: string },
]

const SEEDS: ProductSeed[] = [
  /* ---------------------------------------------------------------- laptops */
  ['Dell G16 7630 Gaming Laptop — RTX 4060, 16GB, 512GB SSD', 'Dell', 'laptops', 154000, 'bestbuy', 4.5, 1284, 'Runs 1440p comfortably while staying under a grand-plus budget.', [['CPU', 'i7-13650HX'], ['GPU', 'RTX 4060 8GB'], ['Display', '16" QHD 165Hz'], ['Battery', '6h mixed use']], { listPrice: 203000, tags: ['gaming', '16gb ram', 'rtx 4060', '1440p'] }],
  ['ASUS ROG Straf G614RW — Ryzen 7, RTX 4060, 16GB', 'ASUS', 'laptops', 140000, 'newegg', 4.6, 2140, 'Best spec-per-dollar in the sub-$1k bracket right now.', [['CPU', 'Ryzen 7 7735HS'], ['GPU', 'RTX 4060 8GB'], ['Display', '16" QHD 165Hz'], ['Weight', '5.16 lbs']], { listPrice: 168000, tags: ['gaming', '16gb ram', 'ryzen', 'value pick'] }],
  ['Lenovo Legion Pro 5i 16IRX8 — i7, RTX 4070, 16GB', 'Lenovo', 'laptops', 203000, 'newegg', 4.7, 861, 'Cooler chassis and a genuinely usable 240Hz panel.', [['CPU', 'i7-13700HX'], ['GPU', 'RTX 4070 8GB'], ['Display', '16" WQXGA 240Hz'], ['Storage', '1TB NVMe']], { tags: ['gaming', 'rtx 4070', '240hz', 'premium'] }],
  ['HP Omen 16 — Ryzen 7, RTX 4050, 16GB', 'HP', 'laptops', 119000, 'bestbuy', 4.2, 596, 'Solid all-rounder if you want the gaming look without the premium.', [['CPU', 'Ryzen 7 7840HS'], ['GPU', 'RTX 4050 6GB'], ['Display', '16" QHD 165Hz'], ['Weight', '5.3 lbs']], { freeShipping: true, tags: ['gaming', '16gb ram', 'mid range'] }],
  ['Acer Nitro V 15 — i7, RTX 4050, 16GB', 'Acer', 'laptops', 112000, 'amazon', 4.1, 2103, 'Cheapest way into 1080p 144Hz gaming right now.', [['CPU', 'i7-13620H'], ['GPU', 'RTX 4050 6GB'], ['Display', '15.6" FHD 144Hz']], { listPrice: 140000, tags: ['gaming', 'budget', '144hz'] }],
  ['Apple MacBook Air 13" M3 — 8GB, 256GB', 'Apple', 'laptops', 147000, 'target', 4.8, 3421, 'Silent, cool, and all-day battery. Not a gaming machine.', [['Chip', 'Apple M3'], ['Memory', '8GB unified'], ['Display', '13.6" Liquid Retina'], ['Battery', '18h video']], { tags: ['portable', 'battery', 'student', 'macbook'] }],
  ['Apple MacBook Pro 14" M3 Pro — 18GB, 512GB', 'Apple', 'laptops', 280000, 'bestbuy', 4.9, 1876, 'The default recommendation for creative and dev work.', [['Chip', 'M3 Pro 11-core'], ['Memory', '18GB'], ['Display', '14.2" ProMotion'], ['Ports', '3x Thunderbolt 4']], { tags: ['pro', 'creator', 'premium', 'battery'] }],
  ['Lenovo ThinkPad X1 Carbon Gen 11 — 16GB, 1TB', 'Lenovo', 'laptops', 217000, 'rei', 4.5, 724, 'The keyboard people buy ThinkPads for, in a 2.5 lb chassis.', [['CPU', 'i7-1365U'], ['Memory', '16GB'], ['Weight', '2.58 lbs'], ['Battery', '11h']], { tags: ['business', 'portable', 'keyboard'] }],
  ['Lenovo Yoga Slim 7X — Snapdragon X, 16GB', 'Lenovo', 'laptops', 140000, 'newegg', 4.0, 312, 'Fanless ARM machine — great battery, some app compatibility gaps.', [['Chip', 'Snapdragon X Elite'], ['Memory', '16GB LPDDR5'], ['Battery', '19h'], ['Display', '14.5" OLED']], { tags: ['portable', 'battery', 'arm'] }],
  ['HP Spectre x360 14 — OLED, 16GB', 'HP', 'laptops', 182000, 'bestbuy', 4.4, 448, '2-in-1 with a knockout OLED panel and included pen.', [['CPU', 'i7-1365U'], ['Display', '14" 2.8K OLED'], ['Weight', '3.1 lbs'], ['Stylus', 'Included']], { tags: ['2-in-1', 'oled', 'portable', 'touch'] }],
  ['Google Chromebook Plus 514 — 8GB, 128GB', 'Google', 'laptops', 60000, 'target', 4.1, 967, 'Cheap, light, and enough for browsing, Docs and light coursework.', [['CPU', 'AMD Ryzen 3 7320U'], ['Memory', '8GB'], ['Display', '14" FHD'], ['Weight', '3.2 lbs']], { freeShipping: true, tags: ['budget', 'student', 'school'] }],
  ['Microsoft Surface Laptop 7 — Snapdragon, 16GB', 'Microsoft', 'laptops', 126000, 'bestbuy', 4.0, 289, 'Touch-first Copilot+ PC with an exceptional 120Hz screen.', [['Chip', 'Snapdragon X Elite'], ['Display', '13.8" PixelSense Touch'], ['Memory', '16GB']], { tags: ['portable', 'touch', 'battery'] }],

  /* ----------------------------------------------------------------- phones */
  ['Apple iPhone 15 Pro — 256GB, Natural Titanium', 'Apple', 'phones', 154000, 'target', 4.8, 5210, 'The all-rounder: best-in-class camera, chip and resale value.', [['Chip', 'A17 Pro'], ['Storage', '256GB'], ['Display', '6.1" 120Hz'], ['Battery', '19h video']], { tags: ['flagship', 'camera', '5g'] }],
  ['Google Pixel 8 Pro — 256GB, Obsidian', 'Google', 'phones', 126000, 'target', 4.6, 3104, 'Best computational photography, cleanest Android experience.', [['Chip', 'Tensor G3'], ['Camera', '50MP main + 48MP UW'], ['Battery', '19h']], { tags: ['camera', 'android', 'clean android'] }],
  ['Samsung Galaxy S24 Ultra — 256GB, Titanium', 'Samsung', 'phones', 182000, 'amazon', 4.7, 4093, 'Built-in S Pen and the best zoom on any phone.', [['Chip', 'Snapdragon 8 Gen 3'], ['Zoom', '100x Space Zoom'], ['Battery', '19h']], { listPrice: 199000, tags: ['flagship', 'camera', 'stylus', 'premium'] }],
  ['Nothing Phone (2) — 256GB, Glyph Interface', 'Nothing', 'phones', 84000, 'amazon', 4.3, 1204, 'Distinctive design and a clean build for well under flagship money.', [['Chip', 'Snapdragon 8+ Gen 1'], ['Battery', '18h'], ['Display', '6.7" AMOLED']], { tags: ['design', 'android', 'mid range'] }],
  ['Google Pixel 8a — 128GB, Bay', 'Google', 'phones', 70000, 'bestbuy', 4.4, 782, 'The best-value phone camera you can buy right now.', [['Chip', 'Tensor G3'], ['Camera', '64MP + 13MP UW'], ['Battery', '15h']], { freeShipping: true, tags: ['budget', 'camera', 'android'] }],
  ['Apple iPhone SE (3rd gen) — 128GB', 'Apple', 'phones', 60000, 'target', 4.1, 2931, 'Small, cheap and still gets years of iOS updates.', [['Chip', 'A15 Bionic'], ['Display', '4.7" LCD'], ['Battery', '10h']], { tags: ['budget', 'compact', 'one hand'] }],
  ['Samsung Galaxy A54 5G — 128GB, Awesome Navy', 'Samsung', 'phones', 56000, 'walmart', 4.0, 654, 'Solid mid-range with a genuinely good AMOLED for the money.', [['Chip', 'Exynos 1380'], ['Display', '6.4" 120Hz AMOLED'], ['Battery', '25h']], { tags: ['budget', '5g', 'android'] }],
  ['OnePlus 12 — 256GB, Flowy Emerald', 'OnePlus', 'phones', 112000, 'amazon', 4.5, 903, 'Flagship silicon and a 100W charger at a mid-range price.', [['Chip', 'Snapdragon 8 Gen 3'], ['Charging', '100W SUPERVOOC'], ['Display', '6.82" 120Hz']], { tags: ['fast charging', 'flagship', 'android'] }],

  /* ---------------------------------------------------------------- tablets */
  ['Apple iPad Air 11" M2 — 128GB, Starlight', 'Apple', 'tablets', 84000, 'target', 4.7, 1834, 'The default tablet for reading, notes and streaming.', [['Chip', 'M2'], ['Display', '11" Liquid Retina'], ['Storage', '128GB'], ['Stylus', 'Apple Pencil Pro ready']], { tags: ['tablet', 'study', 'media'] }],
  ['Apple iPad Pro 13" M4 — 256GB, Space Black', 'Apple', 'tablets', 182000, 'bestbuy', 4.9, 612, 'A genuinely laptop-replacement-class tablet.', [['Chip', 'M4'], ['Display', '13" Tandem OLED'], ['Thickness', '5.1 mm']], { tags: ['creator', 'premium', 'pro'] }],
  ['Amazon Kindle Scribe — 16GB, 10.2"', 'Amazon', 'tablets', 53000, 'amazon', 4.4, 5117, 'Best handwriting-to-text experience for note-takers.', [['Display', '10.2" Paperwhite'], ['Storage', '16GB'], ['Stylus', 'Included']], { tags: ['e-reader', 'notes', 'study'] }],
  ['Samsung Galaxy Tab S9 — 256GB, 11"', 'Samsung', 'tablets', 112000, 'bestbuy', 4.5, 823, 'IP68-rated — the only tablet you can take to the pool.', [['Chip', 'Snapdragon 8 Gen 2'], ['Display', '11" 120Hz AMOLED'], ['Rating', 'IP68']], { tags: ['outdoor', 'stylus', 'premium'] }],
  ['Microsoft Surface Go 4 — 64GB', 'Microsoft', 'tablets', 49000, 'newegg', 4.0, 391, 'Cheapest credible Windows tablet if you need desktop apps.', [['Display', '10.9" PixelSense Touch'], ['Storage', '64GB'], ['Weight', '1.1 lbs']], { tags: ['budget', 'windows', 'compact'] }],

  /* --------------------------------------------------------------- monitors */
  ['LG UltraGear 27GP950 — 27" 1440p 240Hz', 'LG', 'monitors', 60000, 'newegg', 4.7, 1420, 'Best all-round gaming monitor at 240Hz.', [['Size', '27"'], ['Resolution', '2560x1440'], ['Refresh', '240Hz'], ['Panel', 'Nano IPS']], { tags: ['gaming', '240hz', '1440p'] }],
  ['Dell UltraSharp U2723QE — 27" 4K USB-C', 'Dell', 'monitors', 67000, 'bestbuy', 4.6, 986, '90W USB-C docking built in — one cable setup.', [['Size', '27"'], ['Resolution', '3840x2160'], ['Refresh', '60Hz'], ['Ports', '90W USB-C']], { freeShipping: true, tags: ['4k', 'usb-c', 'productivity', 'office'] }],
  ['Samsung Odyssey G9 — 49" Ultrawide', 'Samsung', 'monitors', 182000, 'amazon', 4.5, 1043, 'Two 27" QHD panels in one — superb for sim racing and timelines.', [['Size', '49"'], ['Resolution', '5120x1440'], ['Refresh', '240Hz']], { tags: ['ultrawide', 'gaming', 'creator'] }],
  ['Apple Studio Display — 27" 5K, 12MP Center Stage', 'Apple', 'monitors', 224000, 'target', 4.7, 731, 'Superb panel and speakers; priced like a small car.', [['Size', '27"'], ['Resolution', '5120x2880'], ['Camera', '12MP Center Stage']], { tags: ['5k', 'premium', 'mac', 'creator'] }],
  ['ASUS ROG Swift PG27AQDP — 27" 1440p 480Hz', 'ASUS', 'monitors', 126000, 'newegg', 4.6, 402, 'Esports-competitive refresh rates, no motion blur.', [['Size', '27"'], ['Refresh', '480Hz'], ['Resolution', '2560x1440']], { tags: ['esports', '480hz', 'gaming'] }],
  ['AOC CU34G2X — 34" Curved 144Hz', 'AOC', 'monitors', 46000, 'amazon', 4.2, 2210, 'The classic value ultrawide.', [['Size', '34"'], ['Resolution', '2560x1080'], ['Refresh', '144Hz'], ['Curve', '1500R']], { freeShipping: true, tags: ['ultrawide', 'budget', 'gaming'] }],
  ['BenQ PD3220U — 32" 4K Designer Monitor', 'BenQ', 'monitors', 126000, 'bhphoto', 4.5, 388, 'Factory-calibrated with a hotkey that cycles presets.', [['Size', '32"'], ['Resolution', '3840x2160'], ['Colour', '99% sRGB, 3D LUT']], { tags: ['4k', 'creator', 'color accurate'] }],

  /* ----------------------------------------------------------------- audio */
  ['Sony WH-1000XM5 Wireless — Black', 'Sony', 'audio', 49000, 'bestbuy', 4.7, 8642, 'The noise-cancelling benchmark for flights and open offices.', [['ANC', 'Industry-leading'], ['Battery', '30h'], ['Codec', 'LDAC, AAC, SBC'], ['Weight', '250 g']], { freeShipping: true, tags: ['anc', 'travel', 'wireless', 'noise cancelling'] }],
  ['Bose QuietComfort Ultra — White', 'Bose', 'audio', 60000, 'amazon', 4.6, 5120, 'Best-in-class ANC with spatial audio; superb for long flights.', [['ANC', 'Best-in-class'], ['Battery', '24h'], ['Codec', 'aptX Adaptive']], { listPrice: 60000, tags: ['anc', 'travel', 'wireless', 'premium'] }],
  ['Apple AirPods Pro (2nd gen, USB-C)', 'Apple', 'audio', 35000, 'target', 4.6, 14320, 'Seamless on iPhone, and now with USB-C.', [['ANC', 'Adaptive'], ['Battery', '6h + 30h case'], ['Chip', 'H2']], { tags: ['wireless', 'anc', 'apple', 'compact'] }],
  ['Sennheiser Momentum 4 Wireless — Black', 'Sennheiser', 'audio', 35000, 'bhphoto', 4.4, 1587, '60-hour battery and a soundstage that punches above the price.', [['Battery', '60h'], ['Codec', 'aptX Adaptive'], ['Weight', '293 g']], { tags: ['battery', 'wireless', 'travel'] }],
  ['JBL Flip 6 Portable Bluetooth Speaker', 'JBL', 'audio', 18000, 'amazon', 4.5, 9120, 'IP67, loud, and genuinely portable.', [['Water', 'IP67'], ['Battery', '12h'], ['Output', '30W']], { freeShipping: true, tags: ['speaker', 'outdoor', 'portable', 'bluetooth'] }],
  ['Sonos Era 300 — Spatial Audio Speaker', 'Sonos', 'audio', 63000, 'target', 4.3, 1604, 'Six-driver spatial speaker that fills a room.', [['Drivers', '6'], ['Wireless', 'Wi-Fi + AirPlay 2'], ['Voice', 'Alexa, Sonos Voice']], { tags: ['speaker', 'smart home', 'premium'] }],
  ['RØDE NT-USB Mini — USB Condenser Mic', 'RØDE', 'audio', 14000, 'bhphoto', 4.6, 1189, 'Desk-friendly USB mic for streaming and podcasting.', [['Type', 'Condenser'], ['Connection', 'USB-C'], ['Pad', 'Zero-latency monitor']], { freeShipping: true, tags: ['microphone', 'streaming', 'budget'] }],
  ['Audioengine A2+ Wireless Speakers — Walnut', 'Audioengine', 'audio', 35000, 'bhphoto', 4.5, 843, 'The default hi-fi bookshelf pair for a small room.', [['Type', '2-way bookshelf'], ['Wireless', 'Bluetooth 5.0'], ['Power', '50W per channel']], { tags: ['speakers', 'hifi', 'desktop'] }],

  /* ---------------------------------------------------------------- gaming */
  ['Sony PlayStation 5 Slim Disc Edition', 'Sony', 'gaming', 63000, 'amazon', 4.7, 6402, 'Smaller, cheaper, and the same performance as launch.', [['Storage', '1TB SSD'], ['Output', '4K 120fps'], ['Disc', 'Yes']], { tags: ['console', 'playstation', 'living room'] }],
  ['Microsoft Xbox Series X 1TB Console', 'Microsoft', 'gaming', 70000, 'walmart', 4.6, 3987, 'Most powerful console on the market, and great value right now.', [['Storage', '1TB SSD'], ['Output', '4K 120fps'], ['Disc', 'Yes']], { tags: ['console', 'xbox', 'living room'] }],
  ['Nintendo Switch OLED Model — White Joy-Con', 'Nintendo', 'gaming', 49000, 'bestbuy', 4.8, 11240, 'Still the best portable-first console for most people.', [['Screen', '7" OLED'], ['Battery', '4-9h'], ['Storage', '64GB']], { tags: ['console', 'portable', 'nintendo'] }],
  ['Valve Steam Deck OLED 1TB', 'Valve', 'gaming', 91000, 'newegg', 4.6, 1873, 'A whole PC in your hands, with a genuinely great screen.', [['Screen', '7.4" HDR OLED'], ['Battery', '3-12h'], ['Storage', '1TB NVMe']], { tags: ['handheld', 'pc', 'portable'] }],
  ['NVIDIA GeForce RTX 4070 Super 12GB', 'NVIDIA', 'gaming', 84000, 'newegg', 4.7, 1521, 'The 1440p 120fps upgrade that actually matters.', [['VRAM', '12GB GDDR6X'], ['Length', '267 mm'], ['Power', '220W']], { tags: ['gpu', 'graphics card', 'pc', '1440p'] }],
  ['Secretlab Titan Evo 2024 — Charcoal', 'Secretlab', 'gaming', 77000, 'amazon', 4.5, 2044, 'The most-cited gaming chair recommendation for a reason.', [['Recline', '90–165°'], ['Upholstery', 'NEO Hybrid leatherette'], ['Warranty', '5 years']], { listPrice: 91000, tags: ['gaming chair', 'ergonomic', 'office'] }],
  ['Meta Quest 3 128GB — VR Headset', 'Meta', 'gaming', 60000, 'bestbuy', 4.4, 4102, 'Mixed-reality entry point with a much sharper display than Quest 2.', [['Display', '2064x2208 per eye'], ['Storage', '128GB'], ['Battery', '2.5h']], { tags: ['vr', 'mixed reality', 'standalone'] }],
  ['8BitDo Ultimate 2 Wireless Controller', '8BitDo', 'gaming', 10000, 'amazon', 4.6, 2210, 'Tournament-grade sticks, back paddles, and a receiver dongle.', [['Sticks', 'TMR / hall effect'], ['Battery', '30h'], ['Platforms', 'Switch, PC, Android']], { freeShipping: true, tags: ['controller', 'budget', 'accessory'] }],

  /* --------------------------------------------------------------- cameras */
  ['Sony Alpha a7 IV — 33MP Full-Frame Body', 'Sony', 'cameras', 308000, 'bhphoto', 4.8, 1024, 'The hybrid workhorse: stills, video, and superb autofocus.', [['Sensor', '33MP full-frame'], ['Video', '4K 60p 10-bit'], ['Stabilisation', '5-axis IBIS']], { tags: ['mirrorless', 'full frame', 'creator'] }],
  ['Canon EOS R50 Kit — 18-45mm f/3.5-6.3', 'Canon', 'cameras', 95000, 'bestbuy', 4.7, 1583, 'The best entry into a real mirrorless system.', [['Sensor', '24.2MP APS-C'], ['Video', '4K 30p oversampled'], ['Autofocus', 'Dual Pixel AF II']], { tags: ['mirrorless', 'beginner friendly', 'creator'] }],
  ['Fujifilm X-T30 II — 26MP', 'Fujifilm', 'cameras', 126000, 'bhphoto', 4.8, 912, 'Film simulations you can actually shoot JPEG with.', [['Sensor', '26MP APS-C'], ['Film sims', '19 built-in'], ['Weight', '557 g']], { tags: ['mirrorless', 'street', 'creator'] }],
  ['Nikon Z50 II — 20.9MP', 'Nikon', 'cameras', 140000, 'bestbuy', 4.6, 421, 'Best-in-class autofocus tracking at this price.', [['Sensor', '20.9MP APS-C'], ['Video', '4K 60p'], ['Autofocus', 'Subject detection AF']], { tags: ['mirrorless', 'wildlife', 'creator'] }],
  ['GoPro HERO12 Black — 5.3K Action Cam', 'GoPro', 'cameras', 56000, 'amazon', 4.5, 2044, 'Still the most bulletproof action camera.', [['Video', '5.3K 60p'], ['Rating', 'IP68 to 33ft'], ['Stabilisation', 'HyperSmooth 6.0']], { tags: ['action', 'outdoor', 'travel'] }],
  ['DJI Osmo Pocket 3 — Creator Combo', 'DJI', 'cameras', 98000, 'bhphoto', 4.7, 1329, 'Pocket-sized gimbal that quietly replaces a lot of gear.', [['Sensor', '1" CMOS'], ['Gimbal', '3-axis'], ['Video', '4K 120p']], { tags: ['vlogging', 'travel', 'creator'] }],

  /* --------------------------------------------------------------- watches */
  ['Apple Watch Ultra 2 — Natural Titanium, GPS', 'Apple', 'watches', 112000, 'bestbuy', 4.7, 3120, 'Built for the outdoors, and it just as well suits the office.', [['Case', '49mm titanium'], ['Battery', '36–72h'], ['Rating', 'IP6X / EN13319']], { tags: ['outdoor', 'fitness', 'premium', 'apple'] }],
  ['Garmin Forerunner 265 — 46mm', 'Garmin', 'watches', 63000, 'rei', 4.8, 1560, 'The best running watch you can buy, battery included.', [['Battery', '13 days'], ['GPS', 'Multiband'], ['AMOLED', 'Yes']], { tags: ['running', 'fitness', 'gps', 'training'] }],
  ['Amazfit GTS 4 Mini — 42mm', 'Amazfit', 'watches', 21000, 'amazon', 4.0, 2870, 'Cheap fitness tracking with a surprisingly good AMOLED.', [['Battery', '10 days'], ['Display', '1.56" AMOLED'], ['Rating', '5ATM']], { freeShipping: true, tags: ['budget', 'fitness'] }],
  ['Samsung Galaxy Watch 6 Classic — 47mm', 'Samsung', 'watches', 46000, 'bestbuy', 4.3, 1042, 'Rotating bezel, clean Wear OS experience.', [['Case', '47mm steel'], ['Battery', '40h'], ['Display', '1.5" Super AMOLED']], { tags: ['fitness', 'android', 'business'] }],

  /* --------------------------------------------------------------- kitchen */
  ['Nespresso Vertuo Pop — Matte Black', 'Nespresso', 'kitchen', 21000, 'amazon', 4.4, 6410, 'One-button capsules and a genuinely tiny footprint.', [['Pressure', '19 bar'], ['Water tank', '1L'], ['Heat up', '30s']], { freeShipping: true, tags: ['coffee', 'espresso', 'compact', 'budget'] }],
  ['KitchenAid Artisan Stand Mixer — 5QT, Poppy Red', 'KitchenAid', 'kitchen', 63000, 'target', 4.8, 3120, 'The one everyone copies and none match.', [['Capacity', '5 qt'], ['Power', '325W'], ['Attachments', '11 included']], { tags: ['baking', 'coffee', 'premium'] }],
  ['Dyson Airwrap Complete Long — Nickel/Blue', 'Dyson', 'kitchen', 77000, 'sephora', 4.5, 1893, 'Curly, straight and dry with one attachment set.', [['Attachments', '6'], ['Heat', 'Cool shot'], ['Weight', '1.5 lbs']], { tags: ['hair', 'styling', 'premium', 'gift'] }],
  ['Vitamix 7500 Pro Blender — Graphite', 'Vitamix', 'kitchen', 77000, 'wholefoods', 4.8, 1620, 'The blender other blenders get measured against.', [['Power', '2.2 hp'], ['Speed', '10 variable'], ['Warranty', '10 years']], { tags: ['smoothies', 'cooking', 'premium'] }],
  ['Lodge Cast Iron Skillet — 12"', 'Lodge', 'kitchen', 5600, 'amazon', 4.9, 12043, 'A lifetime tool for the price of a takeout order.', [['Diameter', '12"'], ['Weight', '4.5 lbs'], ['Oven safe', 'To 500°F']], { freeShipping: true, tags: ['cooking', 'budget', 'durable'] }],
  ['Hydro Flask Wide Mouth — 32oz, Denim', 'Hydro Flask', 'kitchen', 6300, 'rei', 4.7, 8930, 'Keeps ice cold for 24 hours, guaranteed.', [['Capacity', '32 oz'], ['Cold', '24h'], ['Hot', '12h']], { tags: ['water bottle', 'outdoor', 'durable'] }],
  ['Ninja Air Fryer Pro — 6QT, Black', 'Ninja', 'kitchen', 18000, 'walmart', 4.7, 14020, 'The one that made air fryers mainstream.', [['Capacity', '6 qt'], ['Programs', '9'], ['Dishwasher safe', 'Basket']], { freeShipping: true, tags: ['air fryer', 'kitchen', 'cooking'] }],
  ['Breville Barista Express Impress — Stainless', 'Breville', 'kitchen', 126000, 'amazon', 4.8, 3120, 'Integrated burr grinder plus assisted tamping.', [['Grinder', 'Integrated burr'], ['Pump', '15 bar'], ['Heating', 'PID']], { tags: ['coffee', 'espresso', 'premium', 'barista'] }],

  /* ------------------------------------------------------------- furniture */
  ['Herman Miller Aeron Chair — Size B, Graphite', 'Herman Miller', 'furniture', 195000, 'amazon', 4.8, 3211, 'The benchmark ergonomic chair, and worth it if you sit all day.', [['Size', 'B / medium'], ['PostureFit', 'SL'], ['Warranty', '12 years']], { tags: ['office', 'ergonomic', 'premium'] }],
  ['Secretlab Titan Evo — Charcoal', 'Secretlab', 'furniture', 77000, 'newegg', 4.5, 1884, 'Better lumbar support than most $1k chairs.', [['Recline', '90–165°'], ['Warranty', '5 years']], { tags: ['gaming chair', 'office', 'ergonomic'] }],
  ['IKEA Bekant Sit/Stand Desk — 60x30"', 'IKEA', 'furniture', 77000, 'ikea', 4.3, 6201, 'The sit-stand desk that set the standard.', [['Width', '60"'], ['Lift range', '29"–55"'], ['Frame', 'Bezgovy steel']], { tags: ['desk', 'office', 'standing desk'] }],
  ['IKEA Markus Chair — Black', 'IKEA', 'furniture', 32000, 'ikea', 4.4, 9182, 'The $200 ergonomic mesh classic.', [['Mesh', 'Synthetic mesh'], ['Max load', '286 lbs']], { tags: ['office', 'budget', 'ergonomic'] }],
  ['Philips Hue Play Gradient Lightstrip — 3-Pack', 'Philips', 'furniture', 31000, 'bestbuy', 4.4, 3120, 'Ambient backlighting that syncs with what you watch.', [['Zones', '3'], ['Length', '2m each'], ['Works with', 'Hue app, Alexa']], { tags: ['smart home', 'ambient', 'rgb'] }],
  ['Helix Midnight Hybrid Mattress — Queen', 'Helix', 'furniture', 182000, 'amazon', 4.5, 7420, 'Pressure-mapping that suits most sleepers.', [['Size', 'Queen'], ['Firmness', 'Medium (6/10)'], ['Trial', '100 nights']], { tags: ['mattress', 'sleep', 'bed'] }],
  ['Branch Ergonomic Chair V2 — Slate', 'Branch', 'furniture', 53000, 'wholefoods', 4.4, 9210, 'Supportive mesh mid-back with real lumbar flex.', [['Back', '5D mesh'], ['Warranty', '7 years']], { tags: ['office', 'ergonomic', 'mesh'] }],
  ['Uplift V2 Standing Desk — 48x30"', 'Uplift', 'furniture', 105000, 'amazon', 4.6, 2104, 'Rock-solid lift and a top-mounted control panel.', [['Width', '48"'], ['Capacity', '355 lbs'], ['Warranty', '10 years']], { tags: ['desk', 'standing desk', 'office'] }],

  /* ------------------------------------------------------------ appliances */
  ['Dyson V15 Detect Cordless Vacuum', 'Dyson', 'appliances', 105000, 'bestbuy', 4.7, 4210, 'Laser dust detection on hard floors is genuinely useful.', [['Runtime', '60 min'], ['Bin', '0.76L']], { tags: ['cleaning', 'premium', 'cordless'] }],
  ['iRobot Roomba j9+ Self-Emptying Robot Vacuum', 'iRobot', 'appliances', 77000, 'amazon', 4.4, 3120, 'Maps rooms properly and empties itself for a month.', [['Mapping', 'LiDAR'], ['Bin', 'Auto-empty base']], { tags: ['cleaning', 'robot', 'smart home'] }],
  ['Ninja Foodi Air Fryer Oven — 8QT', 'Ninja', 'appliances', 28000, 'walmart', 4.7, 8201, 'Air fryer, toaster oven and dehydrator in one box.', [['Capacity', '8 qt'], ['Functions', '8']], { freeShipping: true, tags: ['kitchen', 'cooking', 'air fryer'] }],
  ['Whirlpool WED8500C Dryer — 8.4 cu ft', 'Whirlpool', 'appliances', 126000, 'walmart', 4.2, 1204, 'Large-capacity heat-pump dryer that runs quiet.', [['Capacity', '8.4 cu ft'], ['Heat pump', 'Yes']], { tags: ['laundry', 'appliance'] }],
  ['Levoit Core 400S Air Purifier — White', 'Levoit', 'appliances', 26000, 'amazon', 4.4, 6420, 'Covers a large room and stays quiet on auto.', [['Coverage', 'up to 1,500 sq ft'], ['Noise', '24 dB on low']], { tags: ['air quality', 'health', 'bedroom'] }],
  ['Frigidaire Gallery French Door — 27 cu ft', 'Frigidaire', 'appliances', 238000, 'bestbuy', 4.3, 812, 'Full-width pantry and a properly useful layout.', [['Capacity', '27 cu ft'], ['Finish', 'Fingerprint-resistant steel']], { tags: ['kitchen', 'appliance', 'premium'] }],

  /* ----------------------------------------------------------------- shoes */
  ['Nike Pegasus 41 — Men\'s, Road Running', 'Nike', 'shoes', 20000, 'nike', 4.5, 4210, 'The dependable daily trainer most run logs are built on.', [['Drop', '8 mm'], ['Weight', '8.4 oz'], ['Stack', '37/45 mm']], { tags: ['running', 'daily trainer', 'marathon', 'road'] }],
  ['Adidas Ultraboost Light — Men\'s', 'Adidas', 'shoes', 27000, 'amazon', 4.6, 3120, 'Best all-round road shoe if you want maximum energy return.', [['Drop', '8 mm'], ['Weight', '8.9 oz']], { tags: ['running', 'cushioned', 'marathon'] }],
  ['Nike Air Zoom Vomero 5 — Men\'s', 'Nike', 'shoes', 22000, 'nike', 4.4, 1840, 'Genuinely comfortable for walking miles and long runs.', [['Drop', '10 mm'], ['Weight', '9.9 oz']], { tags: ['running', 'cushioned', 'walking'] }],
  ['HOKA Clifton 10 — Men\'s', 'Hoka', 'shoes', 20000, 'amazon', 4.7, 2210, 'Maximal cushioning that still feels fast.', [['Drop', '5 mm'], ['Weight', '9.1 oz']], { tags: ['running', 'cushioned', 'marathon', 'recovery'] }],
  ['Brooks Ghost 16 — Men\'s', 'Brooks', 'shoes', 20000, 'rei', 4.6, 3120, 'Neutral, durable and endlessly recommended by physios.', [['Drop', '12 mm'], ['Weight', '9.3 oz']], { tags: ['running', 'neutral', 'marathon'] }],
  ['Salomon X Ultra 5 — Trail Running', 'Salomon', 'shoes', 26000, 'rei', 4.5, 812, 'Grippy outsole and a rock plate for technical terrain.', [['Drop', '6 mm'], ['Outsole', 'Contagrip'], ['Weight', '8.8 oz']], { tags: ['trail', 'outdoor', 'running'] }],
  ['New Balance 1080v14 — Men\'s', 'New Balance', 'shoes', 21000, 'amazon', 4.4, 1840, 'Roomy toe box with plush cushioning for high-mileage days.', [['Drop', '8 mm'], ['Width', '2E']], { tags: ['running', 'cushioned', 'wide fit'] }],
  ['Asics Gel-Kayano 31 — Men\'s', 'Asics', 'shoes', 22000, 'amazon', 4.5, 2410, 'Built-in gel support for high-mileage runners.', [['Drop', '10 mm'], ['Support', 'Structured']], { tags: ['running', 'support', 'pronation'] }],

  /* --------------------------------------------------------------- outdoor */
  ['REI Half Dome 2 Plus Tent — 2P', 'REI', 'outdoor', 70000, 'rei', 4.6, 812, 'Two doors and near-vertical walls for two real adults.', [['Sleeps', '2'], ['Weight', '3 lb 5 oz'], ['Packed', '17" x 7"']], { tags: ['camping', 'backpacking', 'hiking'] }],
  ['Osprey Atmos AG 65 — Backpack', 'Osprey', 'outdoor', 48000, 'rei', 4.8, 1420, 'The best full-length hiking pack on the market.', [['Capacity', '65L'], ['Weight', '4.4 lbs'], ['Frame', 'Anti-Gravity']], { tags: ['hiking', 'backpack', 'camping'] }],
  ['Garmin Edge 1040 Solar — Cycling Computer', 'Garmin', 'outdoor', 98000, 'rei', 4.7, 640, 'Solar power means you can forget the charger mid-ride.', [['Battery', 'Up to 50h solar'], ['Maps', 'Full color turn-by-turn']], { tags: ['cycling', 'bike', 'gps'] }],
  ['Coleman Classic Propane Stove', 'Coleman', 'outdoor', 5600, 'walmart', 4.3, 3210, 'Reliable, cheap, and a weekend staple for decades.', [['Burners', '1'], ['Output', '9,500 BTU']], { freeShipping: true, tags: ['camping', 'budget', 'cooking'] }],
  ['Yeti Rambler 20oz Tumbler — Seafoam', 'Yeti', 'outdoor', 4900, 'amazon', 4.7, 8420, 'Double-wall steel that has survived a lot of trucks.', [['Capacity', '20 oz'], ['Insulation', 'Double-wall vacuum']], { tags: ['outdoor', 'durable', 'drinkware'] }],
  ['Decathlon Quechua MH500 Hiking Shoes', 'Decathlon', 'outdoor', 11000, 'rei', 4.1, 1420, 'Stiff, grippy and cheap — great value for rough trails.', [['Drop', '8 mm'], ['Outsole', 'Contagrip rubber']], { tags: ['trail', 'budget', 'hiking', 'shoes'] }],

  /* ------------------------------------------------------------------ bags */
  ['Osprey Farpoint 40 — Travel Backpack', 'Osprey', 'bags', 31000, 'rei', 4.7, 2043, 'Carry-on sized, opens flat, and built like a tank.', [['Capacity', '40L'], ['Laptop', '16"'], ['Weight', '3.1 lbs']], { tags: ['travel', 'backpack', 'laptop bag'] }],
  ['Peak Design Travel Tripod (Aluminum)', 'Peak Design', 'bags', 53000, 'bhphoto', 4.6, 1420, 'The most compact travel tripod that is actually stable.', [['Packed', '12.9"'], ['Payload', '20 lbs']], { tags: ['travel', 'photography', 'creator'] }],
  ['Away Carry-On Aluminum — Silver', 'Away', 'bags', 69000, 'amazon', 4.5, 4210, 'Hard-shell protection with a battery-free handle.', [['Size', 'Carry-on'], ['Warranty', 'Lifetime']], { tags: ['travel', 'luggage', 'premium'] }],
  ['Herschel Heritage Backpack — Natural', 'Herschel', 'bags', 20000, 'amazon', 4.6, 3120, 'The classic laptop backpack for school and work.', [['Laptop', '15"'], ['Volume', '25L']], { tags: ['backpack', 'student', 'daily'] }],
  ['Samsonite Tectonic 2 Spinner Set', 'Samsonite', 'bags', 46000, 'amazon', 4.3, 1024, 'Two suitcases that survive checked-bag roulette.', [['Pieces', '2'], ['Wheels', 'Spinner']], { tags: ['travel', 'luggage'] }],

  /* ------------------------------------------------------------ accessories */
  ['Keychron K2 Pro QMK Wireless Mechanical Keyboard', 'Keychron', 'accessories', 15000, 'amazon', 4.7, 4210, 'Mac/Windows layout, hot-swap switches, great acoustics.', [['Layout', '75%'], ['Switches', 'Gateron G Pro brown'], ['Battery', '4000mAh']], { freeShipping: true, tags: ['keyboard', 'mechanical', 'productivity', 'clavier'], referenceUrl: 'https://www.amazon.com/s?k=keychron+k2+pro', highlight: 'Best for enthusiasts', imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600' }],
  ['Logitech MX Keys Mini Wireless Keyboard', 'Logitech', 'accessories', 13000, 'bestbuy', 4.8, 8530, 'Compact, perfect typing feel for office work, connects up to 3 devices.', [['Layout', 'Compact'], ['Switches', 'Membrane / Scissor'], ['Battery', 'Up to 5 months']], { tags: ['keyboard', 'wireless', 'productivity', 'clavier', 'office'], referenceUrl: 'https://www.amazon.com/s?k=logitech+mx+keys+mini', highlight: 'Best for office typing', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600' }],
  ['Razer Huntsman Mini 60% Gaming Keyboard', 'Razer', 'accessories', 16000, 'amazon', 4.6, 5210, 'Fast optical switches in a tiny footprint for competitive gaming.', [['Layout', '60%'], ['Switches', 'Razer Linear Optical'], ['RGB', 'Chroma RGB']], { tags: ['keyboard', 'gaming', 'mechanical', 'clavier'], referenceUrl: 'https://www.amazon.com/s?k=razer+huntsman+mini', highlight: 'Best for gaming', imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600' }],
  ['Redragon K552 Mechanical Gaming Keyboard', 'Redragon', 'accessories', 5000, 'newegg', 4.5, 12430, 'Affordable and loud mechanical clickiness. Great value.', [['Layout', 'TKL (87 Keys)'], ['Switches', 'Outemu Blue'], ['Lighting', 'Red LED']], { tags: ['keyboard', 'mechanical', 'budget', 'clavier', 'gaming'], referenceUrl: 'https://www.amazon.com/s?k=redragon+k552', highlight: 'Best budget pick', imageUrl: 'https://images.unsplash.com/photo-1595044426077-d36d9236d57a?auto=format&fit=crop&w=600' }],
  ['Logitech MX Master 3S Wireless Mouse — Graphite', 'Logitech', 'accessories', 14000, 'bestbuy', 4.8, 8210, 'The productivity mouse benchmark, with an 8K sensor.', [['Sensor', '8,000 DPI'], ['Battery', '70 days'], ['Multi-device', '3 devices']], { tags: ['mouse', 'productivity', 'wireless'] }],
  ['Anker 737 Power Bank (24K, 140W)', 'Anker', 'accessories', 21000, 'amazon', 4.5, 3120, 'Enough juice to charge a laptop and two phones.', [['Capacity', '24,000mAh'], ['Output', '140W USB-C']], { tags: ['charger', 'travel', 'power bank'] }],
  ['Crucial X4 Pro Portable SSD — 2TB', 'Crucial', 'accessories', 24000, 'newegg', 4.7, 4210, 'Blazing fast and small enough to always be in the bag.', [['Capacity', '2TB'], ['Read', '4,000 MB/s'], ['Rating', 'IP55']], { tags: ['ssd', 'storage', 'travel'] }],
  ['Western Digital My Passport SSD — 1TB', 'Western Digital', 'accessories', 11000, 'amazon', 4.3, 6210, 'Cheap, fast and pocketable backup storage.', [['Capacity', '1TB'], ['Read', '1,050 MB/s']], { tags: ['storage', 'backup', 'budget'] }],
  ['Belkin BoostCharge Pro 3-in-1 MagSafe Stand', 'Belkin', 'accessories', 21000, 'bestbuy', 4.4, 1620, 'Charges phone, watch and AirPods at once.', [['Charging', '15W + 5W + 3W'], ['Cable', '3ft braided']], { tags: ['charger', 'apple', 'desk'] }],
  ['Anker 575 USB-C Docking Station (12-in-1)', 'Anker', 'accessories', 35000, 'newegg', 4.4, 920, 'One cable to run the whole desk — dual display out.', [['Ports', '12'], ['Displays', 'Dual 4K'], ['Power supply', '85W']], { tags: ['dock', 'productivity', 'office'] }],
  ['Elgato Wave:3 — USB Microphone', 'Elgato', 'accessories', 21000, 'bhphoto', 4.5, 1120, 'Clip-on cardioid mic for streaming and calls.', [['Pattern', 'Cardioid'], ['Connection', 'USB-C']], { tags: ['microphone', 'streaming'] }],
]

/** Keywords matched to each product seed for real Unsplash imagery. */
const IMAGE_KEYWORDS: string[] = [
  // laptops (indices 0–11)
  'dell gaming laptop computer',        // Dell G16
  'asus rog gaming laptop',             // ASUS ROG
  'lenovo legion gaming laptop',        // Lenovo Legion Pro
  'hp omen gaming laptop',              // HP Omen
  'acer nitro gaming laptop',           // Acer Nitro
  'apple macbook air laptop',           // MacBook Air M3
  'apple macbook pro laptop',           // MacBook Pro 14
  'lenovo thinkpad laptop business',    // ThinkPad X1
  'lenovo yoga laptop slim',            // Lenovo Yoga
  'hp spectre laptop oled',             // HP Spectre
  'google chromebook laptop',           // Chromebook
  'microsoft surface laptop',           // Surface Laptop 7
  // phones (12–20)
  'iphone 15 pro smartphone titanium',  // iPhone 15 Pro
  'google pixel 8 pro smartphone',      // Pixel 8 Pro
  'samsung galaxy s24 ultra phone',     // Galaxy S24 Ultra
  'nothing phone design smartphone',    // Nothing Phone
  'google pixel smartphone android',    // Pixel 8a
  'iphone se compact smartphone',       // iPhone SE
  'samsung galaxy android smartphone',  // Galaxy A54
  'oneplus flagship smartphone green',  // OnePlus 12
  // tablets (21–25)
  'apple ipad air tablet',              // iPad Air M2
  'apple ipad pro tablet oled',         // iPad Pro M4
  'amazon kindle tablet e-reader',      // Kindle Scribe
  'samsung galaxy tab android tablet',  // Galaxy Tab S9
  'microsoft surface go tablet windows',// Surface Go 4
  // monitors (26–32)
  'gaming monitor display setup desk',  // LG UltraGear
  'dell ultrasharp 4k monitor desk',    // Dell U2723QE
  'samsung ultrawide curved monitor',   // Odyssey G9
  'apple studio display monitor',       // Apple Studio Display
  'asus rog monitor gaming display',    // ASUS ROG Swift
  'ultrawide curved computer monitor',  // AOC CU34
  'benq professional monitor creator',  // BenQ PD3220
  // audio (33–40)
  'sony wh1000xm5 headphones wireless', // Sony XM5
  'bose quietcomfort headphones white', // Bose QC Ultra
  'apple airpods pro earbuds',          // AirPods Pro
  'sennheiser wireless headphones',     // Momentum 4
  'jbl portable bluetooth speaker',     // JBL Flip 6
  'sonos speaker wireless home audio',  // Sonos Era 300
  'rode usb microphone podcast',        // RØDE NT-USB Mini
  'audioengine bookshelf speakers',     // Audioengine A2+
  // gaming (41–47)
  'sony playstation 5 console gaming',  // PS5 Slim
  'xbox series x gaming console',       // Xbox Series X
  'nintendo switch oled console',       // Switch OLED
  'steam deck handheld gaming pc',      // Steam Deck
  'nvidia rtx graphics card gpu',       // RTX 4070 Super
  'secretlab gaming chair ergonomic',   // Secretlab Titan
  'meta quest vr headset virtual reality',// Quest 3
  // 8BitDo Controller (index 48)
  'gaming controller wireless gamepad',
  // cameras (49–54)
  'sony alpha mirrorless camera',       // a7 IV
  'canon eos mirrorless camera beginner',// R50
  'fujifilm xt30 retro mirrorless camera',// X-T30 II
  'nikon mirrorless camera dslr',       // Z50 II
  'gopro action camera outdoor',        // HERO12
  'dji osmo pocket camera gimbal',      // Osmo Pocket 3
  // watches (55–58)
  'apple watch ultra smartwatch',       // Watch Ultra 2
  'garmin forerunner running gps watch',// Forerunner 265
  'amazfit smartwatch fitness',         // Amazfit GTS
  'samsung galaxy watch smartwatch',    // Galaxy Watch 6
  // kitchen (59–66)
  'nespresso coffee machine espresso',  // Nespresso Vertuo
  'kitchenaid stand mixer red baking',  // KitchenAid Artisan
  'dyson airwrap hair styling tool',    // Dyson Airwrap
  'vitamix blender kitchen countertop', // Vitamix 7500
  'cast iron skillet cooking kitchen',  // Lodge Skillet
  'hydro flask water bottle insulated', // Hydro Flask
  'ninja air fryer kitchen appliance',  // Ninja Air Fryer
  'breville espresso machine barista',  // Breville Barista
  // furniture (67–74)
  'herman miller aeron office chair ergonomic',// Herman Miller
  'secretlab titan gaming chair black', // Secretlab (furniture)
  'ikea standing desk adjustable',      // IKEA Bekant
  'ikea office chair mesh ergonomic',   // IKEA Markus
  'philips hue smart led lightstrip rgb',// Philips Hue
  'mattress bedroom sleep queen',       // Helix Mattress
  'branch ergonomic mesh office chair', // Branch Chair
  'uplift standing desk workspace',     // Uplift Desk
  // appliances (75–80)
  'dyson cordless vacuum cleaner',      // Dyson V15
  'irobot roomba robot vacuum cleaner', // Roomba j9+
  'ninja oven air fryer toaster',       // Ninja Foodi
  'washing machine laundry dryer',      // Whirlpool Dryer
  'air purifier white bedroom clean',   // Levoit Core
  'french door refrigerator stainless kitchen',// Frigidaire
  // shoes (81–88)
  'nike pegasus running shoes road',    // Nike Pegasus
  'adidas ultraboost running sneakers', // Ultraboost
  'nike vomero running shoes',          // Air Zoom Vomero
  'hoka clifton running shoes cushion', // HOKA Clifton
  'brooks ghost running shoes neutral', // Brooks Ghost
  'salomon trail running shoes outdoor',// Salomon X Ultra
  'new balance running shoes wide',     // NB 1080v14
  'asics gel kayano running support',   // Asics Kayano
  // outdoor (89–94)
  'tent camping outdoor backpacking',   // REI Half Dome
  'osprey hiking backpack trail',       // Osprey Atmos
  'garmin cycling computer bike gps',   // Edge 1040
  'camping stove propane outdoor',      // Coleman Stove
  'yeti tumbler insulated drinkware',   // Yeti Rambler
  'hiking trail shoes outdoor',         // Decathlon
  // bags (95–99)
  'osprey travel backpack carry on',    // Farpoint 40
  'photography travel tripod aluminum', // Peak Design Tripod
  'away luggage carry on hardshell silver',// Away Carry-On
  'herschel backpack daily student',    // Herschel Heritage
  'samsonite luggage travel suitcase',  // Samsonite
  // accessories (100–110)
  '', // Keychron K2 Pro (uses custom imageUrl)
  '', // Logitech MX Keys Mini (uses custom imageUrl)
  '', // Razer Huntsman Mini (uses custom imageUrl)
  '', // Redragon K552 (uses custom imageUrl)
  'logitech mx master wireless mouse',  // MX Master 3S
  'anker power bank portable charger',  // Anker 737
  'portable ssd external drive',        // Crucial X4 Pro
  'western digital passport ssd',       // WD Passport
  'belkin magsafe wireless charger',    // Belkin 3-in-1
  'anker usb hub docking station',      // Anker 575
  'elgato wave microphone streaming',   // Elgato Wave:3
]

function getImageUrl(index: number, id: string): string {
  const keyword = IMAGE_KEYWORDS[index]
  if (keyword) {
    // Generate a highly relevant AI product photo based on the keyword
    const encoded = encodeURIComponent(keyword + ' product photo, studio lighting, high quality, plain background')
    return `https://image.pollinations.ai/prompt/${encoded}?width=600&height=600&nologo=true`
  }
  return `https://picsum.photos/seed/${id}/600/600`
}

function toProduct(seed: ProductSeed, index: number): Product {
  const [title, brand, category, price, store, rating, reviewCount, blurb, specs, options] = seed
  const id = `p_${String(index + 1).padStart(3, '0')}`
  const { listPrice, inStock = true, freeShipping = false, tags = [], referenceUrl, highlight, imageUrl } = options ?? {}

  return {
    id,
    title,
    brand,
    category,
    price,
    listPrice,
    currency: 'DZD',
    store,
    rating,
    reviewCount,
    blurb,
    specs: specs.map(([label, value]) => ({ label, value })),
    inStock,
    freeShipping,
    tags,
    imageUrl: imageUrl ?? getImageUrl(index, id),
    referenceUrl,
    highlight,
  }
}

export const PRODUCTS: Product[] = SEEDS.map(toProduct)

export const PRODUCT_MAP: Map<string, Product> = new Map(PRODUCTS.map((product) => [product.id, product]))

export function getProductById(id: string): Product | undefined {
  return PRODUCT_MAP.get(id)
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids.flatMap((id) => {
    const product = PRODUCT_MAP.get(id)
    return product ? [product] : []
  })
}

/** Lookup helpers used by the mock recommendation engine. */
export function getCategoryName(id: CategoryId): string {
  return CATEGORY_MAP[id]?.name ?? id
}

export function getStoreName(id: StoreId): string {
  return STORE_MAP[id]?.name ?? id
}

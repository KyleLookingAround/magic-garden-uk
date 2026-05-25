// Plant library, companion-planting relationships and pollinator data.
// To add or change a plant, edit the PLANTS array plus the parallel
// COMPANIONS and POLLINATORS maps — no build-time codegen required.
import { mrange } from '../lib/util.js';

export const PLANTS = [
  { id: 'tomato', name: 'Tomato', icon: '🍅', cat: 'veg', sun: 'Full sun', water: 'Regular', space: '45–60 cm', sow: 'Mar–Apr indoors', plant: 'Late May–Jun', harvest: 'Jul–Oct', color: '#c0392b', months: mrange(5, 10), tip: 'Stake well. Pinch out side shoots on cordon varieties.' },
  { id: 'courgette', name: 'Courgette', icon: '🥒', cat: 'veg', sun: 'Full sun', water: 'High', space: '90 cm', sow: 'Apr–May indoors', plant: 'Late May–Jun', harvest: 'Jul–Sep', color: '#3a7d44', months: mrange(5, 9), tip: 'Hungry plant — feed weekly. Pick young for best flavour.' },
  { id: 'lettuce', name: 'Lettuce', icon: '🥬', cat: 'veg', sun: 'Part shade', water: 'Regular', space: '20–30 cm', sow: 'Mar–Aug direct', plant: 'Apr–Sep', harvest: 'May–Oct', color: '#8fbc4d', months: mrange(3, 11), tip: 'Sow little and often for a continuous supply.' },
  { id: 'beans', name: 'Runner Beans', icon: '🫛', cat: 'veg', sun: 'Full sun', water: 'Regular', space: '15 cm', sow: 'Apr–May indoors', plant: 'Jun', harvest: 'Jul–Oct', color: '#d24d57', months: mrange(5, 10), tip: 'Needs tall canes or a wigwam. Romantic in flower.' },
  { id: 'carrot', name: 'Carrot', icon: '🥕', cat: 'veg', sun: 'Full sun', water: 'Light', space: '5–8 cm', sow: 'Mar–Jul direct', plant: '—', harvest: 'Jun–Oct', color: '#e67e22', months: mrange(3, 11), tip: 'Stone-free soil. Thin seedlings to avoid carrot fly.' },
  { id: 'potato', name: 'Potato', icon: '🥔', cat: 'veg', sun: 'Full sun', water: 'Regular', space: '30–40 cm', sow: '—', plant: 'Mar–Apr', harvest: 'Jun–Sep', color: '#8b6f47', months: mrange(3, 9), tip: 'Earth up as shoots emerge to boost yield.' },
  { id: 'onion', name: 'Onion', icon: '🧅', cat: 'veg', sun: 'Full sun', water: 'Light', space: '10 cm', sow: '—', plant: 'Mar–Apr (sets)', harvest: 'Jul–Aug', color: '#b8956a', months: mrange(3, 8), tip: 'Plant sets pointed-end up, tips just showing.' },
  { id: 'garlic', name: 'Garlic', icon: '🧄', cat: 'veg', sun: 'Full sun', water: 'Light', space: '15 cm', sow: '—', plant: 'Oct–Nov', harvest: 'Jun–Jul', color: '#e8dcc4', months: mrange(10, 7), tip: 'Plant in autumn — needs a cold spell to bulb up.' },
  { id: 'kale', name: 'Kale', icon: '🥬', cat: 'veg', sun: 'Full sun', water: 'Regular', space: '45 cm', sow: 'Apr–Jun direct', plant: 'Jun–Jul', harvest: 'Aug–Mar', color: '#2d5e3a', months: mrange(6, 4), tip: 'Wonderfully hardy — sweetens after a frost.' },
  { id: 'chard', name: 'Rainbow Chard', icon: '🌿', cat: 'veg', sun: 'Full / part', water: 'Regular', space: '30 cm', sow: 'Apr–Jul direct', plant: '—', harvest: 'Jun–Oct', color: '#d63384', months: mrange(4, 11), tip: 'Pretty stems in pink, yellow, orange — productive too.' },
  { id: 'beetroot', name: 'Beetroot', icon: '🍠', cat: 'veg', sun: 'Full sun', water: 'Regular', space: '10 cm', sow: 'Mar–Jul direct', plant: '—', harvest: 'Jun–Oct', color: '#7d1d3f', months: mrange(3, 11), tip: 'Eat leaves too — taste like spinach.' },
  { id: 'pea', name: 'Garden Pea', icon: '🟢', cat: 'veg', sun: 'Full sun', water: 'Regular', space: '5–8 cm', sow: 'Mar–Jun direct', plant: '—', harvest: 'Jun–Aug', color: '#7cb342', months: mrange(3, 8), tip: 'Pick often to keep them producing.' },
  { id: 'rosemary', name: 'Rosemary', icon: '🌿', cat: 'herb', sun: 'Full sun', water: 'Low', space: '60 cm', sow: '—', plant: 'Apr–May', harvest: 'Year-round', color: '#6b8e6b', months: mrange(1, 12), tip: 'Likes free-draining soil. Evergreen perennial.' },
  { id: 'thyme', name: 'Thyme', icon: '🌱', cat: 'herb', sun: 'Full sun', water: 'Low', space: '30 cm', sow: '—', plant: 'Apr–May', harvest: 'May–Oct', color: '#8a9a5b', months: mrange(1, 12), tip: 'Loves a sunny dry spot. Bees adore it.' },
  { id: 'mint', name: 'Mint', icon: '🌿', cat: 'herb', sun: 'Part shade', water: 'High', space: '30 cm', sow: '—', plant: 'Apr–Jun', harvest: 'May–Oct', color: '#4caf50', months: mrange(4, 11), tip: 'Plant in a pot — spreads aggressively otherwise!' },
  { id: 'basil', name: 'Basil', icon: '🌿', cat: 'herb', sun: 'Full sun', water: 'Regular', space: '25 cm', sow: 'Apr–Jun indoors', plant: 'Jun (warm)', harvest: 'Jul–Sep', color: '#7ba05b', months: mrange(6, 9), tip: 'Tender — keep in a warm spot. Pinch tops to bush up.' },
  { id: 'parsley', name: 'Parsley', icon: '🌱', cat: 'herb', sun: 'Full / part', water: 'Regular', space: '20 cm', sow: 'Mar–Aug direct', plant: '—', harvest: 'May–Nov', color: '#5d8a3a', months: mrange(3, 11), tip: 'Slow to germinate — pre-soak seeds in warm water.' },
  { id: 'chives', name: 'Chives', icon: '🌱', cat: 'herb', sun: 'Full sun', water: 'Regular', space: '20 cm', sow: 'Mar–Jul direct', plant: '—', harvest: 'May–Oct', color: '#9c7fb8', months: mrange(3, 11), tip: 'Pretty pink flowers — edible too.' },
  { id: 'sage', name: 'Sage', icon: '🌿', cat: 'herb', sun: 'Full sun', water: 'Low', space: '45 cm', sow: '—', plant: 'Apr–May', harvest: 'Year-round', color: '#9caa88', months: mrange(1, 12), tip: 'Mediterranean — hates wet feet. Lovely silvery foliage.' },
  { id: 'lavender', name: 'Lavender', icon: '💜', cat: 'flower', sun: 'Full sun', water: 'Low', space: '45–60 cm', sow: '—', plant: 'Apr–May', harvest: 'Jun–Aug bloom', color: '#9874bf', months: mrange(1, 12), tip: 'Free-draining soil. Trim after flowering to keep shape.' },
  { id: 'sunflower', name: 'Sunflower', icon: '🌻', cat: 'flower', sun: 'Full sun', water: 'Regular', space: '45 cm', sow: 'Apr–May indoors', plant: 'May–Jun', harvest: 'Aug–Sep bloom', color: '#f1c40f', months: mrange(5, 9), tip: 'Pick the right height for the spot — some hit 3m!' },
  { id: 'sweetpea', name: 'Sweet Pea', icon: '🌸', cat: 'flower', sun: 'Full sun', water: 'Regular', space: '15–20 cm', sow: 'Oct or Feb–Mar', plant: 'Apr–May', harvest: 'Jun–Sep bloom', color: '#e84393', months: mrange(4, 9), tip: 'Pick blooms regularly to keep them flowering.' },
  { id: 'foxglove', name: 'Foxglove', icon: '🌷', cat: 'flower', sun: 'Part shade', water: 'Regular', space: '45 cm', sow: 'May–Jun direct', plant: 'Aug–Sep', harvest: 'Jun–Jul (yr2)', color: '#b56fb1', months: mrange(3, 9), tip: 'Biennial — flowers in its second year. Loved by bees.' },
  { id: 'marigold', name: 'Marigold', icon: '🌼', cat: 'flower', sun: 'Full sun', water: 'Regular', space: '20 cm', sow: 'Mar–Apr indoors', plant: 'May–Jun', harvest: 'Jun–Oct bloom', color: '#ff8c42', months: mrange(5, 10), tip: 'Brilliant companion plant — deters aphids near tomatoes.' },
  { id: 'cosmos', name: 'Cosmos', icon: '🌸', cat: 'flower', sun: 'Full sun', water: 'Regular', space: '30–45 cm', sow: 'Mar–Apr indoors', plant: 'May–Jun', harvest: 'Jul–Oct bloom', color: '#f7a4c4', months: mrange(6, 10), tip: 'Cut-and-come-again. Pollinators love them.' },
  { id: 'dahlia', name: 'Dahlia', icon: '🌺', cat: 'flower', sun: 'Full sun', water: 'Regular', space: '45–60 cm', sow: '—', plant: 'May (tubers)', harvest: 'Jul–Oct bloom', color: '#c2185b', months: mrange(6, 10), tip: 'Lift tubers after frost in cold winters — or mulch heavily.' },
  { id: 'nasturtium', name: 'Nasturtium', icon: '🌼', cat: 'flower', sun: 'Full sun', water: 'Light', space: '30 cm', sow: 'Apr–May direct', plant: '—', harvest: 'Jun–Oct bloom', color: '#ff6b35', months: mrange(5, 10), tip: 'Edible flowers and leaves — peppery in salads.' },
  { id: 'strawberry', name: 'Strawberry', icon: '🍓', cat: 'fruit', sun: 'Full sun', water: 'Regular', space: '30–45 cm', sow: '—', plant: 'Mar–Apr / Aug–Sep', harvest: 'Jun–Aug', color: '#e63946', months: mrange(1, 12), tip: 'Mulch with straw to keep fruit clean and slugs off.' },
  { id: 'raspberry', name: 'Raspberry', icon: '🫐', cat: 'fruit', sun: 'Full sun', water: 'Regular', space: '45 cm', sow: '—', plant: 'Nov–Mar', harvest: 'Jun–Oct', color: '#a8324e', months: mrange(1, 12), tip: "Summer types fruit on last year's canes; autumn on new." },
  { id: 'rhubarb', name: 'Rhubarb', icon: '🌱', cat: 'fruit', sun: 'Full / part', water: 'Regular', space: '90 cm', sow: '—', plant: 'Oct–Mar (crown)', harvest: 'Apr–Jul', color: '#c0392b', months: mrange(3, 9), tip: "Don't pick in year one — let it establish." },
];

export const PLANT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'veg', label: 'Vegetables' },
  { id: 'herb', label: 'Herbs' },
  { id: 'flower', label: 'Flowers' },
  { id: 'fruit', label: 'Fruit' },
];

// ── Companion planting ──────────────────────────────────────────────────
export const COMPANIONS = {
  tomato: { good: ['basil', 'marigold', 'nasturtium', 'carrot', 'chives', 'parsley', 'lettuce'], bad: ['potato', 'kale'] },
  courgette: { good: ['nasturtium', 'beans', 'marigold', 'sunflower'], bad: ['potato'] },
  lettuce: { good: ['carrot', 'strawberry', 'beetroot', 'onion', 'chives'], bad: [] },
  beans: { good: ['courgette', 'strawberry', 'potato', 'marigold'], bad: ['onion', 'garlic', 'chives'] },
  carrot: { good: ['tomato', 'lettuce', 'onion', 'chives', 'rosemary', 'sage', 'pea'], bad: [] },
  potato: { good: ['beans', 'marigold', 'kale'], bad: ['tomato', 'courgette', 'raspberry'] },
  onion: { good: ['carrot', 'lettuce', 'beetroot', 'strawberry'], bad: ['beans', 'pea'] },
  garlic: { good: ['carrot', 'tomato', 'strawberry'], bad: ['beans', 'pea'] },
  kale: { good: ['potato', 'onion', 'nasturtium'], bad: ['tomato', 'strawberry'] },
  chard: { good: ['beans', 'onion', 'lettuce'], bad: [] },
  beetroot: { good: ['lettuce', 'onion', 'kale'], bad: ['beans'] },
  pea: { good: ['carrot', 'beans', 'chard'], bad: ['onion', 'garlic', 'chives'] },
  rosemary: { good: ['carrot', 'beans', 'sage'], bad: [] },
  thyme: { good: ['tomato', 'courgette', 'kale'], bad: [] },
  mint: { good: ['kale', 'tomato'], bad: [] },
  basil: { good: ['tomato', 'lettuce'], bad: [] },
  parsley: { good: ['tomato', 'carrot'], bad: [] },
  chives: { good: ['carrot', 'tomato', 'lettuce'], bad: ['beans', 'pea'] },
  sage: { good: ['rosemary', 'carrot', 'kale'], bad: [] },
  lavender: { good: ['rosemary', 'sage'], bad: [] },
  sunflower: { good: ['courgette'], bad: ['potato'] },
  sweetpea: { good: [], bad: [] },
  foxglove: { good: [], bad: [] },
  marigold: { good: ['tomato', 'courgette', 'potato', 'beans'], bad: [] },
  cosmos: { good: ['tomato'], bad: [] },
  dahlia: { good: [], bad: [] },
  nasturtium: { good: ['tomato', 'courgette', 'kale'], bad: [] },
  strawberry: { good: ['lettuce', 'onion', 'beans'], bad: ['kale'] },
  raspberry: { good: [], bad: ['potato'] },
  rhubarb: { good: [], bad: [] },
};

/** Relationship between two plant ids: 'good', 'bad', or null. */
export const companionRel = (a, b) => {
  if (!a || !b || a === b) return null;
  const ca = COMPANIONS[a], cb = COMPANIONS[b];
  if ((ca && ca.bad.includes(b)) || (cb && cb.bad.includes(a))) return 'bad';
  if ((ca && ca.good.includes(b)) || (cb && cb.good.includes(a))) return 'good';
  return null;
};

// ── Pollinators ─────────────────────────────────────────────────────────
// value: 0 (none) – 3 (excellent). bloomMonths: 1-indexed months providing forage.
export const POLLINATORS = {
  // veg
  tomato: { value: 2, bloomMonths: [6, 7, 8, 9], pollinators: ['bees'], note: 'Bumblebees buzz-pollinate for better fruit set.' },
  courgette: { value: 3, bloomMonths: [6, 7, 8, 9], pollinators: ['bees'], note: 'Big yellow flowers — a magnet for bees.' },
  lettuce: { value: 1, bloomMonths: [7, 8], pollinators: ['bees', 'hoverflies'], note: 'Only when left to bolt.' },
  beans: { value: 3, bloomMonths: [7, 8, 9], pollinators: ['bees'], note: 'Bumblebees especially love the red flowers.' },
  carrot: { value: 2, bloomMonths: [7, 8], pollinators: ['hoverflies', 'bees'], note: 'Umbels in year 2 — let some go to seed.' },
  potato: { value: 1, bloomMonths: [6, 7], pollinators: ['bees'], note: 'Modest forage value.' },
  onion: { value: 1, bloomMonths: [6, 7], pollinators: ['bees', 'hoverflies'], note: 'Only if left to bolt.' },
  garlic: { value: 0, bloomMonths: [], pollinators: [], note: 'Rarely flowers in cultivation.' },
  kale: { value: 2, bloomMonths: [4, 5], pollinators: ['bees', 'hoverflies'], note: 'Lovely yellow brassica flowers in year 2.' },
  chard: { value: 1, bloomMonths: [7, 8], pollinators: ['bees'], note: 'Mostly if you let it bolt.' },
  beetroot: { value: 0, bloomMonths: [], pollinators: [], note: 'Usually harvested before flowering.' },
  pea: { value: 1, bloomMonths: [5, 6, 7], pollinators: ['bees'], note: 'Mostly self-pollinating, but bees visit.' },
  // herbs
  rosemary: { value: 3, bloomMonths: [3, 4, 5], pollinators: ['bees', 'butterflies'], note: 'A vital early-spring nectar source.' },
  thyme: { value: 3, bloomMonths: [6, 7, 8], pollinators: ['bees', 'butterflies'], note: 'Honeybees and solitary bees adore it.' },
  mint: { value: 3, bloomMonths: [7, 8, 9], pollinators: ['bees', 'butterflies', 'hoverflies'], note: 'A late-summer all-rounder.' },
  basil: { value: 2, bloomMonths: [7, 8, 9], pollinators: ['bees'], note: 'Let one or two flower for the bees.' },
  parsley: { value: 2, bloomMonths: [6, 7], pollinators: ['hoverflies', 'bees'], note: 'Year-2 umbels are hoverfly magnets.' },
  chives: { value: 3, bloomMonths: [5, 6, 7], pollinators: ['bees', 'butterflies'], note: 'Pink globes the bees adore.' },
  sage: { value: 3, bloomMonths: [5, 6, 7], pollinators: ['bees', 'butterflies'], note: 'Bumblebees especially.' },
  // flowers
  lavender: { value: 3, bloomMonths: [6, 7, 8], pollinators: ['bees', 'butterflies'], note: 'The classic pollinator plant.' },
  sunflower: { value: 3, bloomMonths: [7, 8, 9, 10], pollinators: ['bees', 'butterflies', 'hoverflies'], note: 'Choose single-flowered varieties.' },
  sweetpea: { value: 2, bloomMonths: [6, 7, 8, 9], pollinators: ['bees'], note: 'Bumblebees especially.' },
  foxglove: { value: 3, bloomMonths: [6, 7, 8], pollinators: ['bees'], note: 'A bumblebee specialist plant.' },
  marigold: { value: 3, bloomMonths: [6, 7, 8, 9, 10], pollinators: ['bees', 'butterflies', 'hoverflies'], note: 'Open flowers — easy nectar access.' },
  cosmos: { value: 3, bloomMonths: [7, 8, 9, 10], pollinators: ['bees', 'butterflies', 'hoverflies'], note: 'Single varieties best.' },
  dahlia: { value: 2, bloomMonths: [7, 8, 9, 10], pollinators: ['bees', 'butterflies'], note: 'Choose single or open-centred varieties.' },
  nasturtium: { value: 2, bloomMonths: [6, 7, 8, 9, 10], pollinators: ['bees', 'butterflies'], note: 'Spurred flowers — mostly bumblebees.' },
  // fruit
  strawberry: { value: 2, bloomMonths: [4, 5, 6], pollinators: ['bees', 'hoverflies'], note: 'Bee pollination means better fruit.' },
  raspberry: { value: 3, bloomMonths: [5, 6], pollinators: ['bees'], note: 'Critical pollinator forage in early summer.' },
  rhubarb: { value: 1, bloomMonths: [5, 6], pollinators: ['bees'], note: 'Better if you let some flower.' },
};

export const POLLINATOR_TYPES = [
  { id: 'bees', label: 'Bees', icon: '🐝', color: '#d4a017' },
  { id: 'butterflies', label: 'Butterflies', icon: '🦋', color: '#7a4ea3' },
  { id: 'hoverflies', label: 'Hoverflies', icon: '🪰', color: '#3a7d44' },
];
export const POLLINATOR_TYPE_BY_ID = Object.fromEntries(POLLINATOR_TYPES.map(t => [t.id, t]));

/** Pollinator data for a plant id, with a safe empty default. */
export const pollinatorInfo = (plantId) => POLLINATORS[plantId] || { value: 0, bloomMonths: [], pollinators: [], note: '' };

/** Average spacing in cm parsed from a free-text spacing string like "45–60 cm". */
export const parseSizeCm = (s) => {
  const m = (s || '').match(/\d+/g);
  if (!m || !m.length) return 30;
  return m.map(Number).reduce((a, b) => a + b, 0) / m.length;
};

export const PLANTS_BY_ID = Object.fromEntries(PLANTS.map(p => [p.id, { ...p, sizeCm: parseSizeCm(p.space) }]));
export const ENRICHED_PLANTS = Object.values(PLANTS_BY_ID);

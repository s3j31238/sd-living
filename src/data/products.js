// ─────────────────────────────────────────────────────────────
//  SD LIVING — catalogue
//  `design` drives the procedural 3D lamp: form factor, art plate,
//  glow spectrum, walnut tone.
// ─────────────────────────────────────────────────────────────

export const WHATSAPP_NUMBER = '919146525702'
export const WHATSAPP_DISPLAY = '9146525702'
export const BRAND = 'SD LIVING'
export const TAGLINE = 'LIGHT UP YOUR SPACE'

export const CATEGORIES = ['MODERN', 'SPIRITUAL', 'MOTIVATIONAL', 'ARTISTIC']

export const inr = (n) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

const WARM = '#ffae5e'
const AMBER = '#ff9c3f'
const COOL = '#cfeaff'

export const PRODUCTS = [
  // ── FEATURED FOUR ────────────────────────────
  {
    id: 'proud',
    name: "DON'T STOP UNTIL YOU'RE PROUD",
    short: 'THE PROUD EDIT',
    category: 'MOTIVATIONAL',
    price: 2499,
    mrp: 3799,
    rating: 4.9,
    reviews: 218,
    badge: 'BESTSELLER',
    tags: ['bestseller', 'new'],
    blurb:
      'A quiet daily reminder, cut in light. Matte-black plate, warm amber letterforms, solid walnut base.',
    story:
      'Designed for desks that build things. The lettering is laser-cut clean through the plate so the LED behind it pools inside every serif — by day it reads as a black object, by night the words float in mid-air.',
    specs: {
      Material: 'Cast acrylic · solid walnut base',
      Dimensions: '22 × 9 × 26 cm',
      Light: '3 W soft LED · 2700K–4000K',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Matte black / dark walnut',
      Warranty: '2 years',
    },
    design: {
      type: 'text',
      art: 'proud',
      textPanel: {
        lines: ["DON'T STOP", 'UNTIL YOU’RE'],
        script: 'Proud',
        polarity: 'cutout',
        shape: 'rect',
      },
      plateHeight: 1.62,
      glow: WARM,
      accent: '#e6c98a',
      wood: '#4a3323',
      baseStyle: 'slab',
      spectrum: 'warm',
    },
  },
  {
    id: 'divine',
    name: 'DIVINE COLLECTION',
    short: 'DIVINE',
    category: 'SPIRITUAL',
    price: 2999,
    mrp: 4299,
    rating: 4.9,
    reviews: 341,
    badge: 'SIGNATURE',
    tags: ['bestseller'],
    blurb:
      'Bring home the blessings of Lord Ganesha. A matte-black cylinder, the motif cut clean through, lit from within.',
    story:
      'Our most gifted piece. The cylinder wraps the light so the glow is never harsh — it reads as a lantern from across the room and as fine line-work up close.',
    specs: {
      Material: 'Matte-black cylinder · diffused acrylic',
      Dimensions: 'Ø 10 × 24 cm',
      Light: '4 W soft LED · cool white / warm switchable',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Matte black',
      Warranty: '2 years',
    },
    design: {
      type: 'cylinder',
      art: 'ganesha',
      plateHeight: 2.42,
      radius: 0.46,
      glow: COOL,
      accent: '#e6c98a',
      wood: '#3b2a1d',
      spectrum: 'cool',
    },
  },
  {
    id: 'shiva',
    name: 'SHIVA COLLECTION',
    short: 'SHIVA',
    category: 'SPIRITUAL',
    price: 3299,
    mrp: 4699,
    rating: 5.0,
    reviews: 187,
    badge: 'LIMITED',
    tags: ['new', 'bestseller'],
    blurb:
      'The Adiyogi, in stillness and light. A meditative cylinder lamp for altars, entryways and quiet corners.',
    story:
      'The jata, the crescent, the closed eyes — every strand is a separate cut, held together by hairline bridges. It takes our cutter eleven minutes to finish one face.',
    specs: {
      Material: 'Matte-black cylinder · diffused acrylic',
      Dimensions: 'Ø 10 × 26 cm',
      Light: '4 W soft LED · 2700K–4000K',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Matte black',
      Warranty: '2 years',
    },
    design: {
      type: 'cylinder',
      art: 'shiva',
      plateHeight: 2.6,
      radius: 0.46,
      glow: '#ffdcb0',
      accent: '#dcc089',
      wood: '#2f2117',
      spectrum: 'warm',
    },
  },
  {
    id: 'floral',
    name: 'FLORAL COLLECTION',
    short: 'FLORAL',
    category: 'ARTISTIC',
    price: 2299,
    mrp: 3499,
    rating: 4.8,
    reviews: 264,
    badge: 'NEW',
    tags: ['new'],
    blurb:
      'Botanical line-work that unfurls in warm amber. Delicate, sculptural and impossibly photogenic bedside.',
    story:
      'Drawn by hand and reduced to one continuous line so the light travels the whole stem uninterrupted — the blossom brightens last, giving the flower a slow blooming effect as you raise the dimmer.',
    specs: {
      Material: 'Cast acrylic · solid walnut base',
      Dimensions: '19 × 9 × 27 cm',
      Light: '3 W soft LED · 2700K warm',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Dark walnut / warm amber',
      Warranty: '2 years',
    },
    design: {
      type: 'silhouette',
      art: 'floral',
      plateHeight: 1.85,
      glow: WARM,
      accent: '#e8caa0',
      wood: '#5a3f29',
      baseStyle: 'slab',
      spectrum: 'warm',
    },
  },

  // ── THE REST OF THE CATALOGUE ────────────────
  {
    id: 'tinyfeet',
    name: 'TINY FEET, BIG BLESSINGS',
    short: 'TINY FEET',
    category: 'ARTISTIC',
    price: 2199,
    mrp: 3299,
    rating: 5.0,
    reviews: 412,
    badge: 'MOST GIFTED',
    tags: ['bestseller'],
    blurb:
      'Two cupped hands holding a newborn’s feet. The piece new parents cry over — every single time.',
    story:
      'Our most emotional design. Add the baby’s name and birth date to the base and it becomes the keepsake that stays on the shelf for twenty years.',
    specs: {
      Material: 'Cast acrylic · solid walnut base',
      Dimensions: '24 × 9 × 20 cm',
      Light: '3 W soft LED · 2700K warm',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Dark walnut / warm amber',
      Warranty: '2 years',
    },
    design: {
      type: 'silhouette',
      art: 'hands',
      plateHeight: 1.35,
      glow: AMBER,
      accent: '#e6c98a',
      wood: '#4a3323',
      baseStyle: 'slab',
      spectrum: 'warm',
    },
  },
  {
    id: 'special',
    name: 'YOU ARE SPECIAL',
    short: 'YOU ARE SPECIAL',
    category: 'MOTIVATIONAL',
    price: 2399,
    mrp: 3499,
    rating: 4.9,
    reviews: 198,
    badge: null,
    tags: ['bestseller'],
    blurb:
      'A child holding a sleeping sibling, wrapped in warm light. Tenderness, rendered in laser-cut acrylic.',
    story:
      'Siblings, first birthdays, new arrivals. We cut the figures as one continuous silhouette so the glow outlines them rather than filling them — the effect is closer to a shadow play than a lamp.',
    specs: {
      Material: 'Cast acrylic · solid walnut base',
      Dimensions: '23 × 9 × 21 cm',
      Light: '3 W soft LED · 2700K warm',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Dark walnut / warm amber',
      Warranty: '2 years',
    },
    design: {
      type: 'silhouette',
      art: 'mother',
      plateHeight: 1.5,
      glow: AMBER,
      accent: '#e6c98a',
      wood: '#43301f',
      baseStyle: 'slab',
      spectrum: 'warm',
    },
  },
  {
    id: 'ram',
    name: 'JAI SHREE RAM',
    short: 'SHREE RAM',
    category: 'SPIRITUAL',
    price: 3099,
    mrp: 4399,
    rating: 4.9,
    reviews: 156,
    badge: null,
    tags: ['new'],
    blurb:
      'Tradition in every glow. The archer, the bow, the flag — cut clean and lit from inside a matte-black column.',
    story:
      'Built for pooja rooms and entryway consoles. The cool-white LED makes the figure read almost like moonlight against a dark wall.',
    specs: {
      Material: 'Matte-black cylinder · diffused acrylic',
      Dimensions: 'Ø 10 × 25 cm',
      Light: '4 W soft LED · cool white',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Matte black',
      Warranty: '2 years',
    },
    design: {
      type: 'cylinder',
      art: 'ram',
      plateHeight: 2.5,
      radius: 0.46,
      glow: COOL,
      accent: '#e6c98a',
      wood: '#2f2117',
      spectrum: 'cool',
    },
  },
  {
    id: 'devi',
    name: 'DEVI COLLECTION',
    short: 'DEVI',
    category: 'SPIRITUAL',
    price: 3199,
    mrp: 4599,
    rating: 5.0,
    reviews: 143,
    badge: 'NEW',
    tags: ['new'],
    blurb:
      'An ornate crowned Devi in serene meditation, framed by lotus. Intricate beyond what most cutters attempt.',
    story:
      'Over four hundred individual cuts in a single face. The crown alone takes three passes. This is the piece we show people when they ask what the machine can really do.',
    specs: {
      Material: 'Matte-black cylinder · diffused acrylic',
      Dimensions: 'Ø 10 × 26 cm',
      Light: '4 W soft LED · cool white',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Matte black',
      Warranty: '2 years',
    },
    design: {
      type: 'cylinder',
      art: 'devi',
      plateHeight: 2.58,
      radius: 0.46,
      glow: COOL,
      accent: '#e6c98a',
      wood: '#2f2117',
      spectrum: 'cool',
    },
  },
  {
    id: 'ganesha',
    name: 'GANESHA LINE',
    short: 'GANESHA',
    category: 'SPIRITUAL',
    price: 2499,
    mrp: 3699,
    rating: 4.9,
    reviews: 287,
    badge: null,
    tags: ['bestseller'],
    blurb:
      'Divine vibes for your home. Single-line Ganesha on a solid walnut base — warm, calm, quietly auspicious.',
    story:
      'The flat-plate counterpart to our Divine cylinder. Where the cylinder glows outward, this one throws the line-work as a soft shadow across the wall behind it.',
    specs: {
      Material: 'Cast acrylic · solid walnut base',
      Dimensions: '21 × 9 × 25 cm',
      Light: '3 W soft LED · 2700K warm',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Natural walnut / warm amber',
      Warranty: '2 years',
    },
    design: {
      type: 'silhouette',
      art: 'ganesha',
      plateHeight: 1.72,
      glow: AMBER,
      accent: '#e6c98a',
      wood: '#6b4a30',
      baseStyle: 'slab',
      spectrum: 'warm',
    },
  },
  {
    id: 'ballerina',
    name: 'BALLERINA PEN STAND',
    short: 'BALLERINA',
    category: 'MODERN',
    price: 1299,
    mrp: 1999,
    rating: 4.7,
    reviews: 88,
    badge: null,
    tags: [],
    blurb:
      'Elegant décor for every desk. A dancer mid-arabesque, holding your pen in perfect balance.',
    story:
      'Cut from powder-coated steel with a champagne-gold collar. Small details make a big impact — this is the object people pick up on your desk.',
    specs: {
      Material: 'Powder-coated steel · brass collar',
      Dimensions: '14 × 8 × 19 cm',
      Light: 'Unlit décor object',
      Power: '—',
      Finish: 'Matte black / champagne gold',
      Warranty: '1 year',
    },
    design: {
      type: 'penstand',
      art: 'ballerina',
      plateHeight: 1.45,
      glow: WARM,
      accent: '#c9a227',
      wood: '#1c1a18',
      spectrum: 'warm',
    },
  },
  {
    id: 'quill',
    name: 'QUILL PEN STAND',
    short: 'QUILL',
    category: 'MODERN',
    price: 1199,
    mrp: 1899,
    rating: 4.8,
    reviews: 74,
    badge: null,
    tags: ['new'],
    blurb:
      'A sculpted feather holding a single pen. Perfect for the home office, exceptional as a corporate gift.',
    story:
      'The barbs are cut as negative space so the whole piece reads as one silhouette from a distance and as fine detail up close. Weighted base, no wobble.',
    specs: {
      Material: 'Powder-coated steel · brass collar',
      Dimensions: '11 × 9 × 21 cm',
      Light: 'Unlit décor object',
      Power: '—',
      Finish: 'Matte black / champagne gold',
      Warranty: '1 year',
    },
    design: {
      type: 'penstand',
      art: 'feather',
      plateHeight: 1.55,
      glow: WARM,
      accent: '#c9a227',
      wood: '#1c1a18',
      spectrum: 'warm',
    },
  },
  {
    id: 'mantra',
    name: 'MANTRA LINE — PERSONALISED',
    short: 'MANTRA LINE',
    category: 'MOTIVATIONAL',
    price: 2199,
    mrp: 3299,
    rating: 4.8,
    reviews: 154,
    badge: 'CUSTOM',
    tags: ['new'],
    blurb:
      'Your words, your light. Up to three lines engraved in our signature serif, cut clean through matte black.',
    story:
      'Anniversaries, team mottos, a child’s name, a date that mattered. Send us the wording on WhatsApp and we send a digital proof before anything is cut.',
    specs: {
      Material: 'Cast acrylic · solid walnut base',
      Dimensions: '22 × 9 × 26 cm',
      Light: '3 W soft LED · 2700K–4000K',
      Power: 'USB-C · 1.5 m braided cable',
      Finish: 'Personalised',
      Warranty: '2 years',
    },
    design: {
      type: 'text',
      art: 'mantra',
      textPanel: {
        lines: ['LIGHT UP', 'YOUR SPACE'],
        script: null,
        polarity: 'cutout',
        shape: 'arch',
      },
      plateHeight: 1.7,
      glow: WARM,
      accent: '#e6c98a',
      wood: '#3f2c1e',
      baseStyle: 'step',
      spectrum: 'warm',
    },
  },
]

export const FEATURED_IDS = ['proud', 'divine', 'shiva', 'floral']
export const FEATURED = FEATURED_IDS.map((id) => PRODUCTS.find((p) => p.id === id))

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)
export const bestsellers = () => PRODUCTS.filter((p) => p.tags.includes('bestseller'))
export const newArrivals = () => PRODUCTS.filter((p) => p.tags.includes('new'))
export const related = (id) => {
  const p = getProduct(id)
  return PRODUCTS.filter((x) => x.id !== id && x.category === p.category)
    .concat(PRODUCTS.filter((x) => x.id !== id && x.category !== p.category))
    .slice(0, 4)
}

// ── Room presets for "See it in your space" ────
export const ROOMS = [
  {
    id: 'bedroom',
    label: 'BEDROOM',
    desc: 'Low, warm and sleepy. Set to 30% for a nightlight that never keeps you awake.',
    wall: '#3a2a22', floor: '#1a1512', ambient: 0.16, temp: 0.1, intensity: 0.78, accent: '#5a2018',
  },
  {
    id: 'living',
    label: 'LIVING ROOM',
    desc: 'The centrepiece of the console table. Full warmth, wide spread, generous shadows.',
    wall: '#44332a', floor: '#201913', ambient: 0.28, temp: 0.2, intensity: 1.0, accent: '#7a2a1c',
  },
  {
    id: 'study',
    label: 'STUDY',
    desc: 'Neutral-leaning light for long reading hours. Pairs with dark walnut shelving.',
    wall: '#2e2c28', floor: '#171615', ambient: 0.24, temp: 0.6, intensity: 1.12, accent: '#3a3a38',
  },
  {
    id: 'office',
    label: 'OFFICE',
    desc: 'Crisp and awake. Neutral 4000K for desks, video calls and late shipping nights.',
    wall: '#2a2c2f', floor: '#151617', ambient: 0.36, temp: 0.92, intensity: 1.28, accent: '#2e3338',
  },
  {
    id: 'bedside',
    label: 'BEDSIDE',
    desc: 'Intimate and close. A pool of amber just wide enough for one open book.',
    wall: '#2e211b', floor: '#161110', ambient: 0.1, temp: 0.04, intensity: 0.6, accent: '#6b2417',
  },
]

export const REVIEWS = [
  { name: 'Ananya R.', city: 'Mumbai', rating: 5, product: 'SHIVA COLLECTION',
    text: 'Photos genuinely do not do it justice. The cut-work is razor sharp and the glow is so soft — my whole bedroom feels like a hotel suite now.' },
  { name: 'Karan M.', city: 'Pune', rating: 5, product: "DON'T STOP UNTIL YOU'RE PROUD",
    text: 'Bought the Proud edit for my desk. Solid wood base, real weight, no cheap plastic anywhere. Worth every rupee.' },
  { name: 'Priya S.', city: 'Bengaluru', rating: 5, product: 'DIVINE COLLECTION',
    text: 'Gifted the Divine lamp to my mother for Diwali. She actually cried. Packaging was beautiful and delivery was quick.' },
  { name: 'Rehan A.', city: 'Delhi', rating: 4, product: 'FLORAL COLLECTION',
    text: 'The dimmer is the best part — 20% at night is perfect. Would love to see a few more motif options soon.' },
  { name: 'Meera J.', city: 'Hyderabad', rating: 5, product: 'TINY FEET, BIG BLESSINGS',
    text: 'Ordered for my sister after her baby was born. She said it was the most thoughtful gift she received. Ordering two more.' },
  { name: 'Aditya V.', city: 'Nagpur', rating: 5, product: 'QUILL PEN STAND',
    text: 'Bought twelve as Diwali gifts for the team. SD Living handled the whole bulk order on WhatsApp within a day.' },
]

export const FAQ = [
  { q: 'How long does delivery take?',
    a: 'Dispatched within 24–48 hours. Metro cities receive in 2–4 days, rest of India in 4–7 days. Free shipping on all prepaid orders above ₹1,499.' },
  { q: 'Can I personalise the engraving?',
    a: 'Yes — the MANTRA LINE piece accepts up to three lines of custom text, and most silhouette lamps can carry a name or date on the base. Share your wording on WhatsApp and we will send a digital proof before cutting.' },
  { q: 'Is the light adjustable?',
    a: 'Every lit SD LIVING piece ships with a stepless dimmer. Select models also switch between 2700K warm and 4000K neutral white.' },
  { q: 'Do you take bulk and corporate orders?',
    a: 'We do — Diwali hampers, wedding return gifts and corporate sets. Message us on WhatsApp at 9146525702 for volume pricing.' },
  { q: 'What is the return policy?',
    a: '7-day no-questions replacement for any manufacturing defect or transit damage. Personalised pieces are exempt unless damaged.' },
]

export const WHY = [
  { id: 'led', title: 'SOFT LED LIGHT', desc: 'Flicker-free, eye-safe diffusion. Warm 2700K by default, dimmable to a whisper.' },
  { id: 'art', title: 'ARTISTIC DESIGN', desc: 'Every motif drawn in-house, then cut to hairline precision on cast acrylic.' },
  { id: 'gift', title: 'PERFECT FOR GIFTING', desc: 'Arrives in rigid gift packaging with a handwritten card. Nothing else to do.' },
  { id: 'home', title: 'IDEAL FOR HOME DÉCOR', desc: 'Matte black and walnut. Designed to belong on the shelf, lit or unlit.' },
]

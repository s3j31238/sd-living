import { create } from 'zustand'
import { PRODUCTS, WHATSAPP_NUMBER, inr } from '../data/products'

const SHIPPING_FREE_ABOVE = 1499
const SHIPPING_FLAT = 99

export const useStore = create((set, get) => ({
  // ── Cart ──────────────────────────────────────
  cart: [],
  addToCart: (id, qty = 1) =>
    set((s) => {
      const found = s.cart.find((l) => l.id === id)
      const cart = found
        ? s.cart.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, 99) } : l))
        : [...s.cart, { id, qty }]
      return { cart, cartBump: s.cartBump + 1 }
    }),
  setQty: (id, qty) =>
    set((s) => ({
      cart:
        qty <= 0
          ? s.cart.filter((l) => l.id !== id)
          : s.cart.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, 99) } : l)),
    })),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((l) => l.id !== id) })),
  clearCart: () => set({ cart: [] }),
  cartBump: 0,


  // ── Wishlist ──────────────────────────────────
  wishlist: [],
  toggleWish: (id) =>
    set((s) => ({
      wishlist: s.wishlist.includes(id)
        ? s.wishlist.filter((x) => x !== id)
        : [...s.wishlist, id],
    })),

  // ── UI panels ─────────────────────────────────
  cartOpen: false,
  searchOpen: false,
  wishOpen: false,
  menuOpen: false,
  checkoutOpen: false,
  detailId: null,
  setPanel: (k, v) =>
    set((s) => ({
      cartOpen: false,
      searchOpen: false,
      wishOpen: false,
      menuOpen: false,
      ...(k ? { [k]: v === undefined ? !s[k] : v } : {}),
    })),
  openDetail: (id) => set({ detailId: id, cartOpen: false, searchOpen: false, wishOpen: false, menuOpen: false }),
  closeDetail: () => set({ detailId: null }),
  setCheckout: (v) => set({ checkoutOpen: v, cartOpen: false }),

  // ── Fly-to-cart animation queue ───────────────
  flights: [],
  launchFlight: (flight) =>
    set((s) => ({ flights: [...s.flights, { ...flight, key: Math.random().toString(36).slice(2) }] })),
  endFlight: (key) => set((s) => ({ flights: s.flights.filter((f) => f.key !== key) })),

  // ── Shop filters ──────────────────────────────
  query: '',
  setQuery: (query) => set({ query }),
  category: 'ALL',
  setCategory: (category) => set({ category }),
  sort: 'featured',
  setSort: (sort) => set({ sort }),
  maxPrice: 5000,
  setMaxPrice: (maxPrice) => set({ maxPrice }),


  // ── 3D quality / capability ───────────────────
  quality: 'high', // high | medium | low
  setQuality: (quality) => set({ quality }),
  webglOK: true,
  setWebglOK: (webglOK) => set({ webglOK }),
  entered: false,
  setEntered: (entered) => set({ entered }),
  loaded: false,
  setLoaded: (loaded) => set({ loaded }),

  // ── Showroom scene state ──────────────────────
  scrollP: 0,
  setScrollP: (scrollP) => set({ scrollP }),
  hoverId: null,
  setHoverId: (hoverId) => set({ hoverId }),
  stage: 'hero', // hero | cinematic | gallery
  setStage: (stage) => set({ stage }),

  toast: null,
  notify: (toast) => {
    set({ toast: { ...toast, key: Math.random() } })
    setTimeout(() => set((s) => (s.toast && s.toast.key ? { toast: null } : {})), 2600)
  },
}))

// ─────────────────────────────────────────────────────────────
//  Pure derived helpers. These are deliberately NOT zustand
//  selectors — returning a fresh array from a selector on every
//  render makes useSyncExternalStore loop forever.
// ─────────────────────────────────────────────────────────────
export const computeLines = (cart) =>
  cart
    .map((l) => {
      const product = PRODUCTS.find((x) => x.id === l.id)
      return product ? { ...l, product, total: product.price * l.qty } : null
    })
    .filter(Boolean)

export const computeSubtotal = (cart) =>
  computeLines(cart).reduce((n, l) => n + l.total, 0)

export const computeShipping = (subtotal) =>
  subtotal === 0 || subtotal >= SHIPPING_FREE_ABOVE ? 0 : SHIPPING_FLAT

export const computeTotals = (cart) => {
  const lines = computeLines(cart)
  const subtotal = lines.reduce((n, l) => n + l.total, 0)
  const shipping = computeShipping(subtotal)
  return { lines, subtotal, shipping, total: subtotal + shipping, count: cart.reduce((n, l) => n + l.qty, 0) }
}

const SORTERS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  newest: (a, b) => Number(b.tags.includes('new')) - Number(a.tags.includes('new')),
  featured: () => 0,
}

export const filterProducts = ({ query = '', category = 'ALL', sort = 'featured', maxPrice = 99999 }) => {
  const q = query.trim().toLowerCase()
  const list = PRODUCTS.filter((p) => {
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.blurb.toLowerCase().includes(q)
    return matchQ && (category === 'ALL' || p.category === category) && p.price <= maxPrice
  })
  return [...list].sort(SORTERS[sort] || SORTERS.featured)
}

export const FREE_SHIPPING_ABOVE = SHIPPING_FREE_ABOVE

// ── WhatsApp helpers ────────────────────────────
export const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

export const productWaMessage = (product, qty = 1) => {
  const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://sdliving.in'}/?product=${product.id}`
  return [
    `Hello SD LIVING 👋`,
    ``,
    `I'd like to order:`,
    `• Product: ${product.name}`,
    `• Quantity: ${qty}`,
    `• Price: ${inr(product.price)} ${qty > 1 ? `(Total ${inr(product.price * qty)})` : ''}`.trim(),
    `• Link: ${link}`,
    ``,
    `Please share payment & delivery details.`,
  ].join('\n')
}

export const cartWaMessage = (lines, subtotal, shipping, total) =>
  [
    `Hello SD LIVING 👋`,
    ``,
    `I'd like to place this order:`,
    ...lines.map(
      (l, i) => `${i + 1}. ${l.product.name} × ${l.qty} — ${inr(l.total)}`
    ),
    ``,
    `Subtotal: ${inr(subtotal)}`,
    `Shipping: ${shipping === 0 ? 'FREE' : inr(shipping)}`,
    `Total: ${inr(total)}`,
    ``,
    `Please confirm availability.`,
  ].join('\n')

import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconClose, IconHeart, IconWhatsApp, Stars, Rule, Wordmark } from './Brand'
import ProductThumb from './ProductThumb'
import { useStore, waLink, cartWaMessage, computeTotals, FREE_SHIPPING_ABOVE } from '../store/useStore'
import { PRODUCTS, CATEGORIES, inr } from '../data/products'

const EASE = [0.22, 1, 0.36, 1]

// ── Shared drawer shell ─────────────────────────
function Drawer({ open, onClose, children, title, side = 'right', width = 460 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.aside
            initial={{ x: side === 'right' ? width + 40 : -(width + 40) }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? width + 40 : -(width + 40) }}
            transition={{ duration: 0.75, ease: EASE }}
            className={`glass-strong noise absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} flex w-full flex-col`}
            style={{ maxWidth: width }}
          >
            <header className="flex items-center justify-between border-b border-champagne/10 px-6 py-5">
              <h3 className="eyebrow !text-champagne">{title}</h3>
              <button onClick={onClose} className="p-2 text-cream/50 transition-colors hover:text-champagne">
                <IconClose size={17} />
              </button>
            </header>
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Cart ────────────────────────────────────────
export function CartPanel() {
  const open = useStore((s) => s.cartOpen)
  const setPanel = useStore((s) => s.setPanel)
  const cart = useStore((s) => s.cart)
  const { lines, subtotal, shipping, total } = useMemo(() => computeTotals(cart), [cart])
  const setQty = useStore((s) => s.setQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const setCheckout = useStore((s) => s.setCheckout)
  const openDetail = useStore((s) => s.openDetail)

  const close = () => setPanel(null)
  const freeGap = FREE_SHIPPING_ABOVE - subtotal

  return (
    <Drawer open={open} onClose={close} title={`YOUR CART — ${lines.length} ITEM${lines.length === 1 ? '' : 'S'}`}>
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 h-14 w-14 rounded-full border border-champagne/20"
            style={{ background: 'radial-gradient(circle at 40% 35%, rgba(230,201,138,.16), transparent 70%)' }} />
          <p className="font-display text-2xl text-cream/75">Your cart is dark.</p>
          <p className="mt-2.5 max-w-[250px] font-sans text-[11.5px] font-light leading-[1.9] text-cream/40">
            Add a piece and let's light it up.
          </p>
          <button onClick={close} className="btn-ghost mt-7">CONTINUE BROWSING</button>
        </div>
      ) : (
        <>
          <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-5">
            {subtotal < FREE_SHIPPING_ABOVE && (
              <div className="mb-5 border border-champagne/15 bg-champagne/[.03] px-4 py-3">
                <p className="font-sans text-[10px] uppercase text-champagne/80" style={{ letterSpacing: '.18em' }}>
                  {inr(freeGap)} AWAY FROM FREE SHIPPING
                </p>
                <div className="mt-2 h-px w-full bg-champagne/15">
                  <div className="h-full bg-gradient-to-r from-gold to-champagneLight transition-all duration-700"
                    style={{ width: `${Math.min((subtotal / FREE_SHIPPING_ABOVE) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            <ul className="space-y-4">
              {lines.map((l) => (
                <motion.li key={l.id} layout
                  initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 22 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex gap-4 border-b border-champagne/8 pb-4">
                  <button onClick={() => { openDetail(l.id); close() }}
                    className="h-[92px] w-[78px] shrink-0 overflow-hidden border border-champagne/10 bg-black/50">
                    <ProductThumb product={l.product} height={92} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-[15px] leading-tight text-cream/90">{l.product.short}</h4>
                      <button onClick={() => removeFromCart(l.id)}
                        className="shrink-0 p-1 text-cream/30 transition-colors hover:text-red-400">
                        <IconClose size={12} />
                      </button>
                    </div>
                    <p className="mt-0.5 font-sans text-[9px] uppercase text-cream/35" style={{ letterSpacing: '.2em' }}>
                      {l.product.category}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-champagne/18">
                        <Qty onClick={() => setQty(l.id, l.qty - 1)}>−</Qty>
                        <span className="w-8 text-center font-sans text-[11px] text-cream/85">{l.qty}</span>
                        <Qty onClick={() => setQty(l.id, l.qty + 1)}>+</Qty>
                      </div>
                      <span className="font-sans text-[12.5px] text-champagne">{inr(l.total)}</span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <footer className="border-t border-champagne/12 px-6 py-5">
            <Row label="Subtotal" value={inr(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? 'FREE' : inr(shipping)} accent={shipping === 0} />
            <div className="my-3 hairline" />
            <div className="mb-4 flex items-baseline justify-between">
              <span className="eyebrow">TOTAL</span>
              <span className="font-display text-[26px] text-cream">{inr(total)}</span>
            </div>
            <button onClick={() => setCheckout(true)} className="btn-gold w-full">CHECKOUT</button>
            <a href={waLink(cartWaMessage(lines, subtotal, shipping, total))} target="_blank" rel="noreferrer"
              className="btn-wa mt-2.5 w-full">
              <IconWhatsApp size={14} /> ORDER ON WHATSAPP
            </a>
          </footer>
        </>
      )}
    </Drawer>
  )
}

const Qty = ({ children, onClick }) => (
  <button onClick={onClick}
    className="flex h-7 w-7 items-center justify-center text-[13px] text-cream/55 transition-colors hover:bg-champagne/10 hover:text-champagne">
    {children}
  </button>
)

const Row = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-1">
    <span className="font-sans text-[10.5px] uppercase text-cream/45" style={{ letterSpacing: '.18em' }}>{label}</span>
    <span className={`font-sans text-[12px] ${accent ? 'text-emerald-300/85' : 'text-cream/80'}`}>{value}</span>
  </div>
)

// ── Wishlist ────────────────────────────────────
export function WishlistPanel() {
  const open = useStore((s) => s.wishOpen)
  const setPanel = useStore((s) => s.setPanel)
  const wishlist = useStore((s) => s.wishlist)
  const toggleWish = useStore((s) => s.toggleWish)
  const addToCart = useStore((s) => s.addToCart)
  const openDetail = useStore((s) => s.openDetail)
  const notify = useStore((s) => s.notify)
  const items = wishlist.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean)

  return (
    <Drawer open={open} onClose={() => setPanel(null)} title={`WISHLIST — ${items.length}`}>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <IconHeart size={30} className="mb-4 text-champagne/30" />
          <p className="font-display text-2xl text-cream/75">Nothing saved yet.</p>
          <p className="mt-2.5 max-w-[250px] font-sans text-[11.5px] font-light leading-[1.9] text-cream/40">
            Tap the ♡ on any piece to keep it here.
          </p>
        </div>
      ) : (
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {items.map((p) => (
            <div key={p.id} className="flex gap-4 border-b border-champagne/8 pb-4">
              <button onClick={() => { openDetail(p.id); setPanel(null) }}
                className="h-[92px] w-[78px] shrink-0 overflow-hidden border border-champagne/10 bg-black/50">
                <ProductThumb product={p} height={92} />
              </button>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h4 className="font-display text-[15px] leading-tight text-cream/90">{p.short}</h4>
                  <span className="font-sans text-[12px] text-champagne">{inr(p.price)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { addToCart(p.id); notify({ title: 'ADDED TO CART', body: p.short }) }}
                    className="btn-gold flex-1 !px-3 !py-2 !text-[9px]">ADD TO CART</button>
                  <button onClick={() => toggleWish(p.id)}
                    className="border border-champagne/20 px-3 text-cream/45 transition-colors hover:text-red-400">
                    <IconClose size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  )
}

// ── Search ──────────────────────────────────────
export function SearchPanel() {
  const open = useStore((s) => s.searchOpen)
  const setPanel = useStore((s) => s.setPanel)
  const openDetail = useStore((s) => s.openDetail)
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t) || p.blurb.toLowerCase().includes(t)
    ).slice(0, 6)
  }, [q])

  useEffect(() => { if (!open) setQ('') }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setPanel(null)} />
          <motion.div
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="glass-strong noise absolute inset-x-4 top-[12vh] mx-auto max-w-[680px] p-7 sm:inset-x-8"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="eyebrow !text-champagne">SEARCH THE COLLECTION</h3>
              <button onClick={() => setPanel(null)} className="p-1.5 text-cream/50 hover:text-champagne">
                <IconClose size={16} />
              </button>
            </div>

            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Try “shiva”, “gift”, “spiritual”…"
              className="field !border-x-0 !border-t-0 !bg-transparent !px-0 !py-3 font-display !text-[22px] placeholder:!text-cream/20" />

            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setQ(c.toLowerCase())}
                  className="border border-champagne/18 px-3 py-1.5 font-sans text-[9px] uppercase text-cream/55 transition-colors hover:border-champagne/60 hover:text-champagne"
                  style={{ letterSpacing: '.2em' }}>
                  {c}
                </button>
              ))}
            </div>

            {results.length > 0 && (
              <ul className="no-scrollbar mt-6 max-h-[42vh] space-y-2 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => { openDetail(p.id); setPanel(null) }}
                      className="group flex w-full items-center gap-4 border border-transparent p-2 text-left transition-colors hover:border-champagne/15 hover:bg-champagne/[.03]">
                      <span className="h-14 w-14 shrink-0 overflow-hidden border border-champagne/10 bg-black/50">
                        <ProductThumb product={p} height={56} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[15px] text-cream/90">{p.name}</span>
                        <span className="font-sans text-[9px] uppercase text-cream/35" style={{ letterSpacing: '.2em' }}>{p.category}</span>
                      </span>
                      <span className="font-sans text-[12px] text-champagne">{inr(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {q && results.length === 0 && (
              <p className="mt-7 text-center font-sans text-[11px] text-cream/35">
                Nothing matched “{q}”. Try a category, or message us on WhatsApp.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Checkout ────────────────────────────────────
export function CheckoutPanel() {
  const open = useStore((s) => s.checkoutOpen)
  const setCheckout = useStore((s) => s.setCheckout)
  const cart = useStore((s) => s.cart)
  const { lines, subtotal, shipping, total } = useMemo(() => computeTotals(cart), [cart])
  const clearCart = useStore((s) => s.clearCart)
  const notify = useStore((s) => s.notify)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pin: '' })

  useEffect(() => { if (open) setStep(0) }, [open])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.name && form.phone.length >= 10 && form.address && form.city && form.pin.length >= 6

  const placeOrder = () => {
    setStep(1)
    setTimeout(() => {
      clearCart()
      notify({ title: 'ORDER CONFIRMED', body: 'We’ll WhatsApp you shortly' })
    }, 1600)
  }

  const waText = [
    `Hello SD LIVING 👋`, ``, `New order:`,
    ...lines.map((l, i) => `${i + 1}. ${l.product.name} × ${l.qty} — ${inr(l.total)}`),
    ``, `Subtotal: ${inr(subtotal)}`, `Shipping: ${shipping === 0 ? 'FREE' : inr(shipping)}`, `Total: ${inr(total)}`,
    ``, `Name: ${form.name}`, `Phone: ${form.phone}`,
    `Address: ${form.address}, ${form.city} — ${form.pin}`,
  ].join('\n')

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] overflow-y-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
          <div className="absolute inset-0 bg-ink/94 backdrop-blur-2xl" onClick={() => setCheckout(false)} />
          <div className="relative flex min-h-full items-start justify-center px-4 py-10 sm:py-16">
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.75, ease: EASE }}
              className="glass-strong noise w-full max-w-[940px] p-7 sm:p-10"
            >
              <div className="mb-8 flex items-start justify-between">
                <Wordmark />
                <button onClick={() => setCheckout(false)} className="p-2 text-cream/50 hover:text-champagne">
                  <IconClose size={18} />
                </button>
              </div>

              {step === 1 ? (
                <div className="py-14 text-center">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-champagne/30"
                    style={{ background: 'radial-gradient(circle at 40% 35%, rgba(230,201,138,.28), transparent 72%)' }}>
                    <span className="font-display text-3xl text-champagne">✓</span>
                  </motion.div>
                  <h3 className="display text-[34px] text-cream sm:text-[42px]">THANK YOU.</h3>
                  <Rule className="my-5" w={160} />
                  <p className="mx-auto max-w-[400px] font-sans text-[12.5px] font-light leading-[1.9] text-cream/50">
                    Your order is in. We’ll confirm on WhatsApp within a few hours and dispatch in 24–48 hours.
                  </p>
                  <a href={waLink(waText)} target="_blank" rel="noreferrer" className="btn-wa mt-8">
                    <IconWhatsApp size={14} /> SEND ORDER ON WHATSAPP
                  </a>
                </div>
              ) : (
                <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
                  <div>
                    <h3 className="display mb-1 text-[30px] text-cream">CHECKOUT</h3>
                    <p className="mb-7 font-sans text-[11px] text-cream/40">Delivery across India · Cash on delivery available</p>

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <Field label="FULL NAME" value={form.name} onChange={set('name')} className="sm:col-span-2" />
                      <Field label="PHONE" value={form.phone} onChange={set('phone')} type="tel" placeholder="10-digit mobile" />
                      <Field label="EMAIL (OPTIONAL)" value={form.email} onChange={set('email')} type="email" />
                      <Field label="ADDRESS" value={form.address} onChange={set('address')} className="sm:col-span-2" />
                      <Field label="CITY" value={form.city} onChange={set('city')} />
                      <Field label="PIN CODE" value={form.pin} onChange={set('pin')} />
                    </div>

                    <div className="mt-7">
                      <p className="eyebrow mb-3">PAYMENT</p>
                      <div className="space-y-2">
                        {['UPI / GPay / PhonePe', 'Credit or Debit Card', 'Cash on Delivery (+₹49)'].map((m, i) => (
                          <label key={m} className="flex cursor-pointer items-center gap-3 border border-champagne/12 px-4 py-3 transition-colors hover:border-champagne/35">
                            <input type="radio" name="pay" defaultChecked={i === 0} className="accent-[#c9a227]" />
                            <span className="font-sans text-[11.5px] text-cream/75">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:border-l lg:border-champagne/10 lg:pl-9">
                    <p className="eyebrow mb-4">ORDER SUMMARY</p>
                    <ul className="mb-5 space-y-3">
                      {lines.map((l) => (
                        <li key={l.id} className="flex items-center gap-3">
                          <span className="h-12 w-11 shrink-0 overflow-hidden border border-champagne/10 bg-black/50">
                            <ProductThumb product={l.product} height={48} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[13.5px] text-cream/85">{l.product.short}</span>
                            <span className="font-sans text-[9.5px] text-cream/35">QTY {l.qty}</span>
                          </span>
                          <span className="font-sans text-[11.5px] text-champagne">{inr(l.total)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="hairline mb-3" />
                    <Row label="Subtotal" value={inr(subtotal)} />
                    <Row label="Shipping" value={shipping === 0 ? 'FREE' : inr(shipping)} accent={shipping === 0} />
                    <div className="my-3 hairline" />
                    <div className="mb-5 flex items-baseline justify-between">
                      <span className="eyebrow">TOTAL</span>
                      <span className="font-display text-[28px] text-cream">{inr(total)}</span>
                    </div>
                    <button disabled={!valid} onClick={placeOrder}
                      className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-35">
                      PLACE ORDER
                    </button>
                    <a href={waLink(waText)} target="_blank" rel="noreferrer" className="btn-wa mt-2.5 w-full">
                      <IconWhatsApp size={14} /> ORDER ON WHATSAPP
                    </a>
                    <p className="mt-4 text-center font-sans text-[9px] uppercase text-cream/25" style={{ letterSpacing: '.2em' }}>
                      SECURE · 7-DAY REPLACEMENT · 2-YEAR WARRANTY
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block font-sans text-[9px] uppercase text-cream/40" style={{ letterSpacing: '.2em' }}>{label}</span>
      <input className="field" {...rest} />
    </label>
  )
}

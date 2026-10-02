import React, { useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconClose, IconHeart, IconWhatsApp, Stars, Rule } from './Brand'
import ProductThumb from './ProductThumb'
import { useStore, waLink, productWaMessage } from '../store/useStore'
import { getProduct, related, ROOMS, REVIEWS, inr } from '../data/products'

const ProductViewer = lazy(() => import('../three/ProductViewer'))
const EASE = [0.22, 1, 0.36, 1]

export default function ProductModal() {
  const id = useStore((s) => s.detailId)
  const close = useStore((s) => s.closeDetail)
  const product = id ? getProduct(id) : null

  useEffect(() => {
    document.body.style.overflow = id ? 'hidden' : ''
    if (window.__lenis) id ? window.__lenis.stop() : window.__lenis.start()
    return () => { document.body.style.overflow = '' }
  }, [id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <AnimatePresence>
      {product && <Detail key={product.id} product={product} onClose={close} />}
    </AnimatePresence>
  )
}

function Detail({ product, onClose }) {
  const quality = useStore((s) => s.quality)
  const webglOK = useStore((s) => s.webglOK)
  const addToCart = useStore((s) => s.addToCart)
  const toggleWish = useStore((s) => s.toggleWish)
  const wished = useStore((s) => s.wishlist.includes(product.id))
  const setCheckout = useStore((s) => s.setCheckout)
  const openDetail = useStore((s) => s.openDetail)
  const notify = useStore((s) => s.notify)

  const unlit = product.design.type === 'penstand'
  const [on, setOn] = useState(!unlit)
  const [brightness, setBrightness] = useState(0.78)
  const [temp, setTemp] = useState(product.design.spectrum === 'cool' ? 0.55 : 0.16)
  const [roomIdx, setRoomIdx] = useState(1)
  const [darkRoom, setDarkRoom] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('story')

  const room = ROOMS[roomIdx]
  const rel = related(product.id)
  const reviews = REVIEWS.slice(0, 3)
  const save = Math.round(((product.mrp - product.price) / product.mrp) * 100)

  const handleAdd = () => {
    addToCart(product.id, qty)
    notify({ title: 'ADDED TO CART', body: product.short })
  }
  const handleBuy = () => { addToCart(product.id, qty); setCheckout(true); onClose() }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="fixed inset-0 z-[88] bg-ink"
    >
      {/* ── 3D viewer ── */}
      <div className="absolute inset-0">
        {webglOK ? (
          <Suspense fallback={<ViewerSkeleton product={product} />}>
            <ProductViewer
              product={product} on={on} brightness={brightness} temp={temp}
              room={room} darkRoom={darkRoom} autoRotate={autoRotate} zoom={zoom} quality={quality}
            />
          </Suspense>
        ) : (
          <ViewerSkeleton product={product} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 vignette" />
      <div className="pointer-events-none absolute inset-0 noise" />

      {/* ── top bar ── */}
      <motion.div
        initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8"
      >
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="glass flex items-center gap-2.5 px-4 py-2.5 font-sans text-[9.5px] uppercase text-cream/70 transition-colors hover:text-champagne"
            style={{ letterSpacing: '.24em' }}>
            <IconClose size={12} /> CLOSE
          </button>
          <span className="hidden font-sans text-[9px] uppercase text-cream/30 sm:inline" style={{ letterSpacing: '.28em' }}>
            DRAG TO ROTATE · SCROLL TO ZOOM · RIGHT-DRAG TO PAN
          </span>
        </div>
        <button onClick={() => toggleWish(product.id)}
          className={`glass flex h-10 w-10 items-center justify-center transition-colors ${wished ? 'text-red-400' : 'text-cream/60 hover:text-champagne'}`}>
          <IconHeart filled={wished} size={17} />
        </button>
      </motion.div>

      {/* ── viewer controls ── */}
      <motion.div
        initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.8, ease: EASE }}
        className="absolute bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-[620px] -translate-x-1/2 lg:left-[max(2rem,calc(50%-34rem))] lg:translate-x-0"
      >
        <div className="glass-strong px-4 py-3.5 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <Ctrl active={autoRotate} onClick={() => setAutoRotate((v) => !v)}>360° VIEW</Ctrl>
            {!unlit && (
              <>
                <Ctrl active={on} onClick={() => setOn(true)}>LIGHT ON</Ctrl>
                <Ctrl active={!on} onClick={() => setOn(false)}>LIGHT OFF</Ctrl>
              </>
            )}
            <Ctrl onClick={() => setZoom((z) => Math.min(z * 1.28, 2.4))}>ZOOM +</Ctrl>
            <Ctrl onClick={() => setZoom((z) => Math.max(z / 1.28, 0.6))}>ZOOM −</Ctrl>
            <Ctrl active={darkRoom} onClick={() => setDarkRoom((v) => !v)}>DARK ROOM</Ctrl>
          </div>

          {!unlit && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Slider label="LOW" right="HIGH" value={brightness} onChange={setBrightness} title="BRIGHTNESS" />
              <Slider label="WARM" right="NEUTRAL" value={temp} onChange={setTemp} title="TEMPERATURE" />
            </div>
          )}

          <div className="mt-3 border-t border-champagne/10 pt-3">
            <p className="eyebrow mb-2 !text-[8.5px]">SEE IT IN YOUR SPACE</p>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {ROOMS.map((r, i) => (
                <button key={r.id} onClick={() => setRoomIdx(i)}
                  className={`shrink-0 border px-3 py-1.5 font-sans text-[8.5px] uppercase transition-all duration-400 ${
                    i === roomIdx ? 'border-champagne/70 bg-champagne/12 text-champagne' : 'border-champagne/14 text-cream/45 hover:text-cream/80'
                  }`} style={{ letterSpacing: '.18em' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── product panel ── */}
      <motion.aside
        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
        transition={{ delay: 0.12, duration: 0.85, ease: EASE }}
        className="absolute right-0 top-0 z-30 flex h-full w-full flex-col lg:w-[440px] xl:w-[480px]"
      >
        <div className="glass-strong noise no-scrollbar mt-auto max-h-[62vh] overflow-y-auto p-6 sm:p-8 lg:mt-0 lg:max-h-full lg:h-full">
          <div className="flex items-center gap-2.5">
            {product.badge && (
              <span className="border border-champagne/40 px-2.5 py-1 font-sans text-[8px] uppercase text-champagne"
                style={{ letterSpacing: '.22em' }}>{product.badge}</span>
            )}
            <span className="font-sans text-[8.5px] uppercase text-cream/35" style={{ letterSpacing: '.26em' }}>
              {product.category}
            </span>
          </div>

          <h2 className="display mt-3.5 text-[30px] leading-[1.02] text-cream sm:text-[38px]">{product.name}</h2>

          <div className="mt-3 flex items-center gap-2.5">
            <Stars value={product.rating} size={12} />
            <span className="font-sans text-[10px] text-cream/40">{product.rating} · {product.reviews} reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-[34px] text-champagne">{inr(product.price)}</span>
            <span className="font-sans text-[13px] text-cream/25 line-through">{inr(product.mrp)}</span>
            <span className="border border-emerald-400/30 px-2 py-0.5 font-sans text-[8.5px] uppercase text-emerald-300/85"
              style={{ letterSpacing: '.16em' }}>SAVE {save}%</span>
          </div>

          <p className="mt-5 font-sans text-[12.5px] font-light leading-[1.95] text-cream/55">{product.blurb}</p>

          {/* qty + actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-champagne/20">
              <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))}>−</QtyBtn>
              <span className="w-10 text-center font-sans text-[12px] text-cream/85">{qty}</span>
              <QtyBtn onClick={() => setQty((q) => Math.min(99, q + 1))}>+</QtyBtn>
            </div>
            <button onClick={handleAdd} className="btn-gold flex-1">ADD TO CART</button>
          </div>

          <div className="mt-2.5 flex gap-2.5">
            <button onClick={handleBuy} className="btn-ghost flex-1">BUY NOW</button>
            <button onClick={() => toggleWish(product.id)}
              className={`flex w-12 items-center justify-center border transition-colors ${
                wished ? 'border-red-400/40 text-red-400' : 'border-champagne/25 text-cream/50 hover:text-champagne'
              }`}>
              <IconHeart filled={wished} size={16} />
            </button>
          </div>

          <a href={waLink(productWaMessage(product, qty))} target="_blank" rel="noreferrer" className="btn-wa mt-2.5 w-full">
            <IconWhatsApp size={14} /> ORDER ON WHATSAPP
          </a>

          <p className="mt-3.5 font-sans text-[9px] uppercase leading-relaxed text-cream/28" style={{ letterSpacing: '.18em' }}>
            FREE SHIPPING ABOVE ₹1,499 · DISPATCH IN 24–48 HRS · 2-YEAR WARRANTY
          </p>

          {/* tabs */}
          <div className="mt-7 flex gap-5 border-b border-champagne/12">
            {[['story', 'THE PIECE'], ['specs', 'SPECS'], ['reviews', 'REVIEWS']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`relative pb-3 font-sans text-[9.5px] uppercase transition-colors ${
                  tab === k ? 'text-champagne' : 'text-cream/35 hover:text-cream/65'
                }`} style={{ letterSpacing: '.22em' }}>
                {l}
                {tab === k && <motion.span layoutId="tabline" className="absolute inset-x-0 -bottom-px h-px bg-champagne" />}
              </button>
            ))}
          </div>

          <div className="pt-5">
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}>
                {tab === 'story' && (
                  <p className="font-sans text-[12px] font-light leading-[2] text-cream/50">{product.story}</p>
                )}
                {tab === 'specs' && (
                  <dl className="space-y-2.5">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-5 border-b border-champagne/8 pb-2.5">
                        <dt className="shrink-0 font-sans text-[9px] uppercase text-cream/35" style={{ letterSpacing: '.18em' }}>{k}</dt>
                        <dd className="text-right font-sans text-[11.5px] text-cream/70">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {tab === 'reviews' && (
                  <ul className="space-y-5">
                    {reviews.map((r) => (
                      <li key={r.name} className="border-b border-champagne/8 pb-4">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-display text-[15px] text-cream/85">{r.name}</span>
                          <Stars value={r.rating} size={10} />
                        </div>
                        <p className="mb-1.5 font-sans text-[8.5px] uppercase text-cream/28" style={{ letterSpacing: '.2em' }}>
                          {r.city} · VERIFIED BUYER
                        </p>
                        <p className="font-sans text-[11.5px] font-light leading-[1.9] text-cream/50">{r.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* related */}
          <div className="mt-8">
            <p className="eyebrow mb-4">YOU MAY ALSO LIKE</p>
            <div className="grid grid-cols-2 gap-3">
              {rel.slice(0, 4).map((r) => (
                <button key={r.id} onClick={() => openDetail(r.id)}
                  className="group border border-champagne/10 bg-black/35 p-2 text-left transition-colors hover:border-champagne/35">
                  <ProductThumb product={r} height={96} />
                  <p className="mt-2 truncate font-display text-[13px] text-cream/85">{r.short}</p>
                  <p className="font-sans text-[10.5px] text-champagne">{inr(r.price)}</p>
                </button>
              ))}
            </div>
          </div>

          <Rule className="mt-9" w={140} />
          <p className="mt-4 text-center font-sans text-[8.5px] uppercase text-cream/22" style={{ letterSpacing: '.3em' }}>
            SD LIVING · LIGHT UP YOUR SPACE
          </p>
        </div>
      </motion.aside>
    </motion.div>
  )
}

const Ctrl = ({ children, active, onClick }) => (
  <button onClick={onClick}
    className={`border px-3 py-2 font-sans text-[8.5px] uppercase transition-all duration-400 ${
      active ? 'border-champagne/70 bg-champagne/14 text-champagne' : 'border-champagne/14 text-cream/50 hover:border-champagne/40 hover:text-cream/85'
    }`} style={{ letterSpacing: '.2em' }}>
    {children}
  </button>
)

const QtyBtn = ({ children, onClick }) => (
  <button onClick={onClick}
    className="flex h-10 w-9 items-center justify-center text-[15px] text-cream/55 transition-colors hover:bg-champagne/10 hover:text-champagne">
    {children}
  </button>
)

function Slider({ label, right, value, onChange, title }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-sans text-[8px] uppercase text-cream/35" style={{ letterSpacing: '.2em' }}>{title}</span>
        <span className="font-sans text-[8px] text-champagne/70">{Math.round(value * 100)}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-sans text-[7.5px] uppercase text-cream/30" style={{ letterSpacing: '.14em' }}>{label}</span>
        <input type="range" min="0" max="1" step="0.01" value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1" />
        <span className="font-sans text-[7.5px] uppercase text-cream/30" style={{ letterSpacing: '.14em' }}>{right}</span>
      </div>
    </div>
  )
}

function ViewerSkeleton({ product }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ink">
      <div className="w-[min(70vw,460px)]">
        <ProductThumb product={product} height={440} />
      </div>
    </div>
  )
}

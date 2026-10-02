import React, { useRef, useState, useMemo, lazy, Suspense } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Rule, Stars, IconHeart, IconWhatsApp, SDMark, Wordmark, WHY_ICONS } from './Brand'
import ProductThumb from './ProductThumb'
import { useStore, waLink, productWaMessage, filterProducts } from '../store/useStore'
import {
  PRODUCTS, FEATURED, CATEGORIES, ROOMS, REVIEWS, FAQ, WHY,
  bestsellers, newArrivals, inr, WHATSAPP_DISPLAY,
} from '../data/products'
import { useInView, useScrollProgress, scrollToId, useOnceInView } from '../hooks'

const ProductViewer = lazy(() => import('../three/ProductViewer'))
const GiftScene = lazy(() => import('../three/GiftScene'))
const WhyScene = lazy(() => import('../three/WhyScene'))

const EASE = [0.22, 1, 0.36, 1]

// No blur filter here on purpose: animating `filter` on dozens of
// nodes is the single most expensive reveal you can ship to a phone.
const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.95, delay: i * 0.07, ease: EASE },
  }),
}

const VP = { once: true, amount: 0.05 }

export function SectionHead({ eyebrow, title, sub, align = 'center', gold }) {
  return (
    <motion.div
      initial="hidden" whileInView="show" viewport={VP}
      className={align === 'center' ? 'mx-auto max-w-[700px] text-center' : 'max-w-[640px]'}
    >
      {eyebrow && <motion.p variants={rise} className="eyebrow mb-4">{eyebrow}</motion.p>}
      <motion.h2 variants={rise} custom={1}
        className="display whitespace-pre-line text-[34px] leading-[1.02] text-cream sm:text-[48px] lg:text-[56px]">
        {gold ? <span className="gold-text">{title}</span> : title}
      </motion.h2>
      <motion.div variants={rise} custom={2}>
        <Rule className={`my-6 ${align === 'center' ? '' : '!justify-start'}`} w={align === 'center' ? 180 : 120} />
      </motion.div>
      {sub && (
        <motion.p variants={rise} custom={3}
          className={`font-sans text-[13px] font-light leading-[2] text-cream/50 ${align === 'center' ? 'mx-auto max-w-[520px]' : 'max-w-[460px]'}`}>
          {sub}
        </motion.p>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════
//  SEE IT IN YOUR SPACE
// ═══════════════════════════════════════════════
export function SeeInSpace() {
  const ref = useRef(null)
  const inView = useInView(ref, { rootMargin: '300px' })
  const quality = useStore((s) => s.quality)
  const webglOK = useStore((s) => s.webglOK)
  const [roomIdx, setRoomIdx] = useState(1)
  const [prodIdx, setProdIdx] = useState(0)
  const product = FEATURED[prodIdx]
  const room = ROOMS[roomIdx]

  return (
    <section ref={ref} id="spaces" className="relative border-t border-champagne/8 px-6 py-20 sm:px-10 lg:py-24">
      <SectionHead
        eyebrow="LIGHTING SIMULATION"
        title={'SEE THE LIGHT\nBEFORE YOU BUY'}
        sub="The same piece, five real rooms. Watch how the walls, the wood and the shadows change as the light adapts to each space."
      />

      <div className="mx-auto mt-10 max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={VP} transition={{ duration: 1.2, ease: EASE }}
          className="glass relative overflow-hidden"
        >
          <div className="relative h-[46vh] min-h-[300px] w-full sm:h-[52vh] sm:max-h-[520px]">
            {webglOK && inView ? (
              <Suspense fallback={<div className="h-full w-full bg-black/60" />}>
                <ProductViewer
                  product={product} on brightness={room.intensity * 0.72} temp={room.temp}
                  room={room} darkRoom={false} autoRotate={false} zoom={1}
                  quality={quality} interactive={false}
                  camRadius={5.0} camHeight={2.45}
                />
              </Suspense>
            ) : (
              <div className="flex h-full items-center justify-center bg-black/60">
                <div className="w-[min(60vw,340px)]"><ProductThumb product={product} height={300} /></div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 vignette" />

            {/* room caption */}
            <motion.div key={room.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
              className="absolute bottom-5 left-5 max-w-[300px] sm:bottom-7 sm:left-7">
              <p className="eyebrow mb-1.5 !text-champagne">{room.label}</p>
              <p className="font-sans text-[11px] font-light leading-[1.85] text-cream/55">{room.desc}</p>
            </motion.div>

            <div className="absolute right-5 top-5 sm:right-7 sm:top-7">
              <p className="mb-2 text-right font-sans text-[8px] uppercase text-cream/30" style={{ letterSpacing: '.24em' }}>
                NOW SHOWING
              </p>
              <div className="flex flex-wrap justify-end gap-1.5">
                {FEATURED.map((p, i) => (
                  <button key={p.id} onClick={() => setProdIdx(i)}
                    className={`border px-2.5 py-1.5 font-sans text-[8px] uppercase transition-all duration-400 ${
                      i === prodIdx ? 'border-champagne/70 bg-champagne/14 text-champagne' : 'border-champagne/14 bg-black/40 text-cream/45 hover:text-cream/80'
                    }`} style={{ letterSpacing: '.16em' }}>
                    {p.short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* room switcher */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-champagne/10 bg-black/40 px-4 py-4 sm:justify-center sm:px-6">
            {ROOMS.map((r, i) => (
              <button key={r.id} onClick={() => setRoomIdx(i)}
                className={`group relative shrink-0 border px-5 py-3 font-sans text-[9px] uppercase transition-all duration-500 ${
                  i === roomIdx ? 'border-champagne/70 text-champagne' : 'border-champagne/14 text-cream/45 hover:border-champagne/35 hover:text-cream/80'
                }`} style={{ letterSpacing: '.24em' }}>
                {i === roomIdx && (
                  <motion.span layoutId="roomchip" className="absolute inset-0 bg-champagne/12"
                    transition={{ duration: 0.55, ease: EASE }} />
                )}
                <span className="relative">{r.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════
//  WHY SD LIVING
// ═══════════════════════════════════════════════
export function WhySection({ pointer }) {
  const ref = useRef(null)
  const inView = useOnceInView(ref, { rootMargin: '250px' })
  const quality = useStore((s) => s.quality)
  const webglOK = useStore((s) => s.webglOK)

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-champagne/8 px-6 py-24 sm:px-10 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,39,.07), transparent 70%)' }}
      />
      <SectionHead eyebrow="WHY SD LIVING" title={'MORE THAN\nJUST A LIGHT.'} />

      {webglOK && quality !== 'low' ? (
        <div className="relative mx-auto mt-6 h-[420px] max-w-[1400px] sm:h-[460px]">
          {inView && (
            <Suspense fallback={null}>
              <WhyScene pointer={pointer} quality={quality} />
            </Suspense>
          )}
        </div>
      ) : (
        <div className="mx-auto mt-14 grid max-w-[1100px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w, i) => {
            const Icon = WHY_ICONS[w.id]
            return (
              <motion.div key={w.id} variants={rise} custom={i} initial="hidden" whileInView="show"
                viewport={VP} className="flex flex-col items-center text-center">
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-champagne/25">
                  <Icon width={28} height={28} />
                </span>
                <p className="eyebrow !text-champagne">{w.title}</p>
                <p className="mt-2.5 max-w-[210px] font-sans text-[11px] font-light leading-[1.9] text-cream/45">{w.desc}</p>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════════
//  GIFTING
// ═══════════════════════════════════════════════
export function GiftSection() {
  const ref = useRef(null)
  const progress = useRef(0)
  const inView = useInView(ref, { rootMargin: '300px' })
  const quality = useStore((s) => s.quality)
  const webglOK = useStore((s) => s.webglOK)
  useScrollProgress(ref, (v) => { progress.current = v })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const textOpacity = useTransform(scrollYProgress, [0.42, 0.58, 0.92, 1], [0, 1, 1, 0.4])
  const textY = useTransform(scrollYProgress, [0.42, 0.62], [40, 0])

  return (
    <section ref={ref} id="gifting" className="relative border-t border-champagne/8" style={{ height: '280vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 58% 48% at 50% 62%, rgba(226,118,27,.13), transparent 72%)' }}
        />

        <div className="absolute inset-0">
          {webglOK && inView ? (
            <Suspense fallback={null}>
              <GiftScene progress={progress} quality={quality} />
            </Suspense>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-0 vignette" />

        <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-24 text-center sm:pt-28">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VP}
            transition={{ duration: 1 }} className="eyebrow">THE GIFTING EXPERIENCE</motion.p>
        </div>

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-x-0 bottom-0 px-6 pb-14 text-center sm:pb-16"
        >
          <h2 className="display text-[34px] leading-[1.02] sm:text-[52px] lg:text-[62px]">
            <span className="gold-text">LIGHT UP SOMEONE'S WORLD</span>
          </h2>
          <Rule className="my-5" w={190} />
          <p className="mx-auto max-w-[480px] font-sans text-[12.5px] font-light leading-[2] text-cream/55">
            Beautiful lamps. Meaningful designs. Memorable gifts.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => scrollToId('shop')} className="btn-gold">SHOP GIFT COLLECTION</button>
            <button onClick={() => scrollToId('bestsellers')} className="btn-ghost">BESTSELLERS</button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════
//  ABOUT
// ═══════════════════════════════════════════════
export function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { rootMargin: '250px' })
  const quality = useStore((s) => s.quality)
  const webglOK = useStore((s) => s.webglOK)
  const product = FEATURED[2]

  return (
    <section ref={ref} id="about" className="relative border-t border-champagne/8">
      <div className="grid lg:grid-cols-2">
        <div className="relative h-[52vh] min-h-[340px] lg:h-auto lg:min-h-[620px]">
          {webglOK && inView ? (
            <Suspense fallback={<div className="h-full w-full bg-black/60" />}>
              <ProductViewer
                product={product} on brightness={0.82} temp={0.14}
                room={ROOMS[1]} darkRoom={false} autoRotate={false} zoom={1}
                quality={quality} interactive={false}
                camRadius={4.9} camHeight={2.4}
              />
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center bg-black/60">
              <div className="w-[min(60vw,320px)]"><ProductThumb product={product} height={300} /></div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 vignette" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-r from-transparent to-ink lg:block" />
        </div>

        <div className="flex items-center px-6 py-20 sm:px-12 lg:px-16 lg:py-28">
          <div>
            <SectionHead
              align="left"
              eyebrow="OUR PHILOSOPHY"
              title={'WE BELIEVE LIGHT\nIS MORE THAN\nILLUMINATION.'}
            />
            <motion.p variants={rise} initial="hidden" whileInView="show" viewport={VP} custom={4}
              className="max-w-[460px] font-sans text-[13px] font-light leading-[2.1] text-cream/55">
              At SD LIVING, we create artistic lamps that combine light, design and emotion.
              Every piece is designed to add warmth, personality and meaning to the spaces you live in.
            </motion.p>

            <motion.div variants={rise} initial="hidden" whileInView="show" viewport={VP} custom={5}
              className="mt-10 grid max-w-[460px] grid-cols-3 gap-6">
              {[['12K+', 'HOMES LIT'], ['4.9★', 'AVERAGE RATING'], ['48H', 'DISPATCH']].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-[30px] leading-none text-champagne">{n}</p>
                  <p className="mt-1.5 font-sans text-[8px] uppercase text-cream/35" style={{ letterSpacing: '.22em' }}>{l}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={rise} initial="hidden" whileInView="show" viewport={VP} custom={6}
              className="mt-10 flex flex-wrap gap-3">
              <button onClick={() => scrollToId('shop')} className="btn-gold">EXPLORE THE CATALOGUE</button>
              <a href={waLink('Hello SD LIVING 👋 I would like to know more about your brand.')}
                target="_blank" rel="noreferrer" className="btn-wa">
                <IconWhatsApp size={14} /> CHAT WITH US
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════
//  SHOP — catalogue, search, filters, sorting
// ═══════════════════════════════════════════════
export function ShopSection() {
  const query = useStore((s) => s.query)
  const setQuery = useStore((s) => s.setQuery)
  const category = useStore((s) => s.category)
  const setCategory = useStore((s) => s.setCategory)
  const sort = useStore((s) => s.sort)
  const setSort = useStore((s) => s.setSort)
  const maxPrice = useStore((s) => s.maxPrice)
  const setMaxPrice = useStore((s) => s.setMaxPrice)
  const list = useMemo(() => filterProducts({ query, category, sort, maxPrice }), [query, category, sort, maxPrice])

  return (
    <section id="shop" className="relative border-t border-champagne/8 px-6 py-24 sm:px-10 lg:py-32">
      <SectionHead
        eyebrow="THE CATALOGUE"
        title={'EVERY PIECE\nWE MAKE'}
        sub="Twelve designs across four collections — modern, spiritual, motivational and artistic. Filter, sort, and open any piece in the 3D viewer."
      />

      {/* controls */}
      <div className="mx-auto mt-12 max-w-[1400px]">
        <div className="glass flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pieces…"
            className="field !w-full lg:!w-[240px]" />

          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {['ALL', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`relative shrink-0 border px-4 py-2.5 font-sans text-[9px] uppercase transition-all duration-400 ${
                  category === c ? 'border-champagne/70 text-champagne' : 'border-champagne/14 text-cream/45 hover:border-champagne/35 hover:text-cream/80'
                }`} style={{ letterSpacing: '.22em' }}>
                {category === c && <motion.span layoutId="catchip" className="absolute inset-0 bg-champagne/12" transition={{ duration: 0.5, ease: EASE }} />}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2.5">
              <span className="whitespace-nowrap font-sans text-[8.5px] uppercase text-cream/35" style={{ letterSpacing: '.18em' }}>
                UNDER {inr(maxPrice)}
              </span>
              <input type="range" min="1000" max="5000" step="100" value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-24" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="field !w-auto !py-2.5 !text-[10px] uppercase" style={{ letterSpacing: '.14em' }}>
              <option value="featured">FEATURED</option>
              <option value="newest">NEW ARRIVALS</option>
              <option value="price-asc">PRICE: LOW → HIGH</option>
              <option value="price-desc">PRICE: HIGH → LOW</option>
              <option value="rating">TOP RATED</option>
            </select>
          </div>
        </div>

        <p className="mt-4 font-sans text-[9px] uppercase text-cream/30" style={{ letterSpacing: '.22em' }}>
          {list.length} PIECE{list.length === 1 ? '' : 'S'}
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>

        {list.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-cream/60">Nothing matches those filters.</p>
            <button onClick={() => { setQuery(''); setCategory('ALL'); setMaxPrice(5000) }}
              className="btn-ghost mt-6">RESET FILTERS</button>
          </div>
        )}
      </div>
    </section>
  )
}

export function ProductCard({ product, index = 0 }) {
  const openDetail = useStore((s) => s.openDetail)
  const addToCart = useStore((s) => s.addToCart)
  const toggleWish = useStore((s) => s.toggleWish)
  const wished = useStore((s) => s.wishlist.includes(product.id))
  const launchFlight = useStore((s) => s.launchFlight)
  const notify = useStore((s) => s.notify)
  const ref = useRef(null)

  const add = (e) => {
    e.stopPropagation()
    addToCart(product.id)
    const r = ref.current?.getBoundingClientRect()
    if (r) launchFlight({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    notify({ title: 'ADDED TO CART', body: product.short })
  }

  return (
    <motion.article
      ref={ref}
      variants={rise} custom={index % 4} initial="hidden" whileInView="show" viewport={VP}
      onClick={() => openDetail(product.id)}
      className="group relative cursor-pointer overflow-hidden border border-champagne/10 bg-gradient-to-b from-charcoal/60 to-ink transition-all duration-700 hover:border-champagne/35"
      style={{ boxShadow: '0 20px 60px -30px rgba(0,0,0,.9)' }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,162,39,.12), transparent 70%)' }} />

      {product.badge && (
        <span className="absolute left-3 top-3 z-20 border border-champagne/40 bg-black/60 px-2.5 py-1 font-sans text-[7.5px] uppercase text-champagne backdrop-blur"
          style={{ letterSpacing: '.22em' }}>{product.badge}</span>
      )}

      <button onClick={(e) => { e.stopPropagation(); toggleWish(product.id) }}
        className={`absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center border border-champagne/15 bg-black/50 backdrop-blur transition-colors ${
          wished ? 'text-red-400' : 'text-cream/45 hover:text-champagne'
        }`} aria-label="Wishlist">
        <IconHeart filled={wished} size={14} />
      </button>

      <div className="relative transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]">
        <ProductThumb product={product} height={250} />
      </div>

      <div className="relative p-5">
        <p className="font-sans text-[8px] uppercase text-cream/30" style={{ letterSpacing: '.26em' }}>{product.category}</p>
        <h3 className="mt-2 font-display text-[19px] leading-tight text-cream/90 transition-colors duration-500 group-hover:text-champagne">
          {product.short}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <Stars value={product.rating} size={10} />
          <span className="font-sans text-[9px] text-cream/30">({product.reviews})</span>
        </div>
        <p className="mt-3 line-clamp-2 font-sans text-[11px] font-light leading-[1.8] text-cream/40">{product.blurb}</p>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-display text-[23px] text-champagne">{inr(product.price)}</span>
          <span className="font-sans text-[11px] text-cream/22 line-through">{inr(product.mrp)}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={add} className="btn-gold !px-2 !py-2.5 !text-[8.5px]">ADD TO CART</button>
          <a href={waLink(productWaMessage(product, 1))} target="_blank" rel="noreferrer"
            onClick={(e) => e.stopPropagation()} className="btn-wa !px-2 !py-2.5 !text-[8.5px]">
            <IconWhatsApp size={12} /> WHATSAPP
          </a>
        </div>
      </div>
    </motion.article>
  )
}

// ── Best sellers / new arrivals rails ───────────
export function Rail({ id, eyebrow, title, items }) {
  return (
    <section id={id} className="border-t border-champagne/8 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h2 className="display text-[30px] leading-none text-cream sm:text-[40px]">{title}</h2>
          </div>
          <button onClick={() => scrollToId('shop')} className="btn-ghost">VIEW ALL</button>
        </div>
        <div className="no-scrollbar -mx-6 flex gap-5 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0">
          {items.map((p, i) => (
            <div key={p.id} className="w-[280px] shrink-0 sm:w-[310px]">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════
export function ReviewsSection() {
  return (
    <section className="relative border-t border-champagne/8 px-6 py-24 sm:px-10 lg:py-28">
      <SectionHead eyebrow="12,000+ LIT HOMES" title={'WHAT THEY SAY\nAFTER DARK.'} />
      <div className="mx-auto mt-14 grid max-w-[1300px] gap-5 md:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <motion.figure key={r.name} variants={rise} custom={i % 3} initial="hidden" whileInView="show"
            viewport={VP}
            className="glass flex flex-col p-6">
            <Stars value={r.rating} size={12} className="mb-4" />
            <blockquote className="flex-1 font-sans text-[12.5px] font-light leading-[2] text-cream/60">
              “{r.text}”
            </blockquote>
            <figcaption className="mt-5 border-t border-champagne/10 pt-4">
              <p className="font-display text-[16px] text-cream/85">{r.name}</p>
              <p className="mt-1 font-sans text-[8.5px] uppercase text-cream/32" style={{ letterSpacing: '.2em' }}>
                {r.city} · {r.product}
              </p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════
//  FAQ
// ═══════════════════════════════════════════════
export function FaqSection() {
  const [open, setOpen] = useState(0)
  return (
    <section className="border-t border-champagne/8 px-6 py-24 sm:px-10">
      <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[.9fr_1.1fr]">
        <SectionHead align="left" eyebrow="GOOD TO KNOW" title={'QUESTIONS,\nANSWERED.'}
          sub={`Still unsure? Message us on WhatsApp at ${WHATSAPP_DISPLAY} — we usually reply within minutes.`} />
        <div>
          {FAQ.map((f, i) => (
            <div key={f.q} className="border-b border-champagne/10">
              <button onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left">
                <span className={`font-display text-[19px] transition-colors duration-400 ${open === i ? 'text-champagne' : 'text-cream/80'}`}>
                  {f.q}
                </span>
                <span className={`shrink-0 text-champagne/70 transition-transform duration-500 ${open === i ? 'rotate-45' : ''}`}>＋</span>
              </button>
              <motion.div initial={false}
                animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.55, ease: EASE }} className="overflow-hidden">
                <p className="pb-6 pr-8 font-sans text-[12px] font-light leading-[2] text-cream/50">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════
//  CLOSING CTA + FOOTER
// ═══════════════════════════════════════════════
export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden border-t border-champagne/8 px-6 py-28 text-center sm:py-36">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 52% 60% at 50% 50%, rgba(226,118,27,.16), transparent 68%)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
        viewport={VP} transition={{ duration: 1.3, ease: EASE }} className="relative">
        <SDMark size={54} className="mx-auto" />
        <h2 className="display mt-8 text-[42px] leading-[0.98] sm:text-[74px] lg:text-[92px]">
          <span className="gold-text">LIGHT UP YOUR SPACE</span>
        </h2>
        <Rule className="my-8" w={220} />
        <p className="mx-auto max-w-[460px] font-sans text-[13px] font-light leading-[2] text-cream/50">
          This is not just a lamp store. This is a luxury lighting experience.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button onClick={() => scrollToId('shop')} className="btn-gold !px-10 !py-4">SHOP SD LIVING</button>
          <a href={waLink('Hello SD LIVING 👋 I would like to place an order.')} target="_blank" rel="noreferrer"
            className="btn-wa !px-10 !py-4"><IconWhatsApp size={15} /> ORDER ON WHATSAPP</a>
        </div>
      </motion.div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-champagne/10 bg-obsidian px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-[300px] font-sans text-[11.5px] font-light leading-[2] text-cream/40">
              Artistic lighting designed to transform ordinary spaces into extraordinary experiences.
              Handcrafted in India.
            </p>
            <a href={waLink('Hello SD LIVING 👋')} target="_blank" rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 text-[#7fe0a0] transition-colors hover:text-[#a8f0c0]">
              <IconWhatsApp size={16} />
              <span className="font-sans text-[12px]" style={{ letterSpacing: '.1em' }}>{WHATSAPP_DISPLAY}</span>
            </a>
          </div>

          <FooterCol title="SHOP" links={CATEGORIES.map((c) => ({ label: c, id: 'shop' }))} />
          <FooterCol title="EXPLORE" links={[
            { label: 'COLLECTIONS', id: 'collections' },
            { label: 'SEE IN YOUR SPACE', id: 'spaces' },
            { label: 'GIFTING', id: 'gifting' },
            { label: 'ABOUT', id: 'about' },
            { label: 'BESTSELLERS', id: 'bestsellers' },
          ]} />

          <div>
            <p className="eyebrow mb-5">NEWSLETTER</p>
            <p className="mb-4 font-sans text-[11.5px] font-light leading-[1.9] text-cream/40">
              New drops, early access and the occasional quiet discount.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input type="email" placeholder="your@email.com" className="field !py-3" />
              <button className="btn-gold shrink-0 !px-5">JOIN</button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-champagne/10 pt-7 sm:flex-row">
          <p className="font-sans text-[9px] uppercase text-cream/25" style={{ letterSpacing: '.24em' }}>
            © {new Date().getFullYear()} SD LIVING · ALL RIGHTS RESERVED
          </p>
          <div className="flex gap-7">
            {['PRIVACY', 'TERMS', 'SHIPPING', 'RETURNS'].map((l) => (
              <button key={l} className="font-sans text-[9px] uppercase text-cream/25 transition-colors hover:text-champagne"
                style={{ letterSpacing: '.24em' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="eyebrow mb-5">{title}</p>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <button onClick={() => scrollToId(l.id)}
              className="font-sans text-[11px] uppercase text-cream/45 transition-colors hover:text-champagne"
              style={{ letterSpacing: '.18em' }}>
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { bestsellers, newArrivals }

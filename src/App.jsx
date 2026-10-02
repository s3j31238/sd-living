import React, { useMemo, useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, MotionConfig } from 'framer-motion'
import Nav from './components/Nav'
import Experience from './components/Experience'
import EnterGate from './components/EnterGate'
import { GoldDefs, Rule } from './components/Brand'
import { WhatsAppFab, Toast, FlyToCart, WebGLFallback } from './components/Overlays'
import { CartPanel, WishlistPanel, SearchPanel, CheckoutPanel } from './components/Panels'
import ProductModal from './components/ProductModal'
import {
  SeeInSpace, WhySection, GiftSection, AboutSection, ShopSection,
  Rail, ReviewsSection, FaqSection, ClosingCTA, Footer,
} from './components/Sections'
import { bestsellers, newArrivals } from './data/products'
import { useStore } from './store/useStore'
import {
  detectCapability, useSmoothScroll, usePointer, useScrollProgress, useMagnetic, scrollToId,
} from './hooks'

// ─────────────────────────────────────────────────────────────
//  The cinematic act is 700vh of scroll driving one 3D scene.
//  Captions are fixed overlays whose opacity is a function of
//  scroll progress, so nothing re-renders React at 60fps.
// ─────────────────────────────────────────────────────────────

function Caption({ p, from, to, children, className = '', interactive = false }) {
  const fade = Math.min((to - from) * 0.28, 0.05)
  const opacity = useTransform(p, [from, from + fade, to - fade, to], [0, 1, 1, 0])
  const y = useTransform(p, [from, from + fade, to - fade, to], [26, 0, 0, -26])
  const blur = useTransform(p, [from, from + fade, to - fade, to], [8, 0, 0, 8])
  const filter = useTransform(blur, (b) => `blur(${b}px)`)
  const display = useTransform(opacity, (o) => (o < 0.01 ? 'none' : 'flex'))

  return (
    <motion.div
      style={{ opacity, y, filter, display }}
      className={`fixed inset-0 z-20 items-center justify-center px-6 ${interactive ? '' : 'pointer-events-none'} ${className}`}
    >
      {children}
    </motion.div>
  )
}

function MagButton({ children, className = '', onClick, strength = 0.3, ...rest }) {
  const ref = useMagnetic(strength)
  return (
    <span ref={ref} className="inline-block will-change-transform">
      <button onClick={onClick} className={className} {...rest}>{children}</button>
    </span>
  )
}

function Hero({ p }) {
  const opacity = useTransform(p, [0, 0.055, 0.1], [1, 1, 0])
  const y = useTransform(p, [0, 0.1], [0, -60])
  const blur = useTransform(p, [0.04, 0.1], [0, 10])
  const filter = useTransform(blur, (b) => `blur(${b}px)`)
  const display = useTransform(opacity, (o) => (o < 0.01 ? 'none' : 'flex'))
  const entered = useStore((s) => s.entered)

  const line = { hidden: { opacity: 0, y: 26, filter: 'blur(9px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } }
  const t = (d) => ({ duration: 1.3, delay: d, ease: [0.22, 1, 0.36, 1] })

  return (
    <motion.div
      style={{ opacity, y, filter, display }}
      className="pointer-events-none fixed inset-0 z-20 flex items-end px-6 pb-24 sm:px-10 lg:items-center lg:px-16 lg:pb-0"
    >
      <div className="mx-auto w-full max-w-[1560px]">
        <motion.div
          initial="hidden"
          animate={entered ? 'show' : 'hidden'}
          className="max-w-[640px] lg:max-w-[600px]"
        >
          <motion.p variants={line} transition={t(0.5)} className="eyebrow mb-5">
            LUXURY DESIGNER LIGHTING · SINCE 2019
          </motion.p>

          <motion.h1 variants={line} transition={t(0.68)}
            className="display text-[54px] leading-[0.94] text-cream sm:text-[78px] lg:text-[92px]"
            style={{ letterSpacing: '0.04em' }}>
            SD LIVING
          </motion.h1>

          <motion.div variants={line} transition={t(0.82)} className="mt-4 mb-6 flex items-center gap-4">
            <span className="hairline w-14" />
            <span className="eyebrow !text-champagne">LIGHT UP YOUR SPACE</span>
          </motion.div>

          <motion.h2 variants={line} transition={t(0.96)}
            className="display text-[30px] leading-[1.06] sm:text-[42px] lg:text-[48px]">
            <span className="gold-text">“Luxury Lamps</span><br />
            <span className="gold-text">For Every Vibe”</span>
          </motion.h2>

          <motion.p variants={line} transition={t(1.12)}
            className="mt-6 max-w-[430px] font-sans text-[13px] font-light leading-[1.85] text-cream/55 sm:text-[14px]">
            Artistic lighting designed to transform ordinary spaces into extraordinary experiences.
          </motion.p>

          <motion.div variants={line} transition={t(1.28)}
            className="pointer-events-auto mt-9 flex flex-wrap items-center gap-3.5">
            <MagButton className="btn-gold" onClick={() => scrollToId('collections')}>
              EXPLORE COLLECTION
            </MagButton>
            <MagButton className="btn-ghost" onClick={() => scrollToId('shop')}>
              SHOP NOW
            </MagButton>
          </motion.div>

          <motion.div variants={line} transition={t(1.5)}
            className="mt-12 flex items-center gap-7 text-[9px] uppercase text-cream/35"
            style={{ letterSpacing: '0.24em' }}>
            <span>FREE SHIPPING ABOVE ₹1,499</span>
            <span className="hidden h-3 w-px bg-champagne/20 sm:block" />
            <span className="hidden sm:inline">2-YEAR WARRANTY</span>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: entered ? 1 : 0 }} transition={{ delay: 2, duration: 1.2 }}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5"
      >
        <span className="font-sans text-[8.5px] uppercase text-cream/35" style={{ letterSpacing: '0.42em' }}>SCROLL</span>
        <span className="relative block h-11 w-px overflow-hidden bg-champagne/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-transparent via-champagne to-transparent"
            animate={{ y: [-18, 44] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </motion.div>
  )
}

const ACTS = [
  {
    from: 0.145, to: 0.285,
    eyebrow: 'CHAPTER I',
    title: 'IT BEGINS IN\nDARKNESS.',
    body: 'Every SD LIVING piece is designed for the moment the room goes quiet — when a single warm source decides the mood of everything around it.',
  },
  {
    from: 0.295, to: 0.445,
    eyebrow: 'CHAPTER II',
    title: '360° OF\nHAND-CUT DETAIL.',
    body: 'Hairline bridges, 0.4 mm cuts, no visible joins. Turn the piece and the light redraws itself across every edge.',
  },
  {
    from: 0.455, to: 0.6,
    eyebrow: 'CHAPTER III',
    title: 'LIGHT THAT MOVES\nAROUND YOU.',
    body: 'Warm 2700K by default. The glow spreads across the wall, pools on the walnut and falls away into shadow exactly as it should.',
  },
  {
    from: 0.61, to: 0.755,
    eyebrow: 'CHAPTER IV',
    title: 'THE SHOWROOM\nAWAKENS.',
    body: 'One lamp becomes four. A dark room becomes a gallery. This is how an SD LIVING space comes together.',
  },
]

export default function App() {
  const cap = useMemo(() => {
    const c = detectCapability()
    const forced = new URLSearchParams(window.location.search).get('q')
    if (forced && ['high', 'medium', 'low'].includes(forced)) return { ...c, quality: forced, webgl: forced !== 'off' }
    return c
  }, [])
  const setQuality = useStore((s) => s.setQuality)
  const setWebglOK = useStore((s) => s.setWebglOK)
  const entered = useStore((s) => s.entered)

  useEffect(() => {
    setQuality(cap.quality)
    setWebglOK(cap.webgl)
  }, [cap, setQuality, setWebglOK])

  useSmoothScroll(!cap.reduced)
  const pointer = usePointer()

  const actRef = useRef(null)
  const progress = useRef(0)
  const p = useMotionValue(0)
  const [act3D, setAct3D] = useState(true)

  useScrollProgress(actRef, (v) => {
    progress.current = v
    p.set(v)
  })

  // keep the heavy canvas mounted only while the cinematic act is on screen
  useEffect(() => {
    const onScroll = () => {
      const el = actRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setAct3D(r.bottom > -window.innerHeight * 0.4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const showGallery = useTransform(p, [0.8, 0.88], [0, 1])

  return (
    <MotionConfig reducedMotion={cap.reduced ? 'always' : 'never'}>
      <GoldDefs />
      <EnterGate />
      <Nav />

      {cap.webgl ? (
        <Experience progress={progress} pointer={pointer} quality={cap.quality} visible={act3D} />
      ) : (
        <WebGLFallback />
      )}

      {/* grain + vignette over everything, always */}
      <div className="pointer-events-none fixed inset-0 z-[15] noise" />

      <main id="top" className="relative z-10">
        {/* ── THE CINEMATIC ACT ── */}
        <section ref={actRef} id="collections" className="relative" style={{ height: '700vh' }}>
          <Hero p={p} />

          {ACTS.map((a) => (
            <Caption key={a.eyebrow} p={p} from={a.from} to={a.to}>
              <div className="mx-auto w-full max-w-[1560px]">
                <div className="max-w-[500px] sm:ml-auto sm:mr-0 sm:text-right">
                  <p className="eyebrow mb-4">{a.eyebrow}</p>
                  <h3 className="display whitespace-pre-line text-[38px] leading-[1.02] text-cream sm:text-[54px]">
                    {a.title}
                  </h3>
                  <div className="my-5 flex sm:justify-end">
                    <span className="hairline w-20" />
                  </div>
                  <p className="font-sans text-[13px] font-light leading-[1.9] text-cream/50 sm:ml-auto sm:max-w-[380px]">
                    {a.body}
                  </p>
                </div>
              </div>
            </Caption>
          ))}

          {/* gallery header */}
          <Caption p={p} from={0.775} to={1.001} className="!items-start">
            <motion.div style={{ opacity: showGallery }} className="mx-auto w-full max-w-[1560px] pt-[104px] text-center sm:pt-[116px]">
              <p className="eyebrow mb-2.5">THE COLLECTION</p>
              <h3 className="display text-[30px] leading-none text-cream sm:text-[46px]">
                FOUR WAYS TO <span className="gold-text">LIGHT A ROOM</span>
              </h3>
              <Rule className="mt-4" w={150} />
            </motion.div>
          </Caption>

          <Caption p={p} from={0.83} to={1.001} className="!items-end">
            <motion.div style={{ opacity: showGallery }} className="w-full pb-9 text-center">
              <p className="mx-auto max-w-[400px] font-sans text-[10.5px] font-light leading-[1.9] text-cream/40">
                Hover any piece to bring it forward · tap to open the full 3D viewer
              </p>
            </motion.div>
          </Caption>
        </section>

        {/* everything below sits on solid ground */}
        <div className="relative z-10 bg-ink">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne/25 to-transparent" />
          <SeeInSpace />
          <Rail id="bestsellers" eyebrow="LOVED THE MOST" title="BESTSELLERS" items={bestsellers()} />
          <WhySection pointer={pointer} />
          <GiftSection />
          <ShopSection />
          <Rail id="new" eyebrow="JUST ARRIVED" title="NEW ARRIVALS" items={newArrivals()} />
          <AboutSection />
          <ReviewsSection />
          <FaqSection />
          <ClosingCTA />
          <Footer />
        </div>
      </main>

      <WhatsAppFab />
      <Toast />
      <FlyToCart />
      <CartPanel />
      <WishlistPanel />
      <SearchPanel />
      <CheckoutPanel />
      <ProductModal />
    </MotionConfig>
  )
}

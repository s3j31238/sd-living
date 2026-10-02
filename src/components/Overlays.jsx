import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconWhatsApp } from './Brand'
import { useStore, waLink } from '../store/useStore'
import { WHATSAPP_DISPLAY } from '../data/products'

// ── Floating WhatsApp CTA ───────────────────────
export function WhatsAppFab() {
  const msg = `Hello SD LIVING 👋  I'd like to know more about your lamps.`
  return (
    <motion.a
      href={waLink(msg)}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 2.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-5 right-5 z-[55] flex items-center gap-0 overflow-hidden rounded-full sm:bottom-7 sm:right-7"
      style={{
        background: 'linear-gradient(135deg, #1f8a4c, #25d366)',
        boxShadow: '0 14px 44px -10px rgba(37,211,102,.55), inset 0 1px 0 rgba(255,255,255,.3)',
      }}
      aria-label="Chat with us on WhatsApp"
    >
      <span className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center text-white">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-20" />
        <IconWhatsApp size={25} className="relative" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-sans text-[10px] uppercase text-white transition-all duration-500 group-hover:max-w-[190px] group-hover:pr-6"
        style={{ letterSpacing: '0.2em' }}>
        CHAT WITH US
      </span>
    </motion.a>
  )
}

// ── Toast ───────────────────────────────────────
export function Toast() {
  const toast = useStore((s) => s.toast)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[92px] z-[70] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong flex items-center gap-3 px-6 py-3.5"
          >
            <span className="h-1.5 w-1.5 rotate-45 bg-champagne" />
            <span className="font-sans text-[10px] uppercase text-champagne" style={{ letterSpacing: '0.26em' }}>
              {toast.title}
            </span>
            {toast.body && <span className="font-display text-[15px] text-cream/80">{toast.body}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Fly-to-cart ─────────────────────────────────
export function FlyToCart() {
  const flights = useStore((s) => s.flights)
  const endFlight = useStore((s) => s.endFlight)

  return (
    <div className="pointer-events-none fixed inset-0 z-[75]">
      <AnimatePresence>
        {flights.map((f) => <Flight key={f.key} f={f} onEnd={() => endFlight(f.key)} />)}
      </AnimatePresence>
    </div>
  )
}

function Flight({ f, onEnd }) {
  const target = useRef({ x: window.innerWidth - 90, y: 40 })
  useEffect(() => {
    const el = document.getElementById('cart-anchor')
    if (el) {
      const r = el.getBoundingClientRect()
      target.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
  }, [])

  return (
    <motion.span
      initial={{ x: f.x, y: f.y, opacity: 0, scale: 0.3 }}
      animate={{
        x: [f.x, (f.x + target.current.x) / 2, target.current.x],
        y: [f.y, Math.min(f.y, target.current.y) - 150, target.current.y],
        opacity: [0, 1, 1, 0],
        scale: [0.3, 1.15, 0.35],
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.05, ease: [0.3, 0.9, 0.4, 1], times: [0, 0.35, 1] }}
      onAnimationComplete={onEnd}
      className="absolute left-0 top-0 block h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background: 'radial-gradient(circle at 34% 30%, #fff6e0, #e6c98a 38%, #b8912a 72%, #6b5418)',
        boxShadow: '0 0 34px 10px rgba(255,180,90,.6)',
      }}
    />
  )
}

// ── Low-capability fallback ─────────────────────
export function WebGLFallback() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-ink">
      <div
        className="absolute inset-0 animate-pulse-slow"
        style={{
          background:
            'radial-gradient(ellipse 52% 44% at 50% 52%, rgba(255,168,78,.5) 0%, rgba(226,118,27,.2) 32%, rgba(10,8,7,0) 70%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[42%]"
        style={{ background: 'linear-gradient(180deg, rgba(59,42,29,0) 0%, rgba(59,42,29,.45) 40%, rgba(20,14,10,.9) 100%)' }}
      />
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 noise" />
    </div>
  )
}

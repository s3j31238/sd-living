import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wordmark, IconBag, IconHeart, IconSearch, IconClose } from './Brand'
import { useStore } from '../store/useStore'
import { scrollToId } from '../hooks'

const LINKS = [
  { label: 'HOME', id: 'top' },
  { label: 'SHOP', id: 'shop' },
  { label: 'COLLECTIONS', id: 'collections' },
  { label: 'ABOUT', id: 'about' },
  { label: 'GIFTING', id: 'gifting' },
]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const setPanel = useStore((s) => s.setPanel)
  const menuOpen = useStore((s) => s.menuOpen)
  const cart = useStore((s) => s.cart)
  const count = cart.reduce((n, l) => n + l.qty, 0)
  const wishCount = useStore((s) => s.wishlist.length)
  const bump = useStore((s) => s.cartBump)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.55)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id) => {
    setPanel(null)
    if (id === 'top') window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: 'smooth' })
    else scrollToId(id)
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40"
      >
        <div
          className="transition-all duration-700"
          style={{
            background: solid
              ? 'linear-gradient(180deg, rgba(8,7,6,.92) 0%, rgba(8,7,6,.72) 100%)'
              : 'linear-gradient(180deg, rgba(5,4,3,.55) 0%, rgba(5,4,3,0) 100%)',
            backdropFilter: solid ? 'blur(20px) saturate(140%)' : 'blur(0px)',
            WebkitBackdropFilter: solid ? 'blur(20px) saturate(140%)' : 'blur(0px)',
            borderBottom: `1px solid rgba(230,201,138,${solid ? 0.13 : 0})`,
          }}
        >
          <nav className="mx-auto flex max-w-[1560px] items-center justify-between px-5 sm:px-8 lg:px-12"
            style={{ height: solid ? 68 : 88, transition: 'height .7s cubic-bezier(.22,1,.36,1)' }}>
            <button onClick={() => go('top')} className="shrink-0">
              <Wordmark compact={solid} />
            </button>

            <ul className="hidden items-center gap-9 lg:flex">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => go(l.id)}
                    className="group relative py-2 font-sans text-[10.5px] font-light uppercase text-cream/65 transition-colors duration-400 hover:text-champagne"
                    style={{ letterSpacing: '0.28em' }}
                  >
                    {l.label}
                    <span className="absolute -bottom-0 left-0 h-px w-0 bg-gradient-to-r from-transparent via-champagne to-transparent transition-all duration-500 group-hover:w-full" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <IconBtn label="Search" onClick={() => setPanel('searchOpen')}>
                <IconSearch />
              </IconBtn>
              <IconBtn label="Wishlist" onClick={() => setPanel('wishOpen')} badge={wishCount}>
                <IconHeart />
              </IconBtn>
              <motion.div key={bump} animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 0.55 }}>
                <IconBtn label="Cart" onClick={() => setPanel('cartOpen')} badge={count} id="cart-anchor">
                  <IconBag />
                </IconBtn>
              </motion.div>
              <button
                onClick={() => setPanel('menuOpen')}
                aria-label="Menu"
                className="ml-1 flex h-9 w-9 items-center justify-center text-cream/70 transition-colors hover:text-champagne lg:hidden"
              >
                <span className="flex flex-col gap-[5px]">
                  <span className="block h-px w-5 bg-current" />
                  <span className="block h-px w-5 bg-current" />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setPanel(null)} />
            <motion.div
              initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong absolute inset-x-4 top-4 p-7 noise"
            >
              <div className="mb-7 flex items-start justify-between">
                <Wordmark />
                <button onClick={() => setPanel(null)} className="p-2 text-cream/60"><IconClose size={18} /></button>
              </div>
              <ul className="space-y-1">
                {LINKS.map((l, i) => (
                  <motion.li key={l.label}
                    initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.5 }}>
                    <button onClick={() => go(l.id)}
                      className="block w-full border-b border-champagne/10 py-4 text-left font-display text-2xl text-cream/85">
                      {l.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function IconBtn({ children, onClick, badge, label, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center text-cream/70 transition-all duration-400 hover:text-champagne"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-gradient-to-br from-champagne to-gold px-1 text-[8.5px] font-medium text-ink">
          {badge}
        </span>
      )}
    </button>
  )
}

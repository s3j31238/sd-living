import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'

// ── WebGL capability + device tier ──────────────
export function detectCapability() {
  if (typeof window === 'undefined') return { webgl: false, quality: 'low' }
  let gl = null
  let canvas
  try {
    canvas = document.createElement('canvas')
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  } catch {
    gl = null
  }
  if (!gl) return { webgl: false, quality: 'low' }

  const dbg = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
  const mem = navigator.deviceMemory || 4
  const cores = navigator.hardwareConcurrency || 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 780
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const software = /swiftshader|llvmpipe|software/i.test(renderer)

  let quality = 'high'
  if (software) quality = 'low'
  else if (coarse || small || mem <= 4 || cores <= 4) quality = 'medium'
  if (mem <= 2 || cores <= 2) quality = 'low'

  return { webgl: true, quality, reduced, touch: coarse, renderer }
}

// ── Lenis smooth scrolling ──────────────────────
export function useSmoothScroll(enabled = true) {
  const lenisRef = useRef(null)
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.4,
      wheelMultiplier: 0.9,
    })
    lenisRef.current = lenis
    window.__lenis = lenis
    let raf
    const loop = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [enabled])
  return lenisRef
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -10, duration: 1.8 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

// ── Normalised pointer (mouse + touch), smoothed ──
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 })
  const raw = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const set = (cx, cy) => {
      raw.current.x = (cx / window.innerWidth) * 2 - 1
      raw.current.y = -((cy / window.innerHeight) * 2 - 1)
    }
    const onMove = (e) => set(e.clientX, e.clientY)
    const onTouch = (e) => {
      if (e.touches && e.touches[0]) set(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onLeave = () => { raw.current.x = 0; raw.current.y = 0 }

    let raf
    const loop = () => {
      pointer.current.x += (raw.current.x - pointer.current.x) * 0.055
      pointer.current.y += (raw.current.y - pointer.current.y) * 0.055
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return pointer
}

// ── Scroll progress across an element (0–1) ─────
export function useScrollProgress(ref, onChange) {
  const progress = useRef(0)
  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total <= 0 ? 0 : Math.min(Math.max(-rect.top / total, 0), 1)
      progress.current = p
      onChange?.(p)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref, onChange])
  return progress
}

// ── In-view flag (for pausing offscreen canvases) ──
export function useInView(ref, { rootMargin = '200px', threshold = 0 } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin, threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, threshold])
  return inView
}

/** Latches true the first time the element is seen — avoids tearing
 *  down WebGL canvases (and their drei <Html> roots) on every scroll. */
export function useOnceInView(ref, opts) {
  const inView = useInView(ref, opts)
  const [seen, setSeen] = useState(false)
  useEffect(() => { if (inView) setSeen(true) }, [inView])
  return seen
}

// ── Magnetic button ─────────────────────────────
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    let raf
    const state = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      state.tx = (e.clientX - (r.left + r.width / 2)) * strength
      state.ty = (e.clientY - (r.top + r.height / 2)) * strength
    }
    const onLeave = () => { state.tx = 0; state.ty = 0 }
    const loop = () => {
      state.x += (state.tx - state.x) * 0.16
      state.y += (state.ty - state.y) * 0.16
      el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])
  return ref
}

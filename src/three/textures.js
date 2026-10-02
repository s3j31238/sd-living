import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────
//  SD LIVING — runtime texture generation
//  Art plates (Ganesha, Shiva, Devi, Ram, hands, floral…) are
//  pre-baked PNGs in /art. Text plates are generated here so
//  personalised engraving works without a round trip.
// ─────────────────────────────────────────────────────────────

let fontsReady = false
if (typeof document !== 'undefined' && document.fonts) {
  document.fonts.ready.then(() => (fontsReady = true))
}
export const areFontsReady = () => fontsReady

const textCache = new Map()

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function archPath(ctx, x, y, w, h) {
  const r = w / 2
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, 0)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

/**
 * Builds a laser-cut text plate.
 *  polarity 'cutout' → matte black plate, letters glow through (BORN TO BE…)
 *  polarity 'glow'   → glowing acrylic plate, letters printed black
 */
export function makeTextPanel({
  lines = [],
  polarity = 'cutout',
  shape = 'rect',
  script = null,
  key = '',
} = {}) {
  const ck = `${key}|${lines.join('~')}|${polarity}|${shape}|${script}|${fontsReady}`
  if (textCache.has(ck)) return textCache.get(ck)

  const W = 900
  const H = shape === 'wide' ? 620 : 1000
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  const pad = 26
  const px = pad
  const py = pad
  const pw = W - pad * 2
  const ph = H - pad * 2

  const plate = polarity === 'cutout' ? '#000000' : '#ffffff'
  const ink = polarity === 'cutout' ? '#ffffff' : '#000000'

  ctx.save()
  if (shape === 'arch') archPath(ctx, px, py, pw, ph)
  else roundRect(ctx, px, py, pw, ph, shape === 'wide' ? 34 : 46)
  ctx.fillStyle = plate
  ctx.fill()
  ctx.clip()

  // inner hairline frame
  ctx.strokeStyle = polarity === 'cutout' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 3
  if (shape === 'arch') archPath(ctx, px + 30, py + 30, pw - 60, ph - 60)
  else roundRect(ctx, px + 30, py + 30, pw - 60, ph - 60, 28)
  ctx.stroke()

  // ── lettering ──
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = ink

  const body = lines.filter(Boolean)
  const n = body.length
  const maxW = pw - 130
  const cx = W / 2
  const blockTop = script ? H * 0.40 : H * 0.5
  const size = n >= 3 ? 116 : n === 2 ? 138 : 158
  const gap = size * 1.18
  const startY = blockTop - ((n - 1) * gap) / 2

  body.forEach((line, i) => {
    let s = size
    ctx.font = `600 ${s}px "Cormorant Garamond", Didot, Georgia, serif`
    while (ctx.measureText(line).width > maxW && s > 28) {
      s -= 4
      ctx.font = `600 ${s}px "Cormorant Garamond", Didot, Georgia, serif`
    }
    ctx.fillText(line, cx, startY + i * gap)
  })

  if (script) {
    let s = 96
    ctx.font = `italic 400 ${s}px "Cormorant Garamond", Georgia, serif`
    while (ctx.measureText(script).width > maxW && s > 28) {
      s -= 4
      ctx.font = `italic 400 ${s}px "Cormorant Garamond", Georgia, serif`
    }
    const sy = startY + (n - 1) * gap + gap * 0.95
    ctx.fillText(script, cx, sy)
    // swash underline
    ctx.strokeStyle = ink
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    const sw = Math.min(ctx.measureText(script).width * 0.8, maxW * 0.7)
    ctx.beginPath()
    ctx.moveTo(cx - sw / 2, sy + s * 0.62)
    ctx.quadraticCurveTo(cx, sy + s * 0.82, cx + sw / 2, sy + s * 0.58)
    ctx.stroke()
  }

  // small flourish dot rule
  ctx.strokeStyle = ink
  ctx.globalAlpha = 0.75
  ctx.lineWidth = 2.5
  const ry = script ? H * 0.30 : startY - gap * 0.8
  ctx.beginPath()
  ctx.moveTo(cx - 110, ry)
  ctx.lineTo(cx - 18, ry)
  ctx.moveTo(cx + 18, ry)
  ctx.lineTo(cx + 110, ry)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, ry, 6, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.restore()

  // Build RGBA: alpha = plate silhouette, rgb = glow/ink map
  const shapeMask = document.createElement('canvas')
  shapeMask.width = W
  shapeMask.height = H
  const sctx = shapeMask.getContext('2d')
  if (shape === 'arch') archPath(sctx, px, py, pw, ph)
  else roundRect(sctx, px, py, pw, ph, shape === 'wide' ? 34 : 46)
  sctx.fillStyle = '#fff'
  sctx.fill()

  const img = ctx.getImageData(0, 0, W, H)
  const msk = sctx.getImageData(0, 0, W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i + 3] = msk.data[i] // alpha from plate silhouette
  }
  ctx.putImageData(img, 0, 0)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  textCache.set(ck, tex)
  return tex
}

// ── Procedural walnut ───────────────────────────
const woodCache = new Map()
export function makeWoodTexture(hex = '#4a3323') {
  if (woodCache.has(hex)) return woodCache.get(hex)
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, 512, 512)

  const base = new THREE.Color(hex)
  for (let i = 0; i < 210; i++) {
    const y = Math.random() * 512
    const light = (Math.random() - 0.5) * 0.4
    const col = base.clone().offsetHSL(0, (Math.random() - 0.5) * 0.05, light * 0.45)
    ctx.strokeStyle = `rgba(${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0},${0.16 + Math.random() * 0.42})`
    ctx.lineWidth = 0.5 + Math.random() * 3.6
    ctx.beginPath()
    ctx.moveTo(-20, y)
    let x = -20
    let yy = y
    while (x < 532) {
      x += 22
      yy += (Math.random() - 0.5) * 6
      ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  for (let k = 0; k < 3; k++) {
    const kx = Math.random() * 512
    const ky = Math.random() * 512
    for (let r = 4; r < 36; r += 3) {
      ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.07})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.ellipse(kx, ky, r, r * 0.5, Math.random() * 0.4, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  woodCache.set(hex, tex)
  return tex
}

// ── Soft radial sprite used for halos / dust ────
let glowTex = null
export function makeGlowSprite() {
  if (glowTex) return glowTex
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.16, 'rgba(255,214,150,0.6)')
  g.addColorStop(0.46, 'rgba(255,168,78,0.18)')
  g.addColorStop(1, 'rgba(255,150,60,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  glowTex = new THREE.CanvasTexture(c)
  return glowTex
}

/** 0 = deep warm 2700K … 1 = neutral 4000K, matched to the reference photography. */
export function tempColor(t) {
  const warm = new THREE.Color('#ff9430')
  const neutral = new THREE.Color('#fff4e2')
  return warm.clone().lerp(neutral, THREE.MathUtils.clamp(t, 0, 1))
}

/** Cool moonlight glow used by the cylinder lamps in the reference shots. */
export function coolColor(t) {
  const cool = new THREE.Color('#bfe4ff')
  const neutral = new THREE.Color('#ffffff')
  return cool.clone().lerp(neutral, THREE.MathUtils.clamp(t, 0, 1))
}

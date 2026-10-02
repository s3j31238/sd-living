import React from 'react'

/**
 * Renders the real laser-cut art plate as a product thumbnail.
 * The plates are black art + white glow on transparent alpha, so a
 * sepia/hue filter tints the glow amber (or cool) while the artwork
 * stays black — exactly how the physical lamp photographs.
 */
const TINT = {
  warm: 'sepia(1) saturate(4.2) hue-rotate(-14deg) brightness(1.06) contrast(1.05)',
  cool: 'sepia(1) saturate(2.6) hue-rotate(170deg) brightness(1.18) contrast(1.02)',
}

export function artSrc(design) {
  if (!design?.art) return null
  if (design.type === 'cylinder') return `/art/${design.art}_window.png`
  if (design.type === 'text') return null
  return `/art/${design.art}_panel.png`
}

export default function ProductThumb({ product, className = '', glow = true, height = 200 }) {
  const d = product.design
  const src = artSrc(d)
  const cool = d.spectrum === 'cool'
  const tint = cool ? TINT.cool : TINT.warm
  const glowColor = cool ? 'rgba(150,205,255,.34)' : 'rgba(255,164,74,.42)'

  return (
    <div className={`relative flex items-end justify-center overflow-hidden ${className}`} style={{ height }}>
      {/* warm pool behind the piece */}
      {glow && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 58% 46% at 50% 42%, ${glowColor} 0%, rgba(0,0,0,0) 68%)`,
          }}
        />
      )}

      {src ? (
        d.type === 'cylinder' ? (
          <CylinderThumb src={src} tint={tint} />
        ) : (
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            className="relative z-10 max-h-[78%] w-auto object-contain"
            style={{ filter: `${tint} drop-shadow(0 0 26px ${glowColor})` }}
          />
        )
      ) : (
        <TextThumb product={product} tint={tint} glowColor={glowColor} />
      )}

      {/* walnut base */}
      {(d.type === 'silhouette' || d.type === 'text') && (
        <div
          className="absolute bottom-[8%] z-20 h-[7%] w-[46%] rounded-[3px]"
          style={{
            background: `linear-gradient(175deg, ${d.wood}, #1a120c)`,
            boxShadow: `0 10px 26px -6px rgba(0,0,0,.9), 0 -2px 10px ${glowColor}`,
          }}
        />
      )}
      {d.type === 'penstand' && (
        <div className="absolute bottom-[9%] z-20 h-[2.5%] w-[42%] rounded-full"
          style={{ background: 'linear-gradient(175deg,#2a2a2c,#0c0c0d)', boxShadow: '0 8px 20px -4px rgba(0,0,0,.9)' }} />
      )}

      {/* table reflection */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%]"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.75))' }} />
    </div>
  )
}

function CylinderThumb({ src, tint }) {
  return (
    <div className="relative z-10 mb-[8%] h-[80%] aspect-[1/2.3]">
      <div
        className="absolute inset-0 overflow-hidden rounded-[10px]"
        style={{
          background: 'linear-gradient(100deg,#08080a,#17171a 40%,#0b0b0d)',
          boxShadow: 'inset 0 0 22px rgba(0,0,0,.9), 0 16px 40px -10px rgba(0,0,0,.95)',
        }}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          className="absolute left-1/2 top-1/2 h-full w-[230%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ filter: tint }}
        />
        {/* cylinder shading */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 74%, rgba(0,0,0,.72) 100%)' }} />
      </div>
      {/* rims */}
      <div className="absolute -top-[2px] left-[-3%] h-[2.6%] w-[106%] rounded-full bg-gradient-to-b from-[#26262a] to-[#0a0a0b]" />
      <div className="absolute -bottom-[2px] left-[-4%] h-[3%] w-[108%] rounded-full bg-gradient-to-b from-[#1d1d20] to-[#08080a]" />
    </div>
  )
}

function TextThumb({ product, tint, glowColor }) {
  const tp = product.design.textPanel || {}
  return (
    <div
      className="relative z-10 mb-[12%] flex h-[74%] aspect-[9/10] flex-col items-center justify-center rounded-[10px] px-4 text-center"
      style={{
        background: 'linear-gradient(150deg,#0c0b0a,#161412)',
        border: '1px solid rgba(255,255,255,.05)',
        boxShadow: `inset 0 0 26px rgba(0,0,0,.9), 0 0 40px -6px ${glowColor}`,
      }}
    >
      <div className="absolute inset-[7%] rounded-[6px] border" style={{ borderColor: glowColor }} />
      {(tp.lines || []).map((l, i) => (
        <span key={i} className="font-display leading-[1.05]"
          style={{ fontSize: 'clamp(11px,2.1vw,17px)', color: '#ffb265', textShadow: `0 0 16px ${glowColor}`, letterSpacing: '.02em' }}>
          {l}
        </span>
      ))}
      {tp.script && (
        <span className="mt-1 font-display italic"
          style={{ fontSize: 'clamp(15px,3vw,26px)', color: '#ffc588', textShadow: `0 0 20px ${glowColor}` }}>
          {tp.script}
        </span>
      )}
    </div>
  )
}

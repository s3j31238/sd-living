import React from 'react'

export const GOLD_ID = 'sdGold'

export function GoldDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <linearGradient id={GOLD_ID} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8a6e2f" />
          <stop offset="22%" stopColor="#e6c98a" />
          <stop offset="46%" stopColor="#fdf3d9" />
          <stop offset="70%" stopColor="#dcbc78" />
          <stop offset="100%" stopColor="#a8842f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** The SD laurel monogram. */
export function SDMark({ size = 34, className = '' }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-label="SD Living">
      <defs>
        <linearGradient id="mk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9c7c34" />
          <stop offset="30%" stopColor="#edd6a0" />
          <stop offset="55%" stopColor="#fdf6e3" />
          <stop offset="80%" stopColor="#dcbc78" />
          <stop offset="100%" stopColor="#8a6e2f" />
        </linearGradient>
      </defs>
      {/* laurel sprig */}
      <g fill="url(#mk)">
        <path d="M60 8c-1.6 4.2-1.4 8 .6 11.4 1.8-3.6 1.6-7.4-.6-11.4z" />
        <path d="M52.5 13.6c-3.9-1.3-7.2-.7-10 1.7 3 2.2 6.4 2.4 10-.2z" />
        <path d="M67.5 13.6c3.9-1.3 7.2-.7 10 1.7-3 2.2-6.4 2.4-10-.2z" />
        <path d="M45.6 19.6c-4-.4-7 .8-9.2 3.6 3.3 1.5 6.6 1 9.2-2.2z" />
        <path d="M74.4 19.6c4-.4 7 .8 9.2 3.6-3.3 1.5-6.6 1-9.2-2.2z" />
      </g>
      {/* SD ligature */}
      <text
        x="60" y="92"
        textAnchor="middle"
        fontFamily='"Cormorant Garamond", Didot, Georgia, serif'
        fontSize="72"
        fontWeight="600"
        fill="url(#mk)"
        letterSpacing="-4"
      >
        SD
      </text>
    </svg>
  )
}

export function Wordmark({ compact = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SDMark size={compact ? 30 : 38} />
      <div className="leading-none">
        <div
          className="font-display text-cream"
          style={{
            fontSize: compact ? 17 : 21,
            letterSpacing: compact ? '0.17em' : '0.2em',
            fontWeight: 500,
          }}
        >
          SD LIVING
        </div>
        {!compact && (
          <>
            <div className="hairline my-[5px] w-full opacity-70" />
            <div
              className="font-sans text-champagne/75"
              style={{ fontSize: 7.5, letterSpacing: '0.42em', fontWeight: 300 }}
            >
              LIGHT UP YOUR SPACE
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Gold line icons (match the reference badge set) ──
const ico = {
  fill: 'none',
  stroke: 'url(#sdGold)',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconBulb(p) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path {...ico} d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" />
      <path {...ico} d="M12 1V0M20.5 8h1M2.5 8h1M18.4 2.6l.7-.7M4.9 1.9l.7.7" />
    </svg>
  )
}
export function IconLotus(p) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path {...ico} d="M12 5c1.8 2 2.7 4 2.7 6.2 0 2-.9 3.6-2.7 4.8-1.8-1.2-2.7-2.8-2.7-4.8C9.3 9 10.2 7 12 5Z" />
      <path {...ico} d="M9.3 11.2C7.6 9.9 5.8 9.4 4 9.6c.2 3.3 2 5.5 5.3 6.5M14.7 11.2c1.7-1.3 3.5-1.8 5.3-1.6-.2 3.3-2 5.5-5.3 6.5" />
      <path {...ico} d="M4 16c2.3 2 5 3 8 3s5.7-1 8-3" />
    </svg>
  )
}
export function IconGift(p) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path {...ico} d="M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9ZM2 7.5h20V11H2zM12 7.5V21" />
      <path {...ico} d="M12 7.5S10.5 3 8 3a2.2 2.2 0 0 0 0 4.5h4ZM12 7.5S13.5 3 16 3a2.2 2.2 0 0 1 0 4.5h-4Z" />
    </svg>
  )
}
export function IconHome(p) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path {...ico} d="M3 10.5 12 3l9 7.5M5.5 9.4V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.4" />
      <path {...ico} d="M9.8 21v-6.2h4.4V21" />
    </svg>
  )
}
export function IconDiamond(p) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path {...ico} d="M6 3h12l3.5 5.5L12 21 2.5 8.5 6 3Z" />
      <path {...ico} d="M2.5 8.5h19M9 3l-2 5.5L12 21l5-12.5L15 3" />
    </svg>
  )
}
export function IconWhatsApp({ className = '', size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.2-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.4 3.4 0 0 0-1.1 2.6A6 6 0 0 0 7.2 12a13.5 13.5 0 0 0 5.2 4.6c.7.3 1.3.5 1.7.6a4.2 4.2 0 0 0 1.9.2 3.1 3.1 0 0 0 2-1.5 2.6 2.6 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3Z" />
      <path d="M20.5 3.5A11.9 11.9 0 0 0 2 17.9L.5 23.5l5.8-1.5A11.9 11.9 0 1 0 20.5 3.5Zm-8.4 21.4h-.1a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 1 1 8.4 4.6Z" transform="translate(0 -2)" />
    </svg>
  )
}
export function IconHeart({ filled = false, size = 17, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-7.5-9.7A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6c0 5.1-7.5 9.7-7.5 9.7Z" />
    </svg>
  )
}
export function IconBag({ size = 17, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
      fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 7.5h13l1 13H4.5l1-13ZM8.8 7.5V6a3.2 3.2 0 0 1 6.4 0v1.5" />
    </svg>
  )
}
export function IconSearch({ size = 17, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
      fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}
export function IconClose({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
      fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  )
}

export const WHY_ICONS = {
  led: IconBulb,
  art: IconLotus,
  gift: IconGift,
  home: IconHome,
  quality: IconDiamond,
}

export function Stars({ value = 5, size = 11, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-[2px] ${className}`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-champagne' : 'text-cream/20'}>★</span>
      ))}
    </span>
  )
}

/** Thin gold rule with a centre diamond — the brand's divider. */
export function Rule({ className = '', w = 150 }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      <span className="hairline" style={{ width: w / 2 }} />
      <span className="rotate-45 border border-champagne/50" style={{ width: 4, height: 4 }} />
      <span className="hairline" style={{ width: w / 2 }} />
    </div>
  )
}

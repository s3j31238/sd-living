/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        obsidian: '#0a0908',
        charcoal: '#151311',
        smoke: '#221f1c',
        walnut: '#3b2a1d',
        walnutLight: '#6b4a30',
        gold: '#c9a227',
        champagne: '#e6c98a',
        champagneLight: '#f4e4c1',
        amber: '#ff9d3c',
        amberDeep: '#e2761b',
        cream: '#f5efe4',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Didot', 'Georgia', 'serif'],
        sans: ['"Jost"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.42em',
        wide2: '0.22em',
      },
      animation: {
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        shimmer: 'shimmer 3.5s linear infinite',
      },
      keyframes: {
        pulseSlow: { '0%,100%': { opacity: 0.35 }, '50%': { opacity: 1 } },
        floatSlow: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}

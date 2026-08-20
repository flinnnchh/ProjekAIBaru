/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lui: {
          bg: '#0B1220',
          'bg-deep': '#080E1A',
          card: '#141E33',
          'card-hover': '#1A2845',
          border: '#233863',
          'border-light': '#2D4A7A',
          navy: '#3A4E7A',
          'navy-light': '#4A6296',
          gold: '#F5B400',
          'gold-hover': '#E5A800',
          'gold-light': '#D9A441',
          'gold-muted': '#FFD54F',
          cyan: '#3DD6E8',
          'cyan-light': '#7EEAF5',
          'cyan-muted': '#2BA8B7',
          maroon: '#7A2530',
          'maroon-bright': '#992E3C',
          'maroon-light': '#FF8E9D',
          text: '#FFFFFF',
          muted: '#B8BFC9',
          'muted-dark': '#8A94A3',
          subtle: '#6B7585',
        },
      },
      backgroundImage: {
        'lui-gradient': 'radial-gradient(ellipse at 15% 15%, rgba(35, 56, 99, 0.6) 0%, transparent 60%), radial-gradient(ellipse at 85% 70%, rgba(61, 214, 232, 0.12) 0%, transparent 50%), linear-gradient(180deg, #141E33 0%, #0B1220 60%, #080E1A 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(61, 214, 232, 0.08) 50%, transparent 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(245, 180, 0, 0.08) 50%, transparent 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'lui-card': '0 8px 30px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(35, 56, 99, 0.6)',
        'lui-card-hover': '0 16px 50px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(61, 214, 232, 0.3)',
        'lui-hover': '0 12px 35px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px #3DD6E8',
        'lui-gold-glow': '0 4px 20px 0 rgba(245, 180, 0, 0.35)',
        'lui-cyan-glow': '0 4px 15px 0 rgba(61, 214, 232, 0.3)',
        'lui-elevation-1': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'lui-elevation-2': '0 3px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
        'lui-elevation-3': '0 10px 20px rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.2)',
        'lui-inner': 'inset 0 2px 4px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

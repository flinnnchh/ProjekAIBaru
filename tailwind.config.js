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
          border: '#233863',
          navy: '#3A4E7A',
          gold: '#F5B400',
          'gold-light': '#D9A441',
          cyan: '#3DD6E8',
          maroon: '#7A2530',
          'maroon-bright': '#992E3C',
          text: '#FFFFFF',
          muted: '#B8BFC9',
        },
      },
      backgroundImage: {
        'lui-gradient': 'radial-gradient(ellipse at 15% 15%, rgba(35, 56, 99, 0.6) 0%, transparent 60%), radial-gradient(ellipse at 85% 70%, rgba(61, 214, 232, 0.12) 0%, transparent 50%), linear-gradient(180deg, #141E33 0%, #0B1220 60%, #080E1A 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'lui-card': '0 8px 30px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px #233863',
        'lui-hover': '0 12px 35px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px #3DD6E8',
        'lui-gold-glow': '0 4px 20px 0 rgba(245, 180, 0, 0.35)',
        'lui-cyan-glow': '0 4px 15px 0 rgba(61, 214, 232, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        }
      }
    },
  },
  plugins: [],
}




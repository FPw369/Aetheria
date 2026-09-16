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
        cyber: {
          bg: '#060813',
          card: 'rgba(15, 23, 42, 0.72)',
          border: 'rgba(56, 189, 248, 0.2)',
          neonBlue: '#00f2fe',
          neonCyan: '#38bdf8',
          neonPurple: '#a855f7',
          neonPink: '#f43f5e',
          neonRose: '#fb7185',
          neonEmerald: '#10b981',
          neonAmber: '#f59e0b',
          glow: '#4facfe',
        },
        partnerA: {
          light: '#38bdf8',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
          glow: 'rgba(56, 189, 248, 0.4)',
        },
        partnerB: {
          light: '#fb7185',
          DEFAULT: '#e11d48',
          dark: '#be123c',
          glow: 'rgba(251, 113, 133, 0.4)',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(56, 189, 248, 0.35), 0 0 30px rgba(56, 189, 248, 0.15)',
        'neon-pink': '0 0 15px rgba(244, 63, 94, 0.35), 0 0 30px rgba(244, 63, 94, 0.15)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.35), 0 0 30px rgba(168, 85, 247, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

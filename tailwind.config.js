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
        automotive: {
          bg: '#080B11',
          surface: '#0E1524',
          panel: '#151F33',
          card: '#1B2742',
          border: 'rgba(255, 255, 255, 0.09)',
          borderActive: '#00F0FF',
        },
        cyber: {
          cyan: '#00F0FF',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          amber: '#F59E0B',
          red: '#EF4444',
          green: '#10B981',
          neonGreen: '#00E676',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.35)',
        'glow-red': '0 0 25px 0px rgba(239, 68, 68, 0.5)',
        'glow-amber': '0 0 20px -2px rgba(245, 158, 11, 0.4)',
        'glow-green': '0 0 20px -2px rgba(16, 185, 129, 0.4)',
        'panel-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sonar-ping': 'sonar 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        sonar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}

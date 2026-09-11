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
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        forensic: {
          authentic: '#10b981', // green
          suspicious: '#f59e0b', // yellow / amber
          tampered: '#ef4444', // red / rose
          added: '#3b82f6', // blue
        },
        // Government of India / MHA visual identity
        gov: {
          navy: {
            950: '#0a1f44',
            900: '#0b2a5c',
            800: '#123a78',
            700: '#17469a',
          },
          saffron: {
            DEFAULT: '#ff8f1c',
            dark: '#d9720c',
          },
          green: {
            DEFAULT: '#0f7a3d',
            dark: '#0b5c2e',
          },
          paper: '#f3f5f8',
          line: '#d7dde6',
          ink: '#16233b',
          inksoft: '#4b586e',
        },
      },
      fontFamily: {
        sans: ['Noto Sans', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'Noto Sans', 'sans-serif'],
        mono: ['Roboto Mono', 'JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scanline': 'scanline 3s linear infinite',
      }
    },
  },
  plugins: [],
}

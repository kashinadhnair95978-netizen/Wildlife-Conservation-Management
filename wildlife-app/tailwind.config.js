/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08080a',
          925: '#0d0d10',
          900: '#111114',
          850: '#16161a',
          800: '#1a1a1f',
          750: '#202027',
          700: '#26262d',
          600: '#3d3d45',
          500: '#63636c',
          400: '#9b9ba3',
          300: '#c3c3ca',
          200: '#e2e2e6',
          150: '#ececf0',
          100: '#f3f3f5',
          50: '#f8f8f9',
        },
        status: {
          amber: '#b45309',
          red: '#b91c1c',
          emerald: '#15803d',
          blue: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        lift: '0 2px 4px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)',
        modal: '0 8px 24px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.18)',
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'drawer-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.25s cubic-bezier(0.21, 1.02, 0.73, 1) both',
        'fade-up': 'fade-up 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) both',
        'drawer-in': 'drawer-in 0.28s cubic-bezier(0.21, 1.02, 0.73, 1) both',
        'overlay-in': 'overlay-in 0.2s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
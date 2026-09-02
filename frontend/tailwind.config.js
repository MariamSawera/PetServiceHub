import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: 'var(--theme-surface-muted)',
          100: 'var(--theme-border-soft)',
          200: 'var(--theme-border)',
          300: 'var(--theme-border)',
          400: 'var(--theme-text-soft)',
          500: 'var(--theme-text-muted)',
          600: 'var(--theme-text-muted)',
          700: 'var(--theme-text-strong)',
          800: 'var(--theme-text-strong)',
          950: 'var(--theme-text)',
        },
        teal: {
          50: 'var(--theme-primary-pale)',
          100: 'var(--theme-primary-soft)',
          300: 'var(--theme-primary-soft)',
          400: 'var(--theme-primary)',
          500: 'var(--theme-primary)',
          600: 'var(--theme-primary)',
          700: 'var(--theme-primary-hover)',
        },
        cyan: {
          500: 'var(--theme-accent)',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [ "forest"],
  },
}
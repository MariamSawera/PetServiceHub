/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--theme-surface)',
          muted: 'var(--theme-surface-muted)',
          strong: 'var(--theme-surface-strong)',
        },
        ink: {
          DEFAULT: 'var(--theme-text)',
          strong: 'var(--theme-text-strong)',
          muted: 'var(--theme-text-muted)',
          soft: 'var(--theme-text-soft)',
        },
        success: {
          DEFAULT: 'var(--theme-success)',
          soft: 'var(--theme-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--theme-warning)',
          soft: 'var(--theme-warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--theme-danger)',
          soft: 'var(--theme-danger-soft)',
        },
        info: {
          DEFAULT: 'var(--theme-info)',
          soft: 'var(--theme-info-soft)',
        },
        map: {
          line: 'var(--theme-map-line)',
          fill: 'var(--theme-map-fill)',
        },
        hero: {
          start: 'var(--theme-hero-start)',
          end: 'var(--theme-hero-end)',
        },
        'brand-mark': 'var(--theme-brand-mark)',
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
        brand: {
          50: 'var(--theme-primary-pale)',
          100: 'var(--theme-primary-soft)',
          600: 'var(--theme-primary)',
          700: 'var(--theme-primary-hover)',
        },
      },
    },
  },
}
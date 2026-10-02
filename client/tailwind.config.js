/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        full: '9999px',
        card: '24px',
        'card-inner': '18px',
        input: '14px',
      },
      colors: {
        canvas: '#fafafc',
        ink: {
          DEFAULT: '#0f0f11',
          muted: '#6e6e73',
          subtle: '#9ca3af',
        },
        surface: {
          DEFAULT: '#ffffff',
          subdued: '#f5f5f7',
        },
        line: {
          DEFAULT: '#e5e5e7',
          subtle: '#f0f0f2',
        },
        primary: {
          DEFAULT: '#0066cc',
          focus: '#0071e3',
          dark: '#0055b3',
          soft: '#eff6ff',
        },
        neon: {
          DEFAULT: '#e8ff3b',
          hover: '#d4f932',
        },
        glass: 'var(--glass)',
        'glass-tint': 'var(--glass-tint)',
        'glass-edge': 'var(--glass-edge)',
      },
      backgroundImage: {
        'glass-shine': 'var(--glass-shine)',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 12px 36px rgba(0,0,0,0.07)',
        floating: '0 8px 24px rgba(0,0,0,0.12)',
        glass: 'var(--glass-shadow)',
        'glass-inner': 'var(--glass-inner-shadow)',
      },
      fontFamily: {
        primary: ['"Poppins"', 'sans-serif'],
        secondary: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Poppins"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
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
      },
      colors: {
        canvas: '#fafafc',
        ink: '#0f0f11',
        primary: {
          DEFAULT: '#0066cc',
          focus: '#0071e3',
          dark: '#2997ff',
        },
        neon: {
          DEFAULT: '#e8ff3b',
          hover: '#d4f932',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Clash Display"', '"Cabinet Grotesk"', '"Syne"', 'sans-serif'],
        grotesk: ['"Cabinet Grotesk"', '"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
        poppins: ['"Plus Jakarta Sans"', 'sans-serif'], // fallback redirect
      },
    },
  },
  plugins: [],
}
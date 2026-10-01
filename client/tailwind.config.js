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
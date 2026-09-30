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
        ink: '#1d1d1f',
        primary: {
          DEFAULT: '#0066cc',
          focus: '#0071e3',
          dark: '#2997ff',
        },
      },
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
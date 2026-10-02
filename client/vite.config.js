import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [react()],
  optimizeDeps: {
    include: [
      'gsap',
      'gsap/dist/ScrollTrigger',
      'gsap/dist/SplitText',
      '@gsap/react',
      'lenis/react',
      'framer-motion',
      'next-themes',
      'react-router-dom',
      'axios',
      'react-toastify'
    ]
  },
  server: {
    port: 5173,
    host: true
  }
})

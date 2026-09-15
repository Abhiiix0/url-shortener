import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // short codes (e.g. /sw8wsc) -> backend does the real 302 redirect
      '^/[a-zA-Z0-9]+$': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

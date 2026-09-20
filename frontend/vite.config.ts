import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.BACKEND_URL || 'http://localhost:5000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
        },
        // short codes (e.g. /sw8wsc) -> backend does the real 302 redirect
        '^/[a-zA-Z0-9]+$': {
          target: backend,
          changeOrigin: true,
        },
      },
    },
  }
})

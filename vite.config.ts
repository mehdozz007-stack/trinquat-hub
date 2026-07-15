import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: [
      '@tanstack/start-server-core',
      '@tanstack/react-start',
      'nitro',
      'nitropack'
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})

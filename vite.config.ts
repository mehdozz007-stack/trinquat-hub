import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['jose', 'bcryptjs', '@tanstack/start-server-core', '@tanstack/react-start'],
    include: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query'],
  },
})

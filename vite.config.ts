import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // BackgroundEffect intentionally lazy-loads a large three.js vendor chunk.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('/three/examples/jsm/')) return 'vendor-three-examples'
          if (id.includes('/three/')) return 'vendor-three'
          if (id.includes('@react-three/fiber')) return 'vendor-r3f'
          if (id.includes('@react-three/drei')) return 'vendor-r3drei'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('lucide-react')) return 'vendor-icons'

          return 'vendor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})

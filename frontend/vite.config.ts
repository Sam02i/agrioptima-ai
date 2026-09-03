import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Buyer workspace is route-split and ~98 KB compressed; keep warnings for
    // genuinely large chunks while avoiding noise at Vite's raw 500 KB edge.
    chunkSizeWarningLimit: 550,
  },
})

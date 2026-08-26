import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'TortugaCharts',
      fileName: 'tortuga-charts',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        // Single self-contained file for WordPress
        inlineDynamicImports: true,
      },
    },
  },
})

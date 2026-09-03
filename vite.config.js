import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function manifestPlugin() {
  return {
    name: 'write-manifest',
    generateBundle(_, bundle) {
      const fileName = Object.keys(bundle).find(
        f => f.startsWith('tortuga-charts.') && f.endsWith('.iife.js')
      )
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify({ script: fileName }, null, 2),
      })
    },
  }
}

export default defineConfig({
  // base: '/reserva-playa-tortuga-data/',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [react(), manifestPlugin()],
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'TortugaCharts',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'tortuga-charts.[hash].iife.js',
        inlineDynamicImports: true,
      },
    },
  },
})

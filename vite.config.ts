import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Set root to web source directory
  root: './src/web',
  
  // Build configuration
  build: {
    outDir: '../../dist/web',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/web/index.html')
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Path resolution for imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@framework': resolve(__dirname, 'src/framework'),
      '@web': resolve(__dirname, 'src/web')
    }
  },
  
  // Handle TypeScript and framework dependencies
  esbuild: {
    target: 'es2020'
  },
  
  // Optimize dependencies that might not be ES modules
  optimizeDeps: {
    include: ['chart.js']
  }
})
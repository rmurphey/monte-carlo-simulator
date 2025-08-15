import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Set root to project root to allow imports from framework/cli
  root: '.',
  
  // Build configuration
  build: {
    outDir: './dist/web',
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
    open: '/src/web/index.html',
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
  }
})
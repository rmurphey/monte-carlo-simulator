import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'src/ui/', // Exclude React UI components if any
        'src/main.tsx' // Exclude React entry point
      ]
    },
    // CLI-specific test configuration
    testTimeout: 10000, // Longer timeout for CLI operations
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
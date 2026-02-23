import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/vite.config.js',
        '**/vitest.config.js',
        '**/postcss.config.js',
        '**/tailwind.config.js',
      ],
      thresholds: {
        lines: 20,
        functions: 10,
        branches: 20,
        statements: 20,
      },
    },
  },
})

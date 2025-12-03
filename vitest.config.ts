import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    exclude: ['node_modules', 'dist', '**/node_modules/**'],
    
    root: '.',
    globals: true
  },
  resolve: {
    alias: {
      'src': fileURLToPath(new URL('src', import.meta.url)),
      'components': fileURLToPath(new URL('src/components', import.meta.url)),
      'layouts': fileURLToPath(new URL('src/layouts', import.meta.url)),
      'pages': fileURLToPath(new URL('src/pages', import.meta.url)),
      'assets': fileURLToPath(new URL('src/assets', import.meta.url)),
      'boot': fileURLToPath(new URL('src/boot', import.meta.url)),
      'stores': fileURLToPath(new URL('src/stores', import.meta.url))
    }
  }
})
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
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
  },
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
})
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"

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
    }
  },
  plugins: [react(), tailwindcss()],
})

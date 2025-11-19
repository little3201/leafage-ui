import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import checker from 'vite-plugin-checker'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'
        })
      ],
      dts: true,
    }),
    // https://tailwindcss.com/docs/installation/using-vite
    tailwindcss(),
    checker({
      vueTsc: true,
      eslint: {
        lintCommand: 'eslint -c ./eslint.config.js "./src/**/*.{js,mjs,cjs,ts,vue}"',
        useFlatConfig: true
      }
    })
  ],
  server: {
    // https: true,
    open: true,
    proxy: {
      '/api': {
        target: env.VITE_BACKEND_URL,
        // ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
})

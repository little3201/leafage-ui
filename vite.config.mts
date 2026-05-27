import type { PluginOption } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  define: { 'process.env': {} },
  resolve: {
    alias: {
      src: fileURLToPath(new URL('src', import.meta.url)),
      components: fileURLToPath(new URL('src/components', import.meta.url)),
      layouts: fileURLToPath(new URL('src/layouts', import.meta.url)),
      pages: fileURLToPath(new URL('src/pages', import.meta.url)),
      assets: fileURLToPath(new URL('src/assets', import.meta.url)),
      boot: fileURLToPath(new URL('src/boot', import.meta.url)),
      stores: fileURLToPath(new URL('src/stores', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    tailwindcss() as PluginOption,
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    VueI18nPlugin({
      include: [fileURLToPath(new URL('src/lang', import.meta.url))],
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto Mono',
            weights: [400, 700],
          },
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
  ],
})

import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: [
      // Matches vitest tests in any subfolder of 'src' or into 'test/**/__tests__'
      // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
      'src/**/__tests__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/**/__tests__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/css/quasar-variables.scss',
    })
  ],
  resolve: {
    tsconfigPaths: true
  }
})

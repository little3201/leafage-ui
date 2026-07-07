import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url))
    },
    plugins: [
      vue(),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass"
          })
        ],
        dts: true
      }),
      // https://tailwindcss.com/docs/installation/using-vite
      tailwindcss(),
      VueI18nPlugin({
        include: [fileURLToPath(new URL("./src/lang", import.meta.url))]
      })
    ],
    server: {
      // https: true,
      proxy: {
        "/api": {
          target: env.VITE_BASE_URL,
          // ws: true,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, "")
        }
      }
    }
  };
});

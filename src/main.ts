import { createApp } from "vue";
import App from "./App.vue";

import "./styles/index.scss";
import "./styles/main.css";

// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/message.scss";

import { i18n } from "./boot/i18n";
import router from "./router";
import pinia from "./stores";
import { prepareApp } from "./boot/msw-browser.ts";

if (!import.meta.env.DEV) {
  await prepareApp();
}

const app = createApp(App);
app.use(pinia).use(router).use(i18n).mount("#app");

import { createApp } from 'vue'
import App from './App.vue'

import 'src/css/index.scss'
import 'src/css/main.css'

// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss'

import pinia from './stores'
import router from './router'
import { i18n } from 'boot/i18n'

async function prepareApp() {
  if (!import.meta.env.DEV) {
    const { worker } = await import('boot/msw-browser')

    router.addRoute({
      path: '/login',
      name: 'login',
      component: () => import('pages/LoginPage.vue')
    })

    return worker.start({
      onUnhandledRequest: 'bypass'
    })
  }

  return Promise.resolve()
}

const app = createApp(App)

await prepareApp()
app.use(pinia).use(router).use(i18n).mount('#app')

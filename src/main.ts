import i18n from 'boot/i18n'
import vuetify from 'boot/vuetify'
import { createPinia } from 'pinia'
import router from 'src/router'
import { createApp } from 'vue'
import App from './App.vue'

// Styles
import 'unfonts.css'
import './styles/tailwind.css'
import './styles/main.scss'

async function prepareApp () {
  if (import.meta.env.DEV) {
    const { worker } = await import('boot/msw-browser')

    return worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  return
}

const app = createApp(App)

await prepareApp()

app.use(vuetify).use(createPinia()).use(i18n).use(router).mount('#app')

import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import pinia from './stores'
import './styles/main.css'

const app = createApp(App)

app.use(pinia).use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark',
    }
  }
})

app.mount('#app')

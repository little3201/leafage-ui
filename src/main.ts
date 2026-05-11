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

const app = createApp(App)

app.use(vuetify).use(createPinia()).use(i18n).use(router)

app.mount('#app')

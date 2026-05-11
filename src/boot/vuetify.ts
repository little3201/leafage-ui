import { createVuetify } from 'vuetify'
import { en, zhHans, zhHant } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import '../styles/layers.css'
import 'vuetify/styles/core'
import 'vuetify/styles/utilities'

export default createVuetify({
  theme: {
    defaultTheme: 'system',
    utilities: false,
  },
  locale: {
    locale: 'zhHans',
    fallback: 'en',
    messages: { zhHans, zhHant, en },
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },
})

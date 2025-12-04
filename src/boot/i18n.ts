import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import { Cookies } from 'quasar'
import enUS from 'src/lang/en-US'
import zhCN from 'src/lang/zh-CN'
import zhTW from 'src/lang/zh-TW'


export const i18n = createI18n({
  legacy: false,
  locale: Cookies.get('lang') || 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
    'zh-TW': zhTW
  }
})

export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

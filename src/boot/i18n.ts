import { createI18n } from 'vue-i18n'
import Cookies from 'universal-cookie'
import type { I18n } from 'vue-i18n'
import messages from 'src/i18n'


const cookies = new Cookies(null, { path: '/' })
export const i18n = createI18n({
  legacy: false,
  locale: cookies.get('lang') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
}) as I18n

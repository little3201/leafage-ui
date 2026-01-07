import zhTW from 'src//lang/zh-TW'
import enUS from 'src/lang/en-US'
import zhCN from 'src/lang/zh-CN'
import Cookies from 'universal-cookie'
import type { I18n } from 'vue-i18n'
import { createI18n } from 'vue-i18n'


const cookies = new Cookies(null, { path: '/' })
export const i18n = createI18n({
  legacy: false,
  locale: cookies.get('lang') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
    'zh-TW': zhTW
  }
}) as I18n

export const langOptions = [
  { value: 'en-US', label: 'English(US)' },
  { value: 'zh-CN', label: '中文（简体）' },
  { value: 'zh-TW', label: '中文（繁體）' }
]
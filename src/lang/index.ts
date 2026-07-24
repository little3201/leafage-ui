import enUS from './en-US'
import zhCN from './zh-CN'
import zhTW from './zh-TW'

export default {
  en: enUS,
  zhHans: zhCN,
  zhHant: zhTW,
}

export const langOptions = [
  { value: 'en', label: 'English(US)' },
  { value: 'zhHans', label: '中文（简体）' },
  { value: 'zhHant', label: '中文（繁體）' },
]

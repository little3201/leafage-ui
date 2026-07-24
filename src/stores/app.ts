import { acceptHMRUpdate, defineStore } from 'pinia'
import Cookies from 'universal-cookie'
import { ref } from 'vue'

const cookies = new Cookies(null, { path: '/' })
export const useAppStore = defineStore('app', () => {
  const locale = ref(cookies.get('lang') || 'zh-CN')
  const theme = ref(cookies.get('theme') || 'light')

  function setLocale (value: string) {
    locale.value = value
    cookies.set('lang', value)
    // 修改html中lang
    const htmlElement = document.querySelector('html')

    if (htmlElement) {
      htmlElement.setAttribute('lang', value)
    }
  }

  function setTheme (value: string) {
    theme.value = value
    cookies.set('theme', value)
  }

  return {
    locale,
    theme,
    setLocale,
    setTheme,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}

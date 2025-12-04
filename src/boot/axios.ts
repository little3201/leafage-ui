import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { Notify } from 'quasar'
import { i18n } from 'boot/i18n'
import type { ComposerTranslation } from 'vue-i18n'
import { useUserStore } from 'src/stores/user-store'
import { signIn } from 'src/api/authentication'
import { SERVER_URL } from 'src/constants'


const { t } = i18n.global as { t: ComposerTranslation }
const abortControllerMap: Map<string, AbortController> = new Map()

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api: AxiosInstance = axios.create({ baseURL: process.env.API || '/api', timeout: 10000, withCredentials: true })

export default defineBoot(({ store }) => {
  // 请求拦截器
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const userStore = useUserStore(store)
      if (userStore.accessToken) {
        config.headers.Authorization = `Bearer ${userStore.accessToken}`
      } else {
        delete config.headers.Authorization
      }

      // 创建 AbortController 实例
      const controller = new AbortController()
      const uniqueKey = generateUniqueKey(config)
      config.signal = controller.signal
      abortControllerMap.set(uniqueKey, controller)

      return config
    },
    (error: AxiosError) => {
      Notify.create({ type: 'negative', message: error.message })
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      const uniqueKey = generateUniqueKey(response.config)
      abortControllerMap.delete(uniqueKey)

      const { config, status } = response
      if (status >= 200 && status < 300 && config.method !== 'get' && config.url !== SERVER_URL.TOKEN) {
        Notify.create({ type: 'positive', message: t('successful') })
      }
      return response
    },
    async (error: AxiosError) => {
      const status = error.response?.status
      switch (status) {
        case 401:
          cancelAllRequest()
          await signIn()
          return
        case 403:
          Notify.create({ type: 'forbidden', message: t('error') })
          break
        case 404:
          Notify.create({ type: 'negative', message: t('notFound') })
          break
        case 500:
          Notify.create({ type: 'negative', message: t('serverError') })
          break
        default:
          Notify.create({ type: 'negative', message: t('error') })
      }
      return Promise.reject(error)
    }
  )
})

// 构建 uniqueKey 的辅助函数
function generateUniqueKey(config: InternalAxiosRequestConfig): string {
  const { method, url, params } = config
  const paramString = params ? JSON.stringify(params) : ''
  return `${method}:${url}:${paramString}`
}

function cancelAllRequest() {
  abortControllerMap.forEach(controller => {
    controller.abort()
  })
  abortControllerMap.clear()
}

export { api }

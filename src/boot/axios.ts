import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from 'stores/user-store'
import { i18n } from 'boot/i18n'
import type { ComposerTranslation } from 'vue-i18n'
import { signIn } from 'src/api/authentication'
import { SERVER_URL } from 'src/constants'


const { t } = i18n.global as { t: ComposerTranslation }

const abortControllerMap: Map<string, AbortController> = new Map()

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || '/api',
  timeout: 15000,
  withCredentials: true
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
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
    ElMessage.error({ message: error.message, grouping: true })
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
      ElMessage.success({ message: t('successful'), grouping: true })
    }
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          cancelAllRequest()
          signIn()
          return
        case 403:
          ElMessage.error({ message: t('forbidden'), grouping: true })
          break
        case 404:
          ElMessage.error({ message: t('notFound'), grouping: true })
          break
        case 500:
          ElMessage.error({ message: t('serverError'), grouping: true })
          break
        default:
          ElMessage.error({ message: t('error'), grouping: true })
      }
    }
    return Promise.reject(error)
  }
)

// 构建 uniqueKey 的辅助函数
function generateUniqueKey (config: InternalAxiosRequestConfig): string {
  const { method, url, params } = config
  const paramString = params ? JSON.stringify(params) : ''
  return `${method}:${url}:${paramString}`
}

function cancelAllRequest () {
  abortControllerMap.forEach(controller => {
    controller.abort()
  })
  abortControllerMap.clear()
}

export { api }

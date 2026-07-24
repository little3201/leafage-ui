import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import { signIn } from '@/api/authentication'

const abortControllerMap = new Map<string, AbortController>()

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  withCredentials: true,
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const uniqueKey = generateUniqueKey(config)
    const previousController = abortControllerMap.get(uniqueKey)
    if (previousController) {
      previousController.abort()
      abortControllerMap.delete(uniqueKey)
    }
    // 创建 AbortController 实例
    const controller = new AbortController()
    config.signal = controller.signal
    abortControllerMap.set(uniqueKey, controller)

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const uniqueKey = generateUniqueKey(response.config)
    abortControllerMap.delete(uniqueKey)

    return response
  },
  (error: AxiosError) => {
    if (error.config) {
      const uniqueKey = generateUniqueKey(error.config)
      abortControllerMap.delete(uniqueKey)
    }

    if (error.response?.status === 401) {
      cancelAllRequest()
      signIn()
    }
    return Promise.reject(error)
  },
)

// 构建 uniqueKey 的辅助函数
function generateUniqueKey (config: InternalAxiosRequestConfig): string {
  const method = config.method ?? 'get'
  const url = config.url ?? ''
  const params = config.params ? JSON.stringify(config.params) : ''
  const data = config.data ? JSON.stringify(config.data) : ''

  return `${method}:${url}:${params}:${data}`
}

function cancelAllRequest () {
  for (const controller of abortControllerMap.values()) {
    controller.abort()
  }
  abortControllerMap.clear()
}

export { api }

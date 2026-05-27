import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { signIn } from 'src/api/authentication'


const abortControllerMap: Map<string, AbortController> = new Map()

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 创建 AbortController 实例
    const controller = new AbortController()
    const uniqueKey = generateUniqueKey(config)
    config.signal = controller.signal
    abortControllerMap.set(uniqueKey, controller)

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const uniqueKey = generateUniqueKey(response.config)
    abortControllerMap.delete(uniqueKey)

    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      cancelAllRequest()
      signIn()
    }
    return Promise.reject(error)
  }
)

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


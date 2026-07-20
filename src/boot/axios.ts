import { defineBoot } from "#q-app";
import { signIn } from "@/api/authentication";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from "axios";
import axios from "axios";

const abortControllerMap = new Map<string, AbortController>();

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.API || "/api",
  timeout: 10000,
  withCredentials: true
});

export default defineBoot(() => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const uniqueKey = generateUniqueKey(config);
      const previousController = abortControllerMap.get(uniqueKey);
      if (previousController) {
        previousController.abort();
        abortControllerMap.delete(uniqueKey);
      }
      // 创建 AbortController 实例
      const controller = new AbortController();
      config.signal = controller.signal;
      abortControllerMap.set(uniqueKey, controller);

      return config;
    },
    (error: AxiosError) => {
      throw error;
    }
  );

  // 响应拦截器
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      const uniqueKey = generateUniqueKey(response.config);
      abortControllerMap.delete(uniqueKey);

      return response;
    },
    async (error: AxiosError) => {
      if (error.config) {
        const uniqueKey = generateUniqueKey(error.config);
        abortControllerMap.delete(uniqueKey);
      }

      if (error.response?.status === 401) {
        cancelAllRequest();
        await signIn();
      }
      return Promise.reject(error);
    }
  );
});

function generateUniqueKey(config: InternalAxiosRequestConfig): string {
  const method = config.method ?? "get";
  const url = config.url ?? "";
  const params = config.params ? JSON.stringify(config.params) : "";
  const data = config.data ? JSON.stringify(config.data) : "";

  return `${method}:${url}:${params}:${data}`;
}

function cancelAllRequest() {
  abortControllerMap.forEach(controller => {
    controller.abort();
  });
  abortControllerMap.clear();
}

export { api };

import type { RouteRecordNameGeneric } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 判断是否持有操作权限
 * @param page 页面路由
 * @param action 操作
 * @returns 是否持有操作权限
 */
export function hasAction (page: RouteRecordNameGeneric, action: string) {
  if (page) {
    const userStore = useUserStore()
    return userStore.privilegeMap.get(page as string)?.has(action) ?? false
  }
  return false
}

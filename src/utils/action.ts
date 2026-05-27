import type { PrivilegeTreeNode } from 'src/types'
import { useUserStore } from 'stores/user'
import type { RouteRecordNameGeneric } from 'vue-router'


// 递归查找权限节点
function findNodeByPath(privileges: PrivilegeTreeNode[], name: string): string[] {
  for (const node of privileges) {
    if (node.name === name) {
      return node.meta.actions || []
    }
    if (node.children) {
      const result = findNodeByPath(node.children, name)
      if (result.length > 0) return result
    }
  }
  return []
}

/**
 * 判断是否持有操作权限
 * @param page 页面路由
 * @param action 操作
 * @returns 是否持有操作权限
 */
export function hasAction(page: RouteRecordNameGeneric, action: string) {
  if (page) {
    const userStore = useUserStore()
    const privileges = userStore.privileges
    const actions = findNodeByPath(privileges, page as string)

    return actions.includes(action)
  }
  return false
}
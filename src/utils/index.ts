import type { PrivilegeTreeNode } from 'src/types'
import type { MenuItem } from 'primereact/menuitem'

/**
 * Resolve a child path relative to a parent path
 * @param {string} parentPath - The parent path
 * @param {string} path - The child path
 * @returns {string} - The resolved path
 */
export function pathResolve(parentPath: string, path: string): string {
  if (!path) return ''
  const childPath = path.startsWith('/') ? path : `/${path}`
  return `${parentPath}${childPath}`.replace(/\/\//g, '/').trim()
}

/**
 * 递归处理子项
 * @param nodes  数据项
 * @param navigate 路由跳转函数
 * @returns 
 */
export const recursion = (nodes: PrivilegeTreeNode[], navigate: Function, parentPath: string = "/"): MenuItem[] => {
  return nodes.map(node => {
    const menuItem: MenuItem = {
      label: node.name,
      icon: `pi pi-${node.meta.icon}`,
      items: node.children ? recursion(node.children, navigate, pathResolve(parentPath, node.meta.path)) : undefined
    }
    if (!node.children || node.children.length === 0) {
      menuItem.command = () => { navigate(pathResolve(parentPath, node.meta.path)); };
    }

    return menuItem
  })
}
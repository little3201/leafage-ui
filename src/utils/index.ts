import { dayjs } from 'element-plus'
import * as XLSX from 'xlsx'
import { useUserStore } from 'stores/user-store'
import type { PrivilegeTreeNode } from 'src/types'
import type { RouteRecordNameGeneric } from 'vue-router'

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
 * Check if a value is a number
 * @param {unknown} val - The value to check
 * @returns {boolean} - True if the value is a number, otherwise false
 */
export const isNumber = (val: unknown): val is number => {
  return typeof val === 'number' && isFinite(val)
}

/**
 * Compare the target date with the current date and return a status
 * @param {string} target - The target date
 * @returns {string} - The status ('success', 'warning', 'danger')
 */
export function calculate(target: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' {
  const now = new Date()
  const targetDate = new Date(target)
  const diff = dayjs(targetDate).diff(now, 'days')
  if (diff > 7) {
    return 'success'
  } else {
    const diffSec = dayjs(targetDate).diff(now, 'seconds')
    return diffSec > 0 ? 'warning' : 'danger'
  }
}

/**
 * Format a duration given in milliseconds into a human-readable string
 * @param {number} milliseconds - The duration in milliseconds
 * @returns {string} - The formatted duration
 */
export function formatDuration(milliseconds: number): string {
  const timeUnits = [
    { unit: 'h', factor: 3600000 },
    { unit: 'min', factor: 60000 },
    { unit: 's', factor: 1000 },
    { unit: 'ms', factor: 1 }
  ]
  for (const { unit, factor } of timeUnits) {
    if (milliseconds >= factor) {
      const value = Math.floor(milliseconds / factor)
      return `${value}${unit}`
    }
  }
  return '0ms'
}

/**
 * Format a file size given in bytes into a human-readable string
 * @param {number} size - The file size in bytes
 * @returns {string} - The formatted file size
 */
export function formatFileSize(size: number): string {
  if (isNaN(size) || size <= 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)}${units[index]}`
}

/**
 * 数组截取、可展示数组长度
 * @param array 集合、数组
 * @param count 截取树
 * @returns 截取后的数组、集合
 */
export function visibleArray<T extends string | number>(array: T[], count: number): T[] {
  if (array && array.length) {
    return array.length > count ? array.slice(0, count) : array
  }
  return []
}

/**
 * 下载
 * @param data 数据
 * @param filename 文件名
 * @param mimeType 文件类型
 */
export function download(data: Blob, filename: string, mimeType?: string): void {
  // 创建一个新的 Blob 对象，指定 MIME 类型
  const blob = new Blob([data], { type: mimeType || 'application/octet-stream' })

  // 创建一个临时的下载链接
  const url = window.URL.createObjectURL(blob)

  // 创建一个 <a> 元素并触发点击事件来启动下载
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename) // 设置下载的文件名
  document.body.appendChild(link)
  link.click() // 执行点击，触发下载
  document.body.removeChild(link) // 清除临时元素

  // 释放创建的 URL 对象
  window.URL.revokeObjectURL(url)
}

/**
 * 数据分组
 * @param array 分组数据
 * @param typeKey 分组依据
 * @returns 分组后的数据
 */
export function groupByKey<T>(array: T[], typeKey: keyof T): { [key: string]: T[] } {
  return array.reduce((acc: { [key: string]: T[] }, curr: T) => {
    const typeValue = curr[typeKey] as string | number // 允许 `string` 或 `number` 类型
    if (!typeValue) { return acc }
    const groupKey = String(typeValue) // 确保转换为字符串，以便作为对象键

    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(curr)

    return acc
  }, {} as { [key: string]: T[] })
}

/**
 * 判断是否持有操作权限
 * @param page 页面路由
 * @param action 操作
 * @returns 是否持有操作权限
 */
export function hasAction(page: RouteRecordNameGeneric, action: string) {
  if (page) {
    const privileges = useUserStore().privileges
    const actions = findNodeByPath(privileges, page as string)

    return actions.includes(action)
  }
  return false
}

/**
 * 导出excel
 * @param data 数据
 * @param fileName 
 */
export function exportToExcel(data: object[], fileName: string, sheetName?: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName && sheetName.length ? sheetName : 'Sheet1')

  // 导出 Excel 文件
  XLSX.writeFile(wb, fileName.replace(/\.[^/.]+$/, '') + '.xlsx')
}

/**
 * 导出csv
 * @param data 数据
 * @param fileName 
 */
export function exportToCSV(data: object[], fileName: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(ws)

  // 创建 Blob 对象并触发下载
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName.replace(/\.[^/.]+$/, '') + '.csv'

  link.click()
}

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

export function dealFilters(filters?: object | string) {
  if (filters && typeof filters === 'object') {
    filters = Object.entries(filters)
      .filter(([, value]) => value != null && value !== '')
      .map(([key, value]) => {
        return `${key}:${value}`
      })
      .join(',')
  }
  return filters?.length ? filters : undefined
}
import { Notify, exportFile } from 'quasar'
import type { QTableProps } from 'quasar'
import type { Dictionary } from 'src/types'

/**
 * Resolve a child path relative to a parent path
 * @param {string} parentPath - The parent path
 * @param {string} path - The child path
 * @returns {string} - The resolved path
 */
export function pathResolve(parentPath: string | undefined, path: string | undefined): string {
  if (!path) {
    return ''
  }
  const childPath = path.startsWith('/') ? path : `/${path}`
  return `${parentPath}${childPath}`.replace(/\/\//g, '/').trim()
}

/**
 * Format a duration given in milliseconds into a human-readable string
 * @param {number} milliseconds - The duration in milliseconds
 * @returns {string} - The formatted duration
 */
export const formatDuration = (ms: number): string => {
  if (ms === 0) return '0ms'

  const sign = ms < 0 ? '-' : ''
  const abs = Math.abs(ms)

  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const s = (abs % 60000) / 1000
  const msPart = abs % 1000

  const parts: string[] = []

  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}min`)

  // 只有当秒 >= 1 时才显示秒
  if (s >= 1) {
    let secStr: string
    if (s >= 10) {
      secStr = s.toFixed(1).replace(/\.0$/, '')
    } else {
      secStr = s.toFixed(2).replace(/\.?0+$/, '')
    }
    parts.push(`${secStr}s`)
  }
  // 小于 1 秒且前面没有更高单位，才显示毫秒
  else if (parts.length === 0) {
    if (msPart === 0) return '0ms'
    const msStr = msPart < 10
      ? msPart.toFixed(1).replace(/\.0$/, '')
      : Math.round(msPart).toString()
    parts.push(msStr + 'ms')
  }

  return sign + (parts.length > 0 ? parts.join('') : '0ms')
}

/**
 * Format a file size given in bytes into a human-readable string
 * @param {number} size - The file size in bytes
 * @returns {string} - The formatted file size
 */
export const formatFileSize = (size: number) => {
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
 * 格式化字典数据
 * @param value 字典值
 * @param rows  字典列表
 * @returns 字典名称
 */
export function formatDictionary(value: number, rows: Dictionary[]): string {
  const dictItem = rows.find(item => item.id === value)
  return dictItem ? dictItem.name : ''
}

export function visibleArray<T extends string | number>(array: T[], count: number): T[] {
  if (array && array.length) {
    return array.length > count ? array.slice(0, count) : array
  }
  return []
}

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

function base64UrlEncode(array: Uint8Array) {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function generateVerifier(): string {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

export async function generateCodeChallenge(codeVerifier: string) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
    .then(buffer => base64UrlEncode(new Uint8Array(buffer)))
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

/**
 * wrap csv value
 * @param val value
 * @param formatFn format function
 * @param row data row
 * @returns result
 */
function wrapCsvValue(val: string, formatFn?: (val: string, row?: string) => string, row?: string) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val

  formatted = formatted === void 0 || formatted === null ? '' : String(formatted)

  formatted = formatted.split('"').join('""')

  return `"${formatted}"`
}

/**
 * export table data to csv file
 * @param columns columns
 * @param rows rows
 * @returns result
 */
export function exportTable(columns: QTableProps['columns'], rows: QTableProps['rows']) {
  if (!columns || !rows || columns.length === 0 || rows.length === 0) {
    // Handle the case where columns or rows are undefined or empty
    return
  }
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))]
    .concat(rows.map(row => columns.map(col =>
      wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field === void 0 ? col.name : col.field],
        col.format,
        row
      )).join(','))
    ).join('\r\n')

  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    Notify.create({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
}
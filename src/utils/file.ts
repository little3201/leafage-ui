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
 * 下载
 * @param data 数据
 * @param filename 文件名
 * @param type 文件类型
 */
export function download(data: Blob, filename: string, type?: string): void {
  // 创建一个新的 Blob 对象，指定 MIME 类型
  const blob = new Blob([data], { type: type || 'application/octet-stream' })

  // 创建一个临时的下载链接
  const url = globalThis.URL.createObjectURL(blob)

  // 创建一个 <a> 元素并触发点击事件来启动下载
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename) // 设置下载的文件名
  document.body.appendChild(link)
  link.click() // 执行点击，触发下载
  link.remove() // 清除临时元素

  // 释放创建的 URL 对象
  globalThis.URL.revokeObjectURL(url)
}

/**
 * 导出csv
 * @param data 数据
 * @param fileName 
 */
export function exportToCSV(data: object[], fileName: string) {
  if (!data.length) {
    return
  }

  // 获取表头
  const headers = Object.keys(data[0])

  // 转义 CSV 字段
  const escapeCSV = (value: unknown) => {
    if (value == null) {
      return ''
    }

    let str: string

    if (typeof value === 'string') {
      str = value
    }
    else if (
      typeof value === 'number'
      || typeof value === 'boolean'
      || typeof value === 'bigint'
    ) {
      str = value.toString()
    }
    else if (value instanceof Date) {
      str = value.toISOString()
    }
    else {
      // 对象/数组转 JSON
      str = JSON.stringify(value)
    }

    // CSV 转义
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }

    return str
  }

  // 生成 CSV 内容
  const rows = data.map(row =>
    headers.map(header => escapeCSV((row as Record<string, unknown>)[header])).join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')

  // UTF-8 BOM，避免 Excel 中文乱码
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName.replace(/\.[^/.]+$/, '') + '.csv'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(link.href)
}
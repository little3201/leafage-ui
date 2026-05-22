import * as XLSX from 'xlsx'

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
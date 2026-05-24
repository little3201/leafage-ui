import type { QTableProps } from 'quasar'
import { Notify, exportFile } from 'quasar'

/**
 * dowanload file
 * @param data stream data
 * @param filename file name
 * @param mimeType mime type
 */
export function download(data: Blob, filename: string, mimeType?: string): void {
  // 创建一个新的 Blob 对象，指定 MIME 类型
  const blob = new Blob([data], { type: mimeType || 'application/octet-stream' })

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
 * wrap csv value
 * @param val value
 * @param formatFn format function
 * @param row data row
 * @returns result
 */
function wrapCsvValue(val: string, formatFn?: (val: string, row?: string) => string, row?: string) {
  let formatted = formatFn ? formatFn(val, row) : val ?? ''

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
  if (!columns?.length || !rows?.length) {
    // Handle the case where columns or rows are undefined or empty
    return
  }
  // 生成表头的 CSV 内容
  const header = columns.map(col => wrapCsvValue(col.label))

  // 生成表格内容的 CSV 行
  const rowsContent = rows.map(row => {
    return columns.map(col => {
      // 处理 col.field 可能是函数的情况
      const value = typeof col.field === 'function'
        ? col.field(row)
        : row[col.field ?? col.name]

      return wrapCsvValue(value, col.format, row)
    }).join(',')
  }).join('\r\n')

  // 合并表头和表格内容
  const content = [header.join(','), rowsContent].join('\r\n')

  const status = exportFile('table-export.csv', content, 'text/csv')

  if (status !== true) {
    Notify.create({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
}
import type { IWorkbookData } from '@univerjs/presets'
import { covertCellValues } from '@univerjs/presets'
import type { SectionData, SectionField } from '@/types'


export * from './action'
export * from './file'
export * from './generate'
export * from './icon'
export * from './request'


/**
 * Check if a value is a number
 * @param {unknown} val - The value to check
 * @returns {boolean} - True if the value is a number, otherwise false
 */
export const isNumber = (val: unknown): val is number => {
  return typeof val === 'number' && isFinite(val)
}

/**
 * Format a duration given in milliseconds into a human-readable string
 * @param {number} milliseconds - The duration in milliseconds
 * @returns {string} - The formatted duration
 */
export function formatDuration(ms: number): string {
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
    parts.push(`${msStr}ms`)
  }

  return sign + (parts.length > 0 ? parts.join('') : '0ms')
}

/**
 * 数组截取、可展示数组长度
 * @param array 集合、数组
 * @param count 截取树
 * @returns 截取后的数组、集合
 */
export function visibleArray<T extends object | string | number>(array: T[], count: number): T[] {
  if (array && array.length) {
    return array.length > count ? array.slice(0, count) : array
  }
  return []
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
 * 转换 WorkbookData
 * @param apiData 后端返回的数组列表
 * @param headers 动态表头配置
 */
export function transformToWorkbookData(headers: SectionField[], datas: SectionData[], sheetName?: string): Partial<IWorkbookData> {
  // 1. 边界处理：如果没有定义任何列，返回空工作簿
  if (!headers || headers.length === 0) {
    return {}
  }

  if (!sheetName) {
    sheetName = 'sheet1'
  }

  // 2. 构造二维数组，第一行直接放入 SectionField 的 name (即列名)
  const matrixData: string[][] = [
    headers.map(h => h.name)
  ]

  // 3. 遍历数据行，动态提取每个 field 对应的值
  datas.forEach(item => {
    // 这里的 item.data 是一个键值对对象 { [key: string]: unknown }
    const targetData = item.data || {}

    // 严格按照 headers 数组中 field 的顺序映射数据
    const row: string[] = headers.map((h: SectionField): string => {
      const value = targetData[h.field]

      // 严格检查并转换为 string
      if (value === undefined || value === null) {
        return ''
      }
      return String(value)
    })

    matrixData.push(row)
  })

  // 4. 计算矩阵的精确行列数
  const rowsCount = matrixData.length    // 总行数（包含 1 行表头）
  const colsCount = headers.length       // 总列数

  // 5. 调用双参数的 convertCellValues 方法
  const cellData = covertCellValues(matrixData, {
    startRow: 0,
    startColumn: 0,
    endRow: rowsCount - 1,
    endColumn: colsCount - 1
  })

  // 6. 返回符合标准结构的配置
  return {
    id: '',
    sheets: {
      sheetName: {
        id: sheetName,
        // 动态设置画布边界，比实际数据多出一些空白格方便用户编辑
        rowCount: Math.max(rowsCount + 10, 50),
        columnCount: Math.max(colsCount + 5, 15),
        cellData: cellData
      }
    }
  }
}
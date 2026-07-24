export * from './action'
export * from './file'
export * from './format'
export * from './generate'
export * from './icon'
export * from './request'

/**
 * Check if a value is a number
 * @param {unknown} val - The value to check
 * @returns {boolean} - True if the value is a number, otherwise false
 */
export function isNumber (val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val)
}

/**
 * 数组截取、可展示数组长度
 * @param array 集合、数组
 * @param count 截取树
 * @returns 截取后的数组、集合
 */
export function visibleArray<T> (array: T[], count: number): T[] {
  if (array && array.length > 0) {
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
export function groupByKey<T> (
  array: T[],
  typeKey: keyof T,
): { [key: string]: T[] } {
  return array.reduce(
    (acc: { [key: string]: T[] }, curr: T) => {
      const typeValue = curr[typeKey] as string | number // 允许 `string` 或 `number` 类型
      if (!typeValue) {
        return acc
      }
      const groupKey = String(typeValue) // 确保转换为字符串，以便作为对象键

      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(curr)

      return acc
    },
    {} as { [key: string]: T[] },
  )
}

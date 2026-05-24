/**
 * 解析 DSL 字符串为数组，方便 Mock 或测试使用
 * "name:eq:Tom;age:gt:18" => [{ field: 'name', op: 'eq', value: 'Tom' }, ...]
 */
export function parseFilterString(dsl?: string): Array<{ field: string; op: string; value: string }> {
  if (!dsl) return []

  return dsl.split(';').map(item => {
    const [field, op, ...rest] = item.split(':')
    if (!field || !op) {
      throw new Error(`Invalid filter DSL: ${item}`)
    }
    return {
      field, op, value: decodeURIComponent(rest.join(':'))
    }
  })
}

/**
 * 在 Mock 数据中应用过滤
 */
export function applyFilters<T>(datas: T[], filtersDsl?: string | null): T[] {
  if (!filtersDsl) {
    return datas
  }
  const filters = parseFilterString(filtersDsl)
  if (filters.length === 0) return datas

  return datas.filter(item => {
    return filters.every(f => {
      const fieldValue = item[f.field as keyof T]
      const val = f.value

      // 类型安全转换
      let cmpValue: string | number | boolean
      if (fieldValue instanceof Date) {
        cmpValue = fieldValue.toISOString()
      } else if (typeof fieldValue === 'string' || typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
        cmpValue = fieldValue
      } else if (fieldValue == null) {
        cmpValue = '' // null/undefined 用空字符串处理
      } else {
        return true
      }

      switch (f.op) {
        case 'eq':
          return cmpValue == val
        case 'neq':
          return cmpValue != val
        case 'like':
        case 'ilike':
          if (typeof cmpValue !== 'string') return false
          return cmpValue.toLowerCase().includes(val.toLowerCase())
        case 'gt':
          return Number(cmpValue) > Number(val)
        case 'gte':
          return Number(cmpValue) >= Number(val)
        case 'lt':
          return Number(cmpValue) < Number(val)
        case 'lte':
          return Number(cmpValue) <= Number(val)
        case 'in':
          return val.split(',').includes(String(cmpValue))
        case 'notIn':
          return !val.split(',').includes(String(cmpValue))
        case 'between': {
          const [start, end] = val.split(',')
          return Number(cmpValue) >= Number(start) && Number(cmpValue) <= Number(end)
        }
        case 'notBetween': {
          const [start, end] = val.split(',')
          return Number(cmpValue) < Number(start) || Number(cmpValue) > Number(end)
        }
        case 'isNull':
          return fieldValue == null
        case 'isNotNull':
          return fieldValue != null
        default:
          return true
      }
    })
  })
}
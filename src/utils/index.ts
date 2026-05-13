import type { Filter } from 'src/types'

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
  return `${parentPath}${childPath}`.replaceAll(/\/\//g, '/').trim()
}

/**
 * Helper to build query string
 * @param params Object containing query parameters
 * @returns Query string
 */
export function buildQuery (params: Record<string, any>) {
  const query = new URLSearchParams()
  for (const key of Object.keys(params)) {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key])
    }
  }
  return query.toString()
}

/**
 * Process filters for API requests
 * @param filters Filter object
 * @returns Processed filter string or undefined
 */
export function dealFilters<T>(filters?: Filter<T>): string | undefined {
  if (!filters || Object.keys(filters).length === 0) {
    return undefined
  }

  const conditions: string[] = []

  // 使用 keyof T 来遍历，但因为是 Partial，所以要用 keyof typeof filters
  for (const field in filters) {
    const cond = filters[field]
    if (!cond) continue

    const { op, value } = cond

    // 跳过无效值
    if (value == null || value === '') {
      continue
    }

    let valueStr: string

    // 根据 op 处理 value 的字符串化方式
    if (op === 'in' || op === 'notIn') {
      // 假设 value 是数组类型（实际使用时应匹配实体字段类型）
      valueStr = Array.isArray(value) ? value.join(',') : String(value)
    } else if (op === 'between' || op === 'notBetween') {
      // 假设 value 是 [any, any] 形式的数组
      valueStr = Array.isArray(value) && value.length === 2
        ? value.join(',')
        : String(value)
    } else {
      valueStr = String(value).trim()
    }

    // 只在有有效值时加入
    if (valueStr) {
      conditions.push(`${field}:${op}:${valueStr}`)
    }
  }

  return conditions.length > 0 ? conditions.join(',') : undefined
}
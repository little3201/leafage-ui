import type { Filter } from 'src/types'

export function applyFilters<T extends Record<string, any>> (
  datas: T[],
  filters?: Filter<T>,
): T[] {
  if (!filters) {
    return datas
  }

  let filtered = [...datas]

  for (const key in filters) {
    const condition = filters[key]

    if (!condition) {
      continue
    }

    const { op, value } = condition
    if (value == null || value === '') {
      continue
    }

    filtered = filtered.filter(item => {
      const fieldValue = item[key]

      switch (op) {
        case 'eq': {
          return fieldValue === value
        }

        case 'neq': {
          return fieldValue !== value
        }

        case 'gt': {
          return fieldValue > value
        }

        case 'gte': {
          return fieldValue >= value
        }

        case 'lt': {
          return fieldValue < value
        }

        case 'lte': {
          return fieldValue <= value
        }

        case 'like':
        case 'ilike': {
          return String(fieldValue)
            .toLowerCase()
            .includes(String(value).toLowerCase())
        }

        case 'notLike': {
          return !String(fieldValue)
            .toLowerCase()
            .includes(String(value).toLowerCase())
        }

        case 'in': {
          return Array.isArray(value)
            ? value.includes(fieldValue)
            : false
        }

        case 'notIn': {
          return Array.isArray(value)
            ? !value.includes(fieldValue)
            : false
        }

        case 'between': {
          return Array.isArray(value)
            ? fieldValue >= value[0]
            && fieldValue <= value[1]
            : false
        }

        case 'notBetween': {
          return Array.isArray(value)
            ? fieldValue < value[0]
            || fieldValue > value[1]
            : false
        }

        case 'isNull': {
          return fieldValue == null
        }

        case 'isNotNull': {
          return fieldValue != null
        }

        default: {
          return true
        }
      }
    })
  }

  return filtered
}

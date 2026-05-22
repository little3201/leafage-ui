export interface AudtiMetadata {
  id: number | null
  lastModifiedDate?: Date
}

type FilterOperator =
  | 'eq' | 'neq'
  | 'gt' | 'egt' | 'lt' | 'elt'
  | 'like'
  | 'in' | 'notIn'
  | 'between' | 'notBetween'
  | 'isNull' | 'isNotNull'

export type Filter<T> = Partial<{
  [K in keyof T]: {
    op: T[K] extends string | null | undefined
    ? 'eq' | 'neq' | 'like' | 'ilike' | 'notLike' | 'in' | 'notIn' | 'isNull' | 'isNotNull'
    : T[K] extends number | null | undefined
    ? 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn'
    : T[K] extends boolean | null | undefined
    ? 'eq' | 'neq' | 'isNull' | 'isNotNull'
    : T[K] extends Date | string | null | undefined  // 日期通常用 ISO string
    ? 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'notBetween' : FilterOperator
    value: T[K] | undefined
  }
}>

export interface Pagination {
  page: number,
  size: number,
  sortBy?: string,
  descending?: boolean
}

export interface TreeNode {
  id: number | null
  name: string
  children?: TreeNode[]
  isLeaf?: boolean
}
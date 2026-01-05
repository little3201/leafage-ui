// 服务匹配前缀
const SERVER_PREFIX = {
  HYPERVISOR: '/hypervisor', // 系统
}

// 接口请求路径
export const SERVER_URL = {
  USERINFO: '/userinfo', // 用户信息
  LOGIN: '/login', // login
  LOGOUT: '/logout', // 登出

  // hypervisor
  USER: SERVER_PREFIX.HYPERVISOR.concat('/users'), // 用户
  ROLE: SERVER_PREFIX.HYPERVISOR.concat('/roles'), // 角色
  PRIVILEGE: SERVER_PREFIX.HYPERVISOR.concat('/privileges'), // 权限
  GROUP: SERVER_PREFIX.HYPERVISOR.concat('/groups'), // 分组
  DICTIONARY: SERVER_PREFIX.HYPERVISOR.concat('/dictionaries'), // 字典
  ACCESS_LOG: SERVER_PREFIX.HYPERVISOR.concat('/access-logs'), // 访问日志
  AUDIT_LOG: SERVER_PREFIX.HYPERVISOR.concat('/audit-logs'), // 审计日志
  OPERATION_LOG: SERVER_PREFIX.HYPERVISOR.concat('/operation-logs'), // 操作日志
  SCHEDULER_LOG: SERVER_PREFIX.HYPERVISOR.concat('/scheduler-logs'), // 调度日志
  CALENDAR_EVENT: SERVER_PREFIX.HYPERVISOR.concat('/calendar-events'), // 日历事件

  // assets
  REGION: SERVER_PREFIX.HYPERVISOR.concat('/regions'), // 行政区划
  FILE: SERVER_PREFIX.HYPERVISOR.concat('/files'), // 文件
  POST: SERVER_PREFIX.HYPERVISOR.concat('/posts'), // 帖子
  CATEGORY: SERVER_PREFIX.HYPERVISOR.concat('/categories'), // 类别
  STATISTICS: SERVER_PREFIX.HYPERVISOR.concat('/statistics'), // 统计
  COMMENT: SERVER_PREFIX.HYPERVISOR.concat('/comments'), // 评论

  // exploiters
  SCRIPT: SERVER_PREFIX.HYPERVISOR.concat('/scripts'), // 脚本
  SCHEME: SERVER_PREFIX.HYPERVISOR.concat('/schemes'), // 表配置
  SAMPLE: SERVER_PREFIX.HYPERVISOR.concat('/samples'), // 母板
  MODULE: SERVER_PREFIX.HYPERVISOR.concat('/modules'), // 模块
  FRAGMENT: SERVER_PREFIX.HYPERVISOR.concat('/fragments'), // 片段
  CONNECTIONS: SERVER_PREFIX.HYPERVISOR.concat('/connections') // 库连接
}

// 按钮对应tag类型
export const actions: { [key: string]: 'primary' | 'success' | 'info' | 'warning' | 'danger' } = {
  preview: 'success',
  retrieve: 'success',
  fetch: 'success',
  download: 'success',

  create: 'warning',
  import: 'warning',
  upload: 'warning',
  export: 'warning',
  login: 'warning',
  logout: 'warning',

  modify: 'primary',

  remove: 'danger',
  clear: 'danger',

  relation: 'info',
  authorize: 'info',
  config: 'success',
}

// http method对应tag类型
export const httpMethods: { [key: string]: 'success' | 'warning' | 'info' | 'primary' | 'danger' } = {
  GET: 'success',
  POST: 'warning',
  PUT: 'primary',
  PATCH: 'info',
  DELETE: 'danger'
}

// 查询匹配方式
export const queryTypes: { [key: string]: string } = {
  '=': 'eq',
  '<>': 'neq',
  '>': 'gt',
  '>=': 'egt',
  '<': 'lt',
  '<=': 'elt',
  'LIKE': 'like',
  'IN': 'in',
  'NOT IN': 'notIn',
  'BETWEEN': 'between',
  'NOT BETWEEN': 'notBetween',
  'IS NULL': 'isNull',
  'IS NOT NULL': 'isNotNull'
}

export const shceduleStatus: { [key: string]: 'primary' | 'success' | 'info' | 'warning' | 'danger' } = {
  PENDING: 'info',
  RUNNING: 'primary',
  SUCCESS: 'success',
  FAILED: 'danger',
  CANCELED: 'warning'
}

export const shceduleStatusIcon: { [key: string]: string } = {
  PENDING: 'pending-outline',
  RUNNING: 'progress-activity',
  SUCCESS: 'check-rounded',
  FAILED: 'error-outline-rounded',
  CANCELED: 'cancel-outline-rounded'
}

export const userStatus: { [key: string]: 'primary' | 'success' | 'info' | 'warning' | 'danger' } = {
  ACTIVE: 'success',
  LOCKED: 'primary',
  EXPIRED: 'info',
  CREDENTIALS_EXPIRED: 'warning',
  DISABLED: 'danger'
}

export const schemeScope: { [key: string]: string } = {
  ALL: 'all',
  PARTIAL: 'partial'
}

export const databaseType: { [key: string]: string } = {
  POSTGRESQL: 'postgresql',
  MYSQL: 'mysql'
}

export const sampleType: { [key: string]: 'primary' | 'success' } = {
  SINGLE: 'primary',
  COMBINE: 'success'
}

export const languages: { [key: string]: string } = {
  JAVA: 'java',
  YML: 'yml',
  XML: 'xml',
  SQL: 'sql',
  TS: 'ts',
  TSX: 'tsx',
  JS: 'js',
  JSX: 'jsx',
  VUE: 'vue',
  REACT: 'react'
}
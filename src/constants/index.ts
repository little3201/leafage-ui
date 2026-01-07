// 服务匹配前缀
const SERVER_PREFIX = {
  HYPERVISOR: '/hypervisor', // 系统
  ASSETS: '/assets', // 资源
  EXPLOITER: '/exploiter', // 开发者
  OAUTH2: '/oauth2' // oauth2认证
}

// 接口请求路径
export const SERVER_URL = {
  USERINFO: '/userinfo', // 用户信息
  TOKEN: SERVER_PREFIX.OAUTH2.concat('/token'), // token
  AUTHORIZE: SERVER_PREFIX.OAUTH2.concat('/authorize'), // 认证
  LOGOUT: '/connect/logout', // 登出

  // hypervisor
  USER: SERVER_PREFIX.HYPERVISOR.concat('/users'), // 用户
  PRIVILEGE: SERVER_PREFIX.HYPERVISOR.concat('/privileges'), // 权限
  GROUP: SERVER_PREFIX.HYPERVISOR.concat('/groups'), // 分组
  DICTIONARY: SERVER_PREFIX.HYPERVISOR.concat('/dictionaries'), // 字典

  REGION: SERVER_PREFIX.ASSETS.concat('/regions'), // 行政区划
  FILE: SERVER_PREFIX.ASSETS.concat('/files'), // 文件

  ACCESS_LOG: SERVER_PREFIX.HYPERVISOR.concat('/access-logs'), // 访问日志
  AUDIT_LOG: SERVER_PREFIX.HYPERVISOR.concat('/audit-logs'), // 审计日志
  OPERATION_LOG: SERVER_PREFIX.HYPERVISOR.concat('/operation-logs'), // 操作日志
  SCHEDULER_LOG: SERVER_PREFIX.HYPERVISOR.concat('/scheduler-logs'), // 调度日志

  // assets
  POST: SERVER_PREFIX.ASSETS.concat('/posts'), // 帖子
  CATEGORY: SERVER_PREFIX.ASSETS.concat('/categories'), // 类别
  STATISTICS: SERVER_PREFIX.ASSETS.concat('/statistics'), // 统计
  COMMENT: SERVER_PREFIX.ASSETS.concat('/comments'), // 评论

  SIGNIN: SERVER_PREFIX.ASSETS.concat('/signin'), // 登录
  SIGNOUT: SERVER_PREFIX.ASSETS.concat('/signout'), // 退出

  // exploiters
  SCRIPT: SERVER_PREFIX.EXPLOITER.concat('/scripts'), // 脚本
  SCHEMA: SERVER_PREFIX.EXPLOITER.concat('/schemas'), // 计划
  SAMPLE: SERVER_PREFIX.EXPLOITER.concat('/samples'), // 样板
  CONNECTION: SERVER_PREFIX.EXPLOITER.concat('/connections') // 连接
}

export const actions: { [key: string]: string } = {
  create: 'primary',
  modify: 'primary',
  upload: 'primary',

  import: 'warning',

  remove: 'negative',
  clear: 'negative',

  export: 'secondary',
  download: 'secondary',

  relation: 'positive',
  config: 'positive',

  preview: 'info',
  detail: 'info'
}

export const httpMethods: { [key: string]: string } = {
  GET: 'positive',
  POST: 'warning',
  PUT: 'primary',
  PATCH: 'info',
  DELETE: 'negative'
}

// 查询匹配方式
export const queryTypes = [
  { label: '=', value: 'eq' },
  { label: '<>', value: 'neq' },
  { label: '>', value: 'gt' },
  { label: '>=', value: 'egt' },
  { label: '<', value: 'lt' },
  { label: '<=', value: 'elt' },
  { label: 'LIKE', value: 'like' },
  { label: 'IN', value: 'in' },
  { label: 'NOT IN', value: 'notIn' },
  { label: 'BETWEEN', value: 'between' },
  { label: 'NOT BETWEEN', value: 'notBetween' },
  { label: 'IS NULL', value: 'isNull' },
  { label: 'IS NOT NULL', value: 'isNotNull' }
]

export const shceduleStatus: { [key: string]: 'primary' | 'positive' | 'info' | 'warning' | 'negative' } = {
  PENDING: 'info',
  RUNNING: 'primary',
  SUCCESS: 'positive',
  FAILED: 'negative',
  CANCELED: 'warning'
}

export const shceduleStatusIcon: { [key: string]: string } = {
  PENDING: 'pending',
  RUNNING: 'progress_activity',
  SUCCESS: 'check',
  FAILED: 'error',
  CANCELED: 'cancel'
}
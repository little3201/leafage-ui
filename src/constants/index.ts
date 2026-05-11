// 服务匹配前缀
const SERVER_PREFIX = {
  HYPERVISOR: '/hypervisor', // 系统
  OAUTH2: '/oauth2', // oauth2认证
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

  REGION: SERVER_PREFIX.HYPERVISOR.concat('/regions'), // 行政区划
  FILE: SERVER_PREFIX.HYPERVISOR.concat('/files'), // 文件

  ACCESS_LOG: SERVER_PREFIX.HYPERVISOR.concat('/access-logs'), // 访问日志
  AUDIT_LOG: SERVER_PREFIX.HYPERVISOR.concat('/audit-logs'), // 审计日志
  OPERATION_LOG: SERVER_PREFIX.HYPERVISOR.concat('/operation-logs'), // 操作日志
  SCHEDULER_LOG: SERVER_PREFIX.HYPERVISOR.concat('/scheduler-logs'), // 调度日志
  CALENDAR_EVENT: SERVER_PREFIX.HYPERVISOR.concat('/calendar-events'), // 日历事件

  // assets
  POST: SERVER_PREFIX.HYPERVISOR.concat('/posts'), // 帖子
  CATEGORY: SERVER_PREFIX.HYPERVISOR.concat('/categories'), // 类别
  STATISTICS: SERVER_PREFIX.HYPERVISOR.concat('/statistics'), // 统计
  COMMENT: SERVER_PREFIX.HYPERVISOR.concat('/comments'), // 评论

  SIGNIN: SERVER_PREFIX.HYPERVISOR.concat('/signin'), // 登录
  SIGNOUT: SERVER_PREFIX.HYPERVISOR.concat('/signout'), // 退出

  // exploiters
  SCRIPT: SERVER_PREFIX.HYPERVISOR.concat('/scripts'), // 脚本
  SCHEME: SERVER_PREFIX.HYPERVISOR.concat('/schemes'), // 方案
  SAMPLE: SERVER_PREFIX.HYPERVISOR.concat('/samples'), // 样板
  MODULE: SERVER_PREFIX.HYPERVISOR.concat('/modules'), // 模块
  FRAGMENT: SERVER_PREFIX.HYPERVISOR.concat('/fragments'), // 片段
  CONNECTION: SERVER_PREFIX.HYPERVISOR.concat('/connections'), // 连接
}

export const userStatus: { [key: string]: string } = {
  ACTIVE: 'green',
  LOCKED: 'blue',
  EXPIRED: 'gray',
  CREDENTIALS_EXPIRED: 'orange',
  DISABLED: 'red',
}

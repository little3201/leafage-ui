// 服务匹配前缀
const SERVER_PREFIX = {
  HYPERVISOR: "/hypervisor" // 系统
};

// 接口请求路径
export const SERVER_URL = {
  LOGIN: "/login", // login
  LOGOUT: "/logout", // 登出

  MESSAGE: SERVER_PREFIX.HYPERVISOR.concat("/messages"), // 消息
  MESSAGE_INBOX: SERVER_PREFIX.HYPERVISOR.concat("/message-inbox"), // 我的消息

  SCHEDULER: SERVER_PREFIX.HYPERVISOR.concat("/schedulers"), // 任务管理
  SCHEDULER_LOG: SERVER_PREFIX.HYPERVISOR.concat("/scheduler-logs"), // 调度日志

  AUDIT_PATROL: SERVER_PREFIX.HYPERVISOR.concat("/audit-patrols"), // 审计人员
  AUDIT_LOG: SERVER_PREFIX.HYPERVISOR.concat("/audit-logs"), // 审计日志

  // hypervisor
  USER: SERVER_PREFIX.HYPERVISOR.concat("/users"), // 用户
  ROLE: SERVER_PREFIX.HYPERVISOR.concat("/roles"), // 角色
  PRIVILEGE: SERVER_PREFIX.HYPERVISOR.concat("/privileges"), // 权限
  GROUP: SERVER_PREFIX.HYPERVISOR.concat("/groups"), // 分组
  DICTIONARY: SERVER_PREFIX.HYPERVISOR.concat("/dictionaries"), // 字典
  ACCESS_LOG: SERVER_PREFIX.HYPERVISOR.concat("/access-logs"), // 访问日志
  OPERATION_LOG: SERVER_PREFIX.HYPERVISOR.concat("/operation-logs"), // 操作日志
  CALENDAR_EVENT: SERVER_PREFIX.HYPERVISOR.concat("/calendar-events"), // 日历事件

  // assets
  REGION: SERVER_PREFIX.HYPERVISOR.concat("/regions"), // 行政区划
  FILE: SERVER_PREFIX.HYPERVISOR.concat("/files"), // 文件
  POST: SERVER_PREFIX.HYPERVISOR.concat("/posts"), // 帖子
  CATEGORY: SERVER_PREFIX.HYPERVISOR.concat("/categories"), // 类别
  STATISTICS: SERVER_PREFIX.HYPERVISOR.concat("/statistics"), // 统计
  COMMENT: SERVER_PREFIX.HYPERVISOR.concat("/comments"), // 评论

  // exploiters
  SCRIPT: SERVER_PREFIX.HYPERVISOR.concat("/scripts"), // 脚本
  SCHEME: SERVER_PREFIX.HYPERVISOR.concat("/schemes"), // 表配置
  SAMPLE: SERVER_PREFIX.HYPERVISOR.concat("/samples"), // 母板
  MODULE: SERVER_PREFIX.HYPERVISOR.concat("/modules"), // 模块
  FRAGMENT: SERVER_PREFIX.HYPERVISOR.concat("/fragments"), // 片段
  CONNECTION: SERVER_PREFIX.HYPERVISOR.concat("/connections"), // 连接

  // docs
  ARCHIVE: SERVER_PREFIX.HYPERVISOR.concat("/archives"), // 档案
  TEMPLATE: SERVER_PREFIX.HYPERVISOR.concat("/templates"), // 模板
  SECTION: SERVER_PREFIX.HYPERVISOR.concat("/sections"), // 章节
  REPORT: SERVER_PREFIX.HYPERVISOR.concat("/reports") // 报表
};

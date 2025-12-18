interface AudtiMetadata {
  id: number | undefined
  lastModifiedDate?: Date
}

export interface Pagination {
  page: number,
  size: number,
  sortBy?: string,
  descending?: boolean
}

export interface User extends AudtiMetadata {
  username: string
  fullName: string
  email: string
  status?: string
  enabled?: boolean
}

export interface UserPrivileges {
  id: number
  username: string
  privilegeId: number
  actions?: string[]
}

export interface Group extends AudtiMetadata {
  name: string
  superiorId?: number
  principal?: string
  members?: string[]
  enabled?: boolean
  description?: string
}

export interface GroupMembers {
  id: number
  groupId: number
  username: string
}

export interface GroupRoles {
  id: number
  groupId: number
  roleId: number
}

export interface GroupPrivileges {
  id: number
  groupId: number
  privilegeId: number
  actions?: string[]
}

export interface Role extends AudtiMetadata {
  name: string
  members?: string[]
  enabled?: boolean
  description?: string
}

export interface RoleMembers {
  id: number
  roleId: number
  username: string
}

export interface RolePrivileges {
  id: number
  roleId: number
  privilegeId: number
  actions?: string[]
}

export interface Privilege extends AudtiMetadata {
  name: string
  superiorId?: number
  path: string
  component: string
  redirect?: string
  icon: string
  actions?: string[]
  count?: number
  hasChildren?: boolean
  enabled?: boolean
  description?: string
}

export interface Dictionary extends AudtiMetadata {
  name: string
  superiorId?: number
  enabled?: boolean
  description?: string
  count?: number
  hasChildren?: boolean
}

export interface Region extends AudtiMetadata {
  name: string
  superiorId?: number
  areaCode?: number
  postalCode?: number
  hasChildren?: boolean
  enabled?: boolean
  description?: string
}

export interface TreeNode {
  id?: number
  name: string
  children?: TreeNode[]
}

export interface PrivilegeTreeNode extends TreeNode {
  meta: {
    path: string
    component: string
    redirect?: string
    icon: string
    actions?: string[]
  },
  children?: PrivilegeTreeNode[]
}

export interface SampleNode {
  frontend: SampleTreeNode[]
  backend: SampleTreeNode[]
  resources: SampleTreeNode[]
}

export interface SampleTreeNode extends TreeNode {
  body?: string
  type?: string
  suffix?: string
  children?: SampleTreeNode[]
}

export interface OperationLog extends AudtiMetadata {
  module: string
  action: string
  params: string
  body?: string
  ip?: string
  sessionId?: string
  userAgent?: string
  statusCode?: number
  operator?: string
  operatedAt?: Date
}

export interface AccessLog extends AudtiMetadata {
  url: string
  httpMethod: string
  params?: string
  body?: string
  ip: string
  duration?: number
  statusCode?: number
  response?: string
}

export interface AuditLog extends AudtiMetadata {
  resource: string
  action: string
  targetId?: number
  oldValue?: string
  newValue?: string
  ip: string
  statusCode?: number
  duration?: number
}

export interface SchedulerLog extends AudtiMetadata {
  name: string
  startTime?: Date
  duration?: number
  nextExecuteTime?: Date
  status?: string
  record?: string
}

export interface FileRecord extends AudtiMetadata {
  name: string
  extension?: string
  path: string
  contentType?: string
  size: number
  directory?: boolean
  regularFile?: boolean
  symbolicLink?: boolean
  lastModifiedDate?: Date
}

export interface Schema extends AudtiMetadata {
  name: string
  connectionId: number | undefined
  prefix?: string
  packageName: string
  enabled?: boolean
  samples: number[]
}

export interface Field extends AudtiMetadata {
  name: string
  dataType: string
  length: number
  fieldType: string
  formType: string
  tsType: string
  nullable: boolean
  unique: boolean
  queryable: boolean
  queryType: string | undefined
  editable: boolean
  sortable: boolean
  description: string
}

export interface Sample extends AudtiMetadata {
  name: string
  suffix: string
  body: string
  category: string | undefined
  type: string | undefined
  version?: number
  enabled?: boolean
}

export interface Script extends AudtiMetadata {
  name: string
  type: string | undefined
  icon: string
  version: string
  body: string
}

export interface Connection extends AudtiMetadata {
  name: string
  host: string
  port: number | undefined
  username: string
  password?: string
  enabled?: boolean
  tables?: string[]
}

export interface Schedule extends AudtiMetadata {
  title: string
  location?: string
  startDate: string
  endDate: string
  type?: string
}
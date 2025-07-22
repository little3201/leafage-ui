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
  firstname: string
  lastname: string
  middleName?: string
  email: string
  avatar?: string
  accountNonLocked?: boolean
  accountExpiresAt?: Date
  credentialsExpiresAt?: Date
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

export interface MasterPlateNode {
  frontend: MasterPlateTreeNode[]
  backend: MasterPlateTreeNode[]
  resources: MasterPlateTreeNode[]
}

export interface MasterPlateTreeNode extends TreeNode {
  content?: string
  type?: string
  suffix?: string
  children?: MasterPlateTreeNode[]
}

export interface OperationLog extends AudtiMetadata {
  operation: string
  content: string
  ip: string
  location: string
  referer?: string
  sessionId?: string
  os?: string
  deviceType?: string
  userAgent?: string
  browser?: string
  statusCode?: number
  operatedTimes?: number
}

export interface AccessLog extends AudtiMetadata {
  url: string
  httpMethod: string
  params?: string
  body?: string
  ip: string
  location: string
  responseTimes?: number
  statusCode?: number
  responseMessage?: string
}

export interface AuditLog extends AudtiMetadata {
  operation: string
  resource: string
  oldValue?: string
  newValue?: string
  ip: string
  location: string
  statusCode?: number
  operatedTimes?: number
}

export interface SchedulerLog extends AudtiMetadata {
  name: string
  startTime?: Date
  executedTimes?: number
  nextExecuteTime?: Date
  status?: number
  record?: string
}

export interface FileRecord extends AudtiMetadata {
  name: string
  type: 'file' | 'directory'
  mimeType?: string
  size: number
  path: string
}

export interface Schema extends AudtiMetadata {
  name: string
  connectionId: number | undefined
  prefix?: string
  packagePath: string
  enabled?: boolean
  templates: number[]
}

export interface Field extends AudtiMetadata {
  name: string
  dataType: string
  length: number
  fieldType: string
  formType: string
  nullable: boolean
  queryable: boolean
  queryType: string | undefined
  editable: boolean
  sortable: boolean
  description: string
}

export interface MasterPlate extends AudtiMetadata {
  name: string
  suffix: string
  content: string
  type: string | undefined
  version: string
  enabled?: boolean
}

export interface Script extends AudtiMetadata {
  name: string
  type: string | undefined
  icon: string
  version: string
  content: string
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
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
  superiorId: number | null
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
  superiorId: number | null
  path: string
  component: string
  redirect?: string
  icon: string
  actions?: string[]
  enabled?: boolean
  description?: string
  count?: number
  hasChildren?: boolean
}

export interface Dictionary extends AudtiMetadata {
  name: string
  superiorId: number | null
  enabled?: boolean
  description?: string
  count?: number
  hasChildren?: boolean
}

export interface Region extends AudtiMetadata {
  name: string
  superiorId: number | null
  areaCode?: number
  postalCode?: number
  hasChildren?: boolean
  enabled?: boolean
  description?: string
  count?: number
  hasChildren?: boolean
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

export interface Scheme extends AudtiMetadata {
  module: string
  connectionId: number | undefined
  packageName: string
  tables: string[]
  samples: number[]
  scope: string
  enabled?: boolean
}

export interface Field extends AudtiMetadata {
  schemeId: number
  tableName: string
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
  module: string
  stack: string
  body: string
  file_path?: string
  type: string | undefined
  version?: number
  enabled?: boolean
}

export interface Module extends AudtiMetadata {
  name: string
  description?: string
  version?: number
  enabled?: boolean
}

export interface SampleModule {
  id: number
  sampleId: number
  moduleId: number
}


export interface Fragment extends AudtiMetadata {
  name: string
  language: string
  imports?: string
  body: string
  version?: number
  enabled?: boolean
}

export interface ModuleFragment {
  id: number
  moduleId: number
  fragmentId: number
}

export interface Script extends AudtiMetadata {
  name: string
  type: string | undefined
  icon: string
  version: string
  body: string
}

export interface Connection extends AudtiMetadata {
  type: string
  database: string
  host: string
  port: number | undefined
  username: string
  password?: string
  params?: string
}

export interface Schedule extends AudtiMetadata {
  title: string
  location?: string
  startDate: string
  endDate: string
  type?: string
}
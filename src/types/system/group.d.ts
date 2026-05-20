import type { AudtiMetadata } from '../global'

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
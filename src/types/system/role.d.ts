import type { AudtiMetadata } from '../global'
import type { User } from './user'

export interface Role extends AudtiMetadata {
  name: string
  members?: User[]
  enabled?: boolean
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
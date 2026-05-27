import type { AudtiMetadata } from '../global'

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
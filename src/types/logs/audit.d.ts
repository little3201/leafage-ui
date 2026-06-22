import type { AudtiMetadata } from '../global'

export interface AuditLog extends AudtiMetadata {
  module: string
  action: string
  targetId?: number
  oldValue?: string
  newValue?: string
  ip?: string
  status?: string
  duration?: number
}
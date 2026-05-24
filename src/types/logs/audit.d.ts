import type { AudtiMetadata } from '../global'

export interface AuditLog extends AudtiMetadata {
  module: string
  action: string
  targetId?: number
  oldValue?: string
  newValue?: string
  ip: string
  statusCode?: number
  duration?: number
}
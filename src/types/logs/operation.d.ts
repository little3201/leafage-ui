import type { AudtiMetadata } from '../global'

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
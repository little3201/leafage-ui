import type { AudtiMetadata } from '../global'

export interface OperationLog extends AudtiMetadata {
  module: string
  action: string
  targetId?: number
  params: string
  response?: string
  message?: string
  status?: string
  duration?: number
  operator?: string
  operatedAt?: Date
}

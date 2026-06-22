import type { AudtiMetadata } from '../global'

export interface OperationLog extends AudtiMetadata {
  module: string
  action: string
  params: string
  response?: string
  status?: string
  duration?: number
  operator?: string
  operatedAt?: Date
}
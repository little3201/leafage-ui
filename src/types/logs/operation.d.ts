import type { AudtiMetadata } from '../global'

export interface OperationLog extends AudtiMetadata {
  module: string
  action: string
  params: string
  result?: string
  status?: number
  duration?: number
  operator?: string
  operatedAt?: Date
}
import type { AudtiMetadata } from '../global'

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
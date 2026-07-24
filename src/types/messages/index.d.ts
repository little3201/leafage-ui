import type { AudtiMetadata } from '../global'

export interface Message extends AudtiMetadata {
  title: string
  body?: string
  scope: string
  type: string | null
  sender?: string
  receivers: string[]
  status?: string
  publishedAt?: Date
}

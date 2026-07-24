import type { AudtiMetadata } from '../global'

export interface MessageInbox extends AudtiMetadata {
  message: Message
  receiver: string
  status?: string
  readAt?: Date
}

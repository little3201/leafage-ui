import type { AudtiMetadata } from '../global'

export interface Scheduler extends AudtiMetadata {
  name: string
  task: Dastringte
  corn: string
  params?: string
  enabled?: boolean
}

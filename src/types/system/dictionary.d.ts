import type { AudtiMetadata } from '../global'

export interface Dictionary extends AudtiMetadata {
  name: string
  superiorId: number | null
  enabled?: boolean
  description?: string
  count?: number
  hasChildren?: boolean
}
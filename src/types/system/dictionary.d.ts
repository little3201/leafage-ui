import type { AudtiMetadata } from '../global'

export interface Dictionary extends AudtiMetadata {
  name: string
  superiorId: number | null
  enabled?: boolean
  count?: number
  hasChildren?: boolean
}

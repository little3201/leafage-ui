import type { AudtiMetadata } from '../global'

export interface Region extends AudtiMetadata {
  name: string
  superiorId: number | null
  areaCode?: number
  postalCode?: number
  enabled?: boolean
  description?: string
  count?: number
  isLeaf?: boolean
}
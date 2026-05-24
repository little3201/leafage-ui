import type { AudtiMetadata } from '../global'

export interface Archive extends AudtiMetadata {
  title: string
  schemaId: number | null
  owner?: string
  body?: string
  version?: number
}
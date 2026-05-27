import type { AudtiMetadata } from '../global'

export interface Report extends AudtiMetadata {
  title: string
  schemaId: number | null
  body?: string
  version?: number
}
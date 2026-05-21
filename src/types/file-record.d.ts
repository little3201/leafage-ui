import type { AudtiMetadata } from '../global'

export interface FileRecord extends AudtiMetadata {
  superiorId: number | null
  name: string
  extension?: string
  path: string
  contentType?: string
  size: number
  directory: boolean
}
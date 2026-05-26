import type { AudtiMetadata } from '../global'

export interface Template extends AudtiMetadata {
  name: string
  type: 'WORD' | 'EXCEL'
  version: number
  status?: string
  description?: string
}
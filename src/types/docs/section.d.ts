import type { IDocumentBody } from '@univerjs/presets'
import type { AudtiMetadata, TreeNode } from '../global'

export interface Section extends AudtiMetadata {
  superiorId: number | null
  ownerId: number | null
  ownerType: string | null
  name: string
  sequence?: number
  level?: number
  body: IDocumentBody
  count?: number
}

export interface SectionTreeNode extends TreeNode {
  meta: {
    sequence: number
  }
}

export interface SectionField extends AudtiMetadata {
  name: string
  sectionId: number | null
  field: string
  type: string
  length: number
  required: boolean
}

export interface SectionData extends AudtiMetadata {
  sectionId: number
  data: {
    [key: string]: unknown
  }
}
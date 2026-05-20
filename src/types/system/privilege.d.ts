import type { AudtiMetadata, TreeNode } from '../global'

export interface Privilege extends AudtiMetadata {
  name: string
  superiorId: number | null
  path: string
  component: string
  redirect?: string
  icon: string
  actions?: string[]
  enabled?: boolean
  description?: string
  count?: number
  hasChildren?: boolean
}

export interface PrivilegeAction extends AudtiMetadata {
  privilegeId: number | null
  name: string
  icon: string
  type: string | null
  enabled: boolean
}

export interface PrivilegeTreeNode extends TreeNode {
  meta: {
    path: string
    component: string
    redirect?: string
    icon: string
    actions?: string[]
  },
  children?: PrivilegeTreeNode[]
}
import type { AudtiMetadata, TreeNode } from "../global";

export interface Privilege extends AudtiMetadata {
  name: string;
  superiorId: number | null;
  path: string;
  component: string;
  redirect?: string;
  actions?: string[];
  enabled?: boolean;
  count?: number;
  hasChildren?: boolean;
}

export interface PrivilegeAction extends AudtiMetadata {
  privilegeId: number | null;
  name: string;
  type: string | null;
  enabled: boolean;
}

export interface PrivilegeTreeNode extends TreeNode {
  meta: {
    path: string;
    component: string;
    redirect?: string;
    actions?: string[];
  };
  children?: PrivilegeTreeNode[];
}

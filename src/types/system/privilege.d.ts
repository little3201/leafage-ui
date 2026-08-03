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

export interface PrivilegeTreeNode extends TreeNode {
  meta: {
    path: string;
    component: string;
    redirect?: string;
    actions?: string[];
  };
  children?: PrivilegeTreeNode[];
}

export interface PrivilegeActions {
  id: number;
  privilegeId: number;
  name: string;
  actions: string[];
}

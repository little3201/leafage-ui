import type { AudtiMetadata } from "../global";
import type { PrivilegeTreeNode } from "./privilege";

export interface User extends AudtiMetadata {
  username: string;
  fullName: string;
  email: string;
  status?: string;
  enabled?: boolean;
}

export interface UserPrivileges {
  id: number;
  username: string;
  privilegeId: number;
  actions?: string[];
}

export interface Userinfo {
  username: string;
  fullName: string;
  accessToken: string;
  idToken: string;
  email: string;
  privileges: PrivilegeTreeNode[];
  routesAdded: boolean;
}

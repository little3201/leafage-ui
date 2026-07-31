import type { AudtiMetadata } from "../global";
import type { PrivilegeTreeNode } from "./privilege";
import type { Role } from "./role";

export interface User extends AudtiMetadata {
  username: string;
  fullName: string;
  email: string;
  roles?: Role[] | number[];
  enabled?: boolean;
}

export interface Userinfo {
  username: string;
  fullName: string;
  email: string;
  privileges: PrivilegeTreeNode[];
  routesAdded: boolean;
}

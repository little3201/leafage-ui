import type { AudtiMetadata } from "../global";
import type { PrivilegeTreeNode } from "./privilege";
import type { Role } from "./role";

export interface User extends AudtiMetadata {
  username: string;
  fullName: string;
  email: string;
  roles?: Role[];
  enabled?: boolean;
}

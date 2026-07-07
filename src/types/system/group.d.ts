import type { AudtiMetadata } from "../global";
import type { Role } from "./role";
import type { User } from "./user";

export interface Group extends AudtiMetadata {
  name: string;
  superiorId: number | null;
  members?: User[];
  roles?: Role[];
  enabled?: boolean;
}

export interface GroupMembers {
  id: number;
  groupId: number;
  username: string;
}

export interface GroupRoles {
  id: number;
  groupId: number;
  roleId: number;
}

export interface GroupPrivileges {
  id: number;
  groupId: number;
  privilegeId: number;
  actions?: string[];
}

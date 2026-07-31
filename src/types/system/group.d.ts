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

export interface GroupPrivileges {
  id: number;
  groupId: number;
  privilegeId: number;
  actions?: string[];
}

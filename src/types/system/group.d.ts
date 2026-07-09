import type { AudtiMetadata } from "../global";

export interface Group extends AudtiMetadata {
  name: string;
  superiorId: number | null;
  members?: User[];
  enabled?: boolean;
}

export interface GroupMembers {
  id: number;
  groupId: number;
  username: string;
}

export interface GroupPrivileges {
  id: number;
  groupId: number;
  privilegeId: number;
  actions?: string[];
}

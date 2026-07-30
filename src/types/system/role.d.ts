import type { AudtiMetadata } from "../global";

export interface Role extends AudtiMetadata {
  name: string;
  code: string;
  builtIn?: boolean;
  enabled?: boolean;
}

export interface RolePrivileges {
  id: number;
  roleId: number;
  privilegeId: number;
  actions?: string[];
}

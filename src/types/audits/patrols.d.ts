import type { User } from "../system/user";

export interface SafetyPatrol extends User {
  role: string;
}

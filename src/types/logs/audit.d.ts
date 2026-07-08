import type { AudtiMetadata } from "../global";

export interface AuditLog extends AudtiMetadata {
  module: string;
  action: string;
  targetId: number | null;
  oldValue?: string;
  newValue?: string;
  ip?: string;
  status?: string;
  duration: number | null;
}

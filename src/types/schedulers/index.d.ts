import type { AudtiMetadata } from "../global";

export interface Scheduler extends AudtiMetadata {
  name: string;
  cronExpression: string;
  lastExecuteTime?: Date;
  nextExecuteTime?: Date;
  status?: string;
  enabled?: boolean;
}

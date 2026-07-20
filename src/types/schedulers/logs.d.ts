import type { AudtiMetadata } from "../global";

export interface SchedulerLog extends AudtiMetadata {
  name: string;
  startTime?: Date;
  duration?: number;
  nextExecuteTime?: Date;
  status?: string;
  record?: string;
}

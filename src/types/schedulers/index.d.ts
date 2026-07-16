import type { AudtiMetadata } from "../global";

export interface Scheduler extends AudtiMetadata {
  name: string;
  task: Dastringte;
  corn: string;
  params?: string;
  enabled?: boolean;
}

export interface SchedulerLog extends AudtiMetadata {
  name: string;
  startTime?: Date;
  duration?: number;
  nextExecuteTime?: Date;
  status?: string;
  record?: string;
}

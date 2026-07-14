import type { AudtiMetadata } from "../global";

export interface CalendarEvent extends AudtiMetadata {
  title: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  type: string;
}

export interface SchedulerLog extends AudtiMetadata {
  name: string;
  startTime?: Date;
  duration?: number;
  nextExecuteTime?: Date;
  status?: string;
  record?: string;
}

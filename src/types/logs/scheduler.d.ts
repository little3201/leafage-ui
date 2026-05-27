import type { AudtiMetadata } from '../global'

export interface Schedule extends AudtiMetadata {
  title: string
  location?: string
  startDate: string
  endDate: string
  type: 'primary' | 'success' | 'warning' | 'danger'
}

export interface SchedulerLog extends AudtiMetadata {
  name: string
  startTime?: Date
  duration?: number
  nextExecuteTime?: Date
  status?: string
  record?: string
}
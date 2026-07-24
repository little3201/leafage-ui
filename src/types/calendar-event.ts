import type { AudtiMetadata } from './global'

export interface CalendarEvent extends AudtiMetadata {
  title: string
  location?: string
  startDate: Date
  endDate: Date
  type: string
}

export interface EventSegment {
  event: CalendarEvent
  start: Date
  end: Date
  row: number
  key: string | number
}

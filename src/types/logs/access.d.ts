import type { AudtiMetadata } from "../global";

export interface AccessLog extends AudtiMetadata {
  url: string;
  httpMethod: string;
  targetId: number | null;
  params?: string;
  body?: string;
  ip: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  response?: string;
}

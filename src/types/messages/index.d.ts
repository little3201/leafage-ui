import type { AudtiMetadata } from "../global";
import type { User } from "./user";

export interface Message extends AudtiMetadata {
  title: string;
  body?: string;
  scope: string;
  type: string | null;
  sender?: string;
  receivers: string[];
  status?: string;
  publishedAt?: Date;
}

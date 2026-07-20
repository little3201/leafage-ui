import type { AudtiMetadata } from "../global";
import type { User } from "./user";

export interface Message extends AudtiMetadata {
  title: string;
  body?: string;
  sender?: string;
  scope: string;
  type: string | null;
  receiver: User[] | null;
  status?: string;
  publishedAt?: Date;
}

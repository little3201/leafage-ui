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

export interface MessageInbox extends AudtiMetadata {
  message: Message;
  receiver: string;
  status?: string;
  readAt?: Date;
}

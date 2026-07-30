import type { AudtiMetadata } from "../global";

export interface MessageInbox extends AudtiMetadata {
  message: Message;
  status?: string;
  readAt?: Date;
}

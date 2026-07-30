import type { AudtiMetadata } from "../global";
import type { User } from "../system/user";

export interface Message extends AudtiMetadata {
  title: string;
  body?: string;
  scope: string;
  type: string | null;
  sender?: string;
  targets: MessageTarget[] | number[];
  status?: string;
  publishedAt?: Date;
}

export interface MessageTarget {
  id: number;
  name: string;
}

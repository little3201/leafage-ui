import type { AudtiMetadata } from "./global";

export interface Region extends AudtiMetadata {
  name: string;
  superiorId: number | null;
  areaCode?: number;
  postalCode?: number;
  enabled?: boolean;
  count?: number;
  isLeaf?: boolean;
}

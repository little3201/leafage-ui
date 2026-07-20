import type { Privilege, PrivilegeTreeNode } from "@/types";
import { randomInt } from "../../util";

export const root_files: Privilege = {
  id: 13,
  superiorId: null,
  path: "files",
  component: "files",
  name: "files",
  actions: ["upload", "download", "remove", "enable", "disable"],
  count: 0,
  enabled: randomInt(2) > 0
};

export const nodes_files: Privilege[] = [];

export const tree_files: PrivilegeTreeNode[] = [
  {
    id: 13,
    name: "files",
    meta: {
      path: "files",
      component: "files",
      actions: ["download", "upload", "remove", "enable", "disable"]
    }
  }
];

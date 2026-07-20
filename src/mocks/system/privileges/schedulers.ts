import type { Privilege, PrivilegeTreeNode } from "@/types";
import { randomInt } from "node:crypto";

export const root_schedulers: Privilege = {
  id: 11,
  superiorId: null,
  name: "schedulers",
  path: "schedulers",
  component: "#",
  count: 2,
  enabled: randomInt(0, 2) > 0
};

export const nodes_schedulers: Privilege[] = [
  {
    id: 30,
    superiorId: 11,
    name: "tasks",
    path: "",
    component: "schedulers",
    actions: ["create", "modify", "remove", "enable", "disable"],
    count: 0,
    enabled: randomInt(0, 2) > 0
  },
  {
    id: 31,
    name: "logs",
    superiorId: 11,
    path: "logs",
    component: "schedulers/logs",
    actions: ["remove", "export", "clear"],
    count: 0,
    enabled: randomInt(0, 2) > 0
  }
];

export const tree_schedulers: PrivilegeTreeNode[] = [
  {
    id: 11,
    name: "schedulers",
    meta: {
      path: "schedulers",
      component: "#"
    },
    children: [
      {
        id: 30,
        name: "tasks",
        meta: {
          path: "",
          component: "schedulers",
          actions: ["create", "modify", "remove", "enable", "disable"]
        },
        children: []
      },
      {
        id: 31,
        name: "schedulerLogs",
        meta: {
          path: "logs",
          component: "schedulers/logs",
          actions: [
            "create",
            "modify",
            "remove",
            "import",
            "export",
            "section",
            "enable",
            "disable"
          ]
        },
        children: []
      }
    ]
  }
];

import type { Privilege, PrivilegeTreeNode } from "@/types";

export const root_audits: Privilege = {
  id: 10,
  superiorId: null,
  path: "audits",
  component: "#",
  name: "audits",
  count: 2,
  enabled: Math.floor(Math.random() * 2) > 0
};

export const nodes_audits: Privilege[] = [
  {
    id: 32,
    superiorId: 10,
    path: "",
    component: "audits/patrols",
    name: "audits",
    actions: ["create", "modify", "remove"],
    count: 0,
    enabled: Math.floor(Math.random() * 2) > 0
  },
  {
    id: 33,
    superiorId: 10,
    path: "logs",
    component: "audits/logs",
    name: "auditLogs",
    actions: ["remove", "export"],
    count: 0,
    enabled: Math.floor(Math.random() * 2) > 0
  }
];

export const tree_audits: PrivilegeTreeNode[] = [
  {
    id: 10,
    name: "audits",
    meta: {
      path: "audits",
      component: "#"
    },
    children: [
      {
        id: 32,
        name: "patrols",
        meta: {
          path: "",
          component: "audits/patrols",
          actions: ["create", "modify", "remove"]
        }
      },
      {
        id: 33,
        name: "auditLogs",
        meta: {
          path: "logs",
          component: "audits/logs",
          actions: ["remove", "export"]
        }
      }
    ]
  }
];

import type { Privilege, PrivilegeTreeNode } from "@/types";

export const root_logs: Privilege = {
  id: 7,
  superiorId: null,
  path: "logs",
  component: "#",
  redirect: "operation",
  name: "logs",
  count: 3,
  enabled: Math.floor(Math.random() * 2) > 0
};

export const nodes_logs: Privilege[] = [
  {
    id: 8,
    superiorId: 7,
    path: "operation",
    component: "logs/operation",
    name: "operationLogs",
    actions: ["clear", "export", "remove"],
    count: 0,
    enabled: Math.floor(Math.random() * 2) > 0
  },
  {
    id: 9,
    superiorId: 7,
    path: "access",
    component: "logs/access",
    name: "accessLogs",
    actions: ["clear", "export", "remove"],
    count: 0,
    enabled: Math.floor(Math.random() * 2) > 0
  }
];

export const tree_logs: PrivilegeTreeNode[] = [
  {
    id: 7,
    name: "logs",
    meta: {
      path: "logs",
      component: "#",
      redirect: "operation"
    },
    children: [
      {
        id: 8,
        name: "operationLogs",
        meta: {
          path: "operation",
          component: "logs/operation",
          actions: ["clear", "remove", "export"]
        }
      },
      {
        id: 9,
        name: "accessLogs",
        meta: {
          path: "access",
          component: "logs/access",
          actions: ["clear", "remove", "export"]
        }
      }
    ]
  }
];

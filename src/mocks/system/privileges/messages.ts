import type { Privilege, PrivilegeTreeNode } from "@/types";

export const root_messages: Privilege = {
  id: 26,
  superiorId: null,
  path: "messages",
  name: "messages",
  component: "#",
  count: 3,
  enabled: Math.floor(Math.random() * 2) > 0
};

export const nodes_messages: Privilege[] = [
  {
    id: 27,
    superiorId: 7,
    path: "sent",
    component: "messages",
    name: "sent",
    actions: ["create", "modify", "remove", "publish"],
    count: 0,
    enabled: Math.floor(Math.random() * 2) > 0
  },
  {
    id: 28,
    superiorId: 7,
    path: "inbox",
    component: "messages/inbox",
    name: "inbox",
    actions: ["remove", "read"],
    count: 0,
    enabled: Math.floor(Math.random() * 2) > 0
  }
];

export const tree_messages: PrivilegeTreeNode[] = [
  {
    id: 26,
    name: "messages",
    meta: {
      path: "messages",
      component: "#"
    },
    children: [
      {
        id: 27,
        name: "sent",
        meta: {
          path: "",
          component: "messages",
          actions: ["create", "modify", "remove", "publish"]
        },
        children: []
      },
      {
        id: 28,
        name: "inbox",
        meta: {
          path: "inbox",
          component: "messages/inbox",
          actions: ["remove", "read"]
        },
        children: []
      }
    ]
  }
];

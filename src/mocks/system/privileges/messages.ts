import type { Privilege, PrivilegeTreeNode } from "@/types";
import { randomInt } from "../../util";

export const root_messages: Privilege = {
  id: 26,
  superiorId: null,
  path: "messages",
  name: "messages",
  component: "#",
  count: 3,
  enabled: randomInt(2) > 0
};

export const nodes_messages: Privilege[] = [
  {
    id: 27,
    superiorId: 26,
    path: "sent",
    component: "messages",
    name: "sent",
    actions: ["create", "modify", "remove", "publish", "revoke"],
    count: 0,
    enabled: randomInt(2) > 0
  },
  {
    id: 28,
    superiorId: 26,
    path: "inbox",
    component: "messages/inbox",
    name: "inbox",
    actions: ["remove", "read"],
    count: 0,
    enabled: randomInt(2) > 0
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
          actions: ["create", "modify", "remove", "publish", "revoke"]
        },
        children: []
      },
      {
        id: 28,
        name: "inbox",
        meta: {
          path: "inbox",
          component: "messages/inbox",
          actions: ["remove"]
        },
        children: []
      }
    ]
  }
];

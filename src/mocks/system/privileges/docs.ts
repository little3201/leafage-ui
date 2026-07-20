import type { Privilege, PrivilegeTreeNode } from "@/types";
import { randomInt } from "node:crypto";

export const root_docs: Privilege = {
  id: 22,
  superiorId: null,
  name: "docs",
  path: "docs",
  component: "#",
  redirect: "/docs/reports",
  count: 1,
  enabled: randomInt(0, 2) > 0
};

export const nodes_docs: Privilege[] = [
  {
    id: 23,
    superiorId: 22,
    name: "archives",
    path: "archives",
    component: "docs/archives",
    actions: ["create", "modify", "remove", "import", "export", "section"],
    count: 0,
    enabled: randomInt(0, 2) > 0
  },
  {
    id: 24,
    name: "templates",
    superiorId: 22,
    path: "templates",
    component: "docs/templates",
    actions: [
      "create",
      "modify",
      "remove",
      "import",
      "export",
      "section",
      "enable",
      "disable"
    ],
    count: 0,
    enabled: randomInt(0, 2) > 0
  },
  {
    id: 25,
    superiorId: 22,
    name: "reports",
    path: "reports",
    component: "docs/reports",
    actions: [
      "create",
      "modify",
      "remove",
      "import",
      "export",
      "field",
      "data"
    ],
    count: 0,
    enabled: randomInt(0, 2) > 0
  }
];

export const tree_docs: PrivilegeTreeNode[] = [
  {
    id: 22,
    name: "docs",
    meta: {
      path: "docs",
      component: "#",
      redirect: "/docs/reports"
    },
    children: [
      {
        id: 23,
        name: "archives",
        meta: {
          path: "archives",
          component: "docs/archives",
          actions: ["create", "modify", "remove", "import", "export", "section"]
        },
        children: []
      },
      {
        id: 24,
        name: "templates",
        meta: {
          path: "templates",
          component: "docs/templates",
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
      },
      {
        id: 25,
        name: "reports",
        meta: {
          path: "reports",
          component: "docs/reports",
          actions: [
            "create",
            "modify",
            "remove",
            "import",
            "export",
            "field",
            "data"
          ]
        },
        children: []
      }
    ]
  }
];

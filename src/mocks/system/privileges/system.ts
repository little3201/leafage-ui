import type { Privilege, PrivilegeTreeNode } from "@/types";
import { randomInt } from "../../util";

export const root_system: Privilege = {
  id: 1,
  superiorId: null,
  path: "system",
  component: "#",
  redirect: "users",
  name: "system",
  count: 5,
  enabled: randomInt(2) > 0
};

export const nodes_system: Privilege[] = [
  {
    id: 2,
    superiorId: 1,
    path: "groups",
    component: "system/groups",
    name: "groups",
    actions: [
      "create",
      "modify",
      "remove",
      "import",
      "export",
      "relation",
      "authorize",
      "enable",
      "disable"
    ],
    count: 0,
    enabled: randomInt(2) > 0
  },
  {
    id: 3,
    superiorId: 1,
    path: "users",
    component: "system/users",
    name: "users",
    actions: [
      "create",
      "modify",
      "remove",
      "import",
      "export",
      "enable",
      "disable",
      "unlock"
    ],
    count: 0,
    enabled: randomInt(2) > 0
  },
  {
    id: 4,
    superiorId: 1,
    path: "privileges",
    component: "system/privileges",
    name: "privileges",
    actions: ["modify", "import", "export", "enable", "disable"],
    count: 0,
    enabled: randomInt(2) > 0
  },
  {
    id: 5,
    superiorId: 1,
    path: "roles",
    component: "system/roles",
    name: "roles",
    actions: [
      "create",
      "modify",
      "remove",
      "import",
      "export",
      "relation",
      "authorize",
      "enable",
      "disable"
    ],
    count: 0,
    enabled: randomInt(2) > 0
  },
  {
    id: 6,
    superiorId: 1,
    path: "dictionaries",
    component: "system/dictionaries",
    name: "dictionaries",
    actions: [
      "create",
      "modify",
      "remove",
      "import",
      "export",
      "enable",
      "disable"
    ],
    count: 0,
    enabled: randomInt(2) > 0
  }
];

export const tree_system: PrivilegeTreeNode[] = [
  {
    id: 1,
    name: "system",
    meta: {
      path: "system",
      component: "#",
      redirect: "users"
    },
    children: [
      {
        id: 2,
        name: "groups",
        meta: {
          path: "groups",
          component: "system/groups",
          actions: [
            "create",
            "modify",
            "remove",
            "import",
            "export",
            "relation",
            "authorize",
            "enable",
            "disable"
          ]
        }
      },
      {
        id: 3,
        name: "users",
        meta: {
          path: "users",
          component: "system/users",
          actions: [
            "create",
            "modify",
            "remove",
            "import",
            "export",
            "enable",
            "disable",
            "unlock"
          ]
        }
      },
      {
        id: 4,
        name: "roles",
        meta: {
          path: "roles",
          component: "system/roles",
          actions: [
            "create",
            "modify",
            "remove",
            "import",
            "export",
            "relation",
            "authorize",
            "enable",
            "disable"
          ]
        }
      },
      {
        id: 5,
        name: "dictionaries",
        meta: {
          path: "dictionaries",
          component: "system/dictionaries",
          actions: [
            "create",
            "modify",
            "remove",
            "import",
            "export",
            "enable",
            "disable"
          ]
        }
      },
      {
        id: 6,
        name: "privileges",
        meta: {
          path: "privileges",
          component: "system/privileges",
          actions: ["modify", "import", "export", "enable", "disable"]
        }
      }
    ]
  }
];

import { SERVER_URL } from "@/constants";
import type {
  GroupPrivileges,
  Privilege,
  PrivilegeTreeNode,
  UserPrivileges
} from "@/types";
import { http, HttpResponse } from "msw";
import { applyFilters } from "../util";

const datas: Privilege[] = [
  {
    id: 1,
    path: "system",
    superiorId: null,
    component: "#",
    redirect: "users",
    name: "system",
    count: 5,
    enabled: true
  },
  {
    id: 7,
    path: "logs",
    superiorId: null,
    component: "#",
    redirect: "operation",
    name: "logs",
    count: 3,
    enabled: true
  },
  {
    id: 12,
    path: "regions",
    superiorId: null,
    component: "regions",
    name: "regions",
    actions: ["create", "modify", "remove", "import", "export"],
    count: 0,
    enabled: false
  },
  {
    id: 14,
    path: "files",
    superiorId: null,
    component: "files",
    name: "files",
    actions: ["upload", "download", "remove"],
    count: 0,
    enabled: true
  },
  {
    id: 16,
    path: "exploiters",
    superiorId: null,
    component: "#",
    name: "exploiters",
    redirect: "schemes",
    count: 1,
    enabled: true
  }
];

const subDatas: Privilege[] = [
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
      "enable"
    ],
    count: 0,
    enabled: true
  },
  {
    id: 3,
    superiorId: 1,
    path: "users",
    component: "system/users",
    name: "users",
    actions: ["create", "modify", "remove", "import", "export", "enable"],
    count: 0,
    enabled: true
  },
  {
    id: 4,
    superiorId: 1,
    path: "privileges",
    component: "system/privileges",
    name: "privileges",
    actions: ["modify", "authorize", "import", "export", "enable"],
    count: 0,
    enabled: true
  },
  {
    id: 6,
    superiorId: 1,
    path: "dictionaries",
    component: "system/dictionaries",
    name: "dictionaries",
    actions: ["create", "modify", "remove", "import", "export", "enable"],
    count: 0,
    enabled: true
  },
  {
    id: 8,
    superiorId: 7,
    path: "operation",
    component: "logs/operation",
    name: "operationLogs",
    actions: ["clear", "export", "remove"],
    count: 0,
    enabled: true
  },
  {
    id: 9,
    superiorId: 7,
    path: "access",
    component: "logs/access",
    name: "accessLogs",
    actions: ["clear", "export", "remove"],
    count: 0,
    enabled: true
  },
  {
    id: 10,
    superiorId: 7,
    path: "audit",
    component: "logs/audit",
    name: "auditLogs",
    actions: ["remove", "export"],
    count: 0,
    enabled: true
  },
  {
    id: 11,
    superiorId: 7,
    path: "scheduler",
    component: "logs/scheduler",
    name: "schedulerLogs",
    actions: ["clear", "export", "remove"],
    count: 0,
    enabled: true
  },
  {
    id: 17,
    superiorId: 16,
    path: "connections",
    name: "connections",
    component: "exploiters/connections",
    actions: ["create", "modify", "remove", "import", "export", "enable"],
    count: 0,
    enabled: true
  },
  {
    id: 18,
    superiorId: 16,
    path: "samples",
    name: "samples",
    component: "exploiters/samples",
    actions: ["create", "modify", "remove", "import", "export", "enable"],
    count: 0,
    enabled: true
  },
  {
    id: 19,
    superiorId: 16,
    path: "scripts",
    name: "scripts",
    component: "exploiters/scripts",
    actions: ["create", "modify", "remove", "import", "export"],
    count: 0,
    enabled: true
  },
  {
    id: 20,
    superiorId: 16,
    path: "codes",
    name: "codes",
    component: "#",
    count: 1,
    enabled: true
  },
  {
    id: 21,
    superiorId: 20,
    path: "modules",
    name: "modules",
    component: "exploiters/codes/modules",
    actions: ["create", "modify", "remove", "import", "export", "enable"],
    count: 0,
    enabled: true
  },
  {
    id: 21,
    superiorId: 20,
    path: "samples",
    name: "samples",
    component: "exploiters/samples",
    actions: ["create", "modify", "remove", "import", "export", "enable"],
    count: 0,
    enabled: true
  },
  {
    id: 21,
    superiorId: 20,
    path: "fragments",
    name: "fragments",
    component: "exploiters/codes/fragments",
    actions: ["create", "modify", "remove", "import", "export", "enable"],
    count: 0,
    enabled: true
  }
];

const treeNodes: PrivilegeTreeNode[] = [
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
            "enable"
          ]
        }
      },
      {
        id: 3,
        name: "users",
        meta: {
          path: "users",
          component: "system/users",
          actions: ["create", "modify", "remove", "import", "export", "enable"]
        }
      },
      {
        id: 4,
        name: "privileges",
        meta: {
          path: "privileges",
          component: "system/privileges",
          actions: ["modify", "authorize", "import", "export", "enable"]
        }
      },
      {
        id: 6,
        name: "dictionaries",
        meta: {
          path: "dictionaries",
          component: "system/dictionaries",
          actions: ["create", "modify", "remove", "import", "export", "enable"]
        }
      }
    ]
  },
  {
    id: 7,
    name: "logs",
    meta: {
      path: "logs",
      component: "#",
      redirect: "operation",
      actions: ["clear", "remove", "export"]
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
      },
      {
        id: 10,
        name: "auditLogs",
        meta: {
          path: "audit",
          component: "logs/audit",
          actions: ["remove", "export"]
        }
      },
      {
        id: 11,
        name: "schedulerLogs",
        meta: {
          path: "scheduler",
          component: "logs/scheduler",
          actions: ["clear", "remove", "export"]
        }
      }
    ]
  },
  {
    id: 12,
    name: "regions",
    meta: {
      path: "regions",
      component: "regions",
      actions: ["create", "modify", "remove", "import", "export", "enable"]
    }
  },
  {
    id: 14,
    name: "files",
    meta: {
      path: "files",
      component: "files",
      actions: ["download", "upload", "remove"]
    }
  },
  {
    id: 16,
    name: "exploiters",
    meta: {
      path: "exploiters",
      component: "#",
      redirect: "schemes"
    },
    children: [
      {
        id: 17,
        name: "connections",
        meta: {
          path: "connections",
          component: "exploiters/connections",
          actions: ["create", "modify", "remove", "import", "export", "enable"]
        }
      },
      {
        id: 18,
        name: "schemes",
        meta: {
          path: "schemes",
          component: "exploiters/schemes",
          actions: [
            "create",
            "modify",
            "remove",
            "import",
            "export",
            "sync",
            "config",
            "execute",
            "enable"
          ]
        }
      },
      {
        id: 19,
        name: "scripts",
        meta: {
          path: "scripts",
          component: "exploiters/scripts",
          actions: ["create", "modify", "remove", "import", "export", "enable"]
        }
      },
      {
        id: 20,
        name: "codes",
        meta: {
          path: "codes",
          component: "#",
          redirect: "schemes"
        },
        children: [
          {
            id: 21,
            name: "modules",
            meta: {
              path: "modules",
              component: "exploiters/codes/modules",
              actions: [
                "create",
                "modify",
                "remove",
                "import",
                "export",
                "enable"
              ]
            }
          },
          {
            id: 22,
            name: "samples",
            meta: {
              path: "samples",
              component: "exploiters/codes/samples",
              actions: [
                "create",
                "modify",
                "remove",
                "import",
                "export",
                "enable"
              ]
            }
          },
          {
            id: 23,
            name: "fragments",
            meta: {
              path: "fragments",
              component: "exploiters/codes/fragments",
              actions: [
                "create",
                "modify",
                "remove",
                "import",
                "export",
                "enable"
              ]
            }
          }
        ]
      }
    ]
  }
];

const groups: GroupPrivileges[] = [];

for (let i = 1; i < 28; i++) {
  const row: GroupPrivileges = {
    id: i,
    privilegeId: i < 15 ? i : i - 14,
    groupId: i,
    actions: ["create", "modify", "remove", "import", "export"]
  };
  groups.push(row);
}

const users: UserPrivileges[] = [];

for (let i = 1; i < 28; i++) {
  const row: UserPrivileges = {
    id: i,
    privilegeId: i < 15 ? i : i - 14,
    username: "username" + i,
    actions: ["create", "modify", "remove", "import", "export"]
  };
  users.push(row);
}

export const privilegesHandlers = [
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/groups`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(
        groups.filter(item => item.privilegeId === Number(id))
      );
    } else {
      return HttpResponse.json([]);
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/users`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(
        users.filter(item => item.privilegeId === Number(id))
      );
    } else {
      return HttpResponse.json([]);
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/tree`, () => {
    return HttpResponse.json(treeNodes);
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      let res = datas.find(item => item.id === Number(id));
      if (!res) {
        res = subDatas.find(item => item.id === Number(id));
      }
      return HttpResponse.json(res);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/subset`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json(
      subDatas.filter(item => item.superiorId === Number(id))
    );
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      let res = datas.find(item => item.id === Number(id));
      if (!res) {
        res = subDatas.find(item => item.id === Number(id));
      }
      return HttpResponse.json(res);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const size = url.searchParams.get("size");

    const filtersStr = url.searchParams.get("filters");
    const filtered = applyFilters(datas, filtersStr);

    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: filtered.slice(
        Number(page) * Number(size),
        (Number(page) + 1) * Number(size)
      ),
      totalElements: filtered.length
    };

    return HttpResponse.json(data);
  }),
  http.post(`/api${SERVER_URL.PRIVILEGE}/import`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return new HttpResponse("Missing document", { status: 400 });
    }

    if (!(file instanceof File)) {
      return new HttpResponse("Uploaded document is not a File", {
        status: 400
      });
    }
    return HttpResponse.json();
  }),
  http.put(`/api${SERVER_URL.PRIVILEGE}/:id`, async ({ params, request }) => {
    const { id } = params;
    // Read the intercepted request body as JSON.
    const newData = (await request.json()) as Privilege;

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 });
    } else {
      return HttpResponse.error();
    }
  }),
  http.patch(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json();
    } else {
      return HttpResponse.error();
    }
  }),
  http.delete(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params;

    // Let's attempt to grab the Row by its ID.
    const deletedData = treeNodes.filter(item => item.id === Number(id));

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 });
    }

    // Delete the Row from the "allRow" map.
    treeNodes.pop();

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json(deletedData);
  })
];

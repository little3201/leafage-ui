import { http, HttpResponse } from 'msw'
import { actionTypes, SERVER_URL } from '@/constants'
import type { GroupPrivileges, Privilege, PrivilegeAction, PrivilegeTreeNode, RolePrivileges, UserPrivileges } from '@/types'
import { applyFilters } from '../util'

const datas: Privilege[] = [
  {
    id: 1,
    superiorId: null,
    path: 'system',
    component: '#',
    redirect: 'users',
    name: 'system',
    count: 5,
    enabled: true,
  },
  {
    id: 7,
    superiorId: null,
    path: 'logs',
    component: '#',
    redirect: 'operation',
    name: 'logs',
    count: 3,
    enabled: true,
  },
  {
    id: 12,
    superiorId: null,
    path: 'regions',
    component: 'regions',
    name: 'regions',
    actions: ['create', 'modify', 'remove', 'import', 'export'],
    count: 0,
    enabled: true,
  },
  {
    id: 13,
    superiorId: null,
    path: 'files',
    component: 'files',
    name: 'files',
    actions: ['upload', 'download', 'remove'],
    count: 0,
    enabled: true,
  },
  {
    id: 14,
    superiorId: null,
    path: 'exploiters',
    component: '#',
    name: 'exploiters',
    redirect: 'schemes',
    count: 1,
    enabled: true,
  },
  {
    id: 22,
    superiorId: null,
    name: 'docs',
    path: 'docs',
    component: '#',
    redirect: '/docs/reports',
    count: 1,
    enabled: true,
  }
]

const subDatas: Privilege[] = [
  {
    id: 2,
    superiorId: 1,
    path: 'groups',
    component: 'system/groups',
    name: 'groups',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable'],
    count: 0,
    enabled: true,
  },
  {
    id: 3,
    superiorId: 1,
    path: 'users',
    component: 'system/users',
    name: 'users',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable', 'unlock'],
    count: 0,
    enabled: true,
  },
  {
    id: 4,
    superiorId: 1,
    path: 'privileges',
    component: 'system/privileges',
    name: 'privileges',
    actions: ['modify', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
  },
  {
    id: 5,
    superiorId: 1,
    path: 'roles',
    component: 'system/roles',
    name: 'roles',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable'],
    count: 0,
    enabled: true,
  },
  {
    id: 6,
    superiorId: 1,
    path: 'dictionaries',
    component: 'system/dictionaries',
    name: 'dictionaries',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
  },
  {
    id: 8,
    superiorId: 7,
    path: 'operation',
    component: 'logs/operation',
    name: 'operationLogs',
    actions: ['clear', 'export', 'remove'],
    count: 0,
    enabled: true,
  },
  {
    id: 9,
    superiorId: 7,
    path: 'access',
    component: 'logs/access',
    name: 'accessLogs',
    actions: ['clear', 'export', 'remove'],
    count: 0,
    enabled: true,
  },
  {
    id: 10,
    superiorId: 7,
    path: 'audit',
    component: 'logs/audit',
    name: 'auditLogs',
    actions: ['remove', 'export'],
    count: 0,
    enabled: true,
  },
  {
    id: 11,
    superiorId: 7,
    path: 'scheduler',
    component: 'logs/scheduler',
    name: 'schedulerLogs',
    actions: ['clear', 'export', 'remove'],
    count: 0,
    enabled: true,
  },
  {
    id: 15,
    superiorId: 14,
    path: 'schemes',
    name: 'schemes',
    component: 'exploiters/schemes',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'sync', 'config', 'execute', 'enable'],
    count: 0,
    enabled: true,
  },
  {
    id: 16,
    superiorId: 14,
    path: 'scripts',
    name: 'scripts',
    component: 'exploiters/scripts',
    actions: ['create', 'modify', 'remove', 'import', 'export'],
    count: 0,
    enabled: true,
  },
  {
    id: 17,
    superiorId: 14,
    path: 'codes',
    name: 'codes',
    component: 'exploiters/codes',
    count: 3,
    enabled: true,
  },
  {
    id: 18,
    superiorId: 14,
    path: 'connections',
    name: 'connections',
    component: 'exploiters/connections',
    actions: ['create', 'modify', 'remove', 'import', 'export'],
    count: 0,
    enabled: true,
  },
  {
    id: 19,
    superiorId: 17,
    path: 'modules',
    name: 'modules',
    component: 'exploiters/codes/modules',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'config', 'enable'],
    count: 0,
    enabled: true,
  },
  {
    id: 20,
    superiorId: 17,
    path: 'samples',
    name: 'samples',
    component: 'exploiters/codes/samples',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'config', 'enable'],
    count: 0,
    enabled: true,
  },
  {
    id: 21,
    superiorId: 17,
    path: 'fragments',
    name: 'fragments',
    component: 'exploiters/codes/fragments',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'config', 'enable'],
    count: 0,
    enabled: true
  },
  {
    id: 23,
    superiorId: 22,
    name: 'archives',
    path: 'archives',
    component: 'docs/archives',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'section'],
    count: 0,
    enabled: true,
  },
  {
    id: 24,
    name: 'templates',
    superiorId: 22,
    path: 'templates',
    component: 'docs/templates',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'section'],
    count: 0,
    enabled: true,
  },
  {
    id: 25,
    superiorId: 22,
    name: 'reports',
    path: 'reports',
    component: 'docs/reports',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'field', 'data'],
    count: 0,
    enabled: true,
  }
]

const treeNodes: PrivilegeTreeNode[] = [
  {
    id: 1,
    name: 'system',
    meta: {
      path: 'system',
      component: '#',
      redirect: 'users',
    },
    children: [
      {
        id: 2,
        name: 'groups',
        meta: {
          path: 'groups',
          component: 'system/groups',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable']
        }
      },
      {
        id: 3,
        name: 'users',
        meta: {
          path: 'users',
          component: 'system/users',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable', 'unlock']
        }
      },
      {
        id: 4,
        name: 'roles',
        meta: {
          path: 'roles',
          component: 'system/roles',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable']
        }
      },
      {
        id: 5,
        name: 'dictionaries',
        meta: {
          path: 'dictionaries',
          component: 'system/dictionaries',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 6,
        name: 'privileges',
        meta: {
          path: 'privileges',
          component: 'system/privileges',
          actions: ['modify', 'import', 'export', 'enable']
        }
      }
    ]
  },
  {
    id: 7,
    name: 'logs',
    meta: {
      path: 'logs',
      component: '#',
      redirect: 'operation'
    },
    children: [
      {
        id: 8,
        name: 'operationLogs',
        meta: {
          path: 'operation',
          component: 'logs/operation',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 9,
        name: 'accessLogs',
        meta: {
          path: 'access',
          component: 'logs/access',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 10,
        name: 'auditLogs',
        meta: {
          path: 'audit',
          component: 'logs/audit',
          actions: ['remove', 'export']
        }
      },
      {
        id: 11,
        name: 'schedulerLogs',
        meta: {
          path: 'scheduler',
          component: 'logs/scheduler',
          actions: ['clear', 'remove', 'export']
        }
      }
    ]
  },
  {
    id: 12,
    name: 'regions',
    meta: {
      path: 'regions',
      component: 'regions',
      actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
    }
  },
  {
    id: 13,
    name: 'files',
    meta: {
      path: 'files',
      component: 'files',
      actions: ['download', 'upload', 'remove']
    }
  },
  {
    id: 14,
    name: 'exploiters',
    meta: {
      path: 'exploiters',
      component: '#',
      redirect: '/exploiters/schemes'
    },
    children: [
      {
        id: 15,
        name: 'schemes',
        meta: {
          path: 'schemes',
          component: 'exploiters/schemes',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'config', 'execute', 'enable']
        }
      },
      {
        id: 16,
        name: 'scripts',
        meta: {
          path: 'scripts',
          component: 'exploiters/scripts',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 18,
        name: 'connections',
        meta: {
          path: 'connections',
          component: 'exploiters/connections',
          actions: ['create', 'modify', 'remove', 'sync']
        }
      },
      {
        id: 17,
        name: 'codes',
        meta: {
          path: 'codes',
          component: '#',
          redirect: '/exploiters/codes/samples',
        },
        children: [
          {
            id: 19,
            name: 'modules',
            meta: {
              path: 'modules',
              component: 'exploiters/codes/modules',
              actions: ['create', 'modify', 'remove', 'import', 'export', 'config', 'enable']
            }
          },
          {
            id: 20,
            name: 'samples',
            meta: {
              path: 'samples',
              component: 'exploiters/codes/samples',
              actions: ['create', 'modify', 'remove', 'import', 'export', 'config', 'enable']
            }
          },
          {
            id: 21,
            name: 'fragments',
            meta: {
              path: 'fragments',
              component: 'exploiters/codes/fragments',
              actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
            }
          },
        ]
      }
    ]
  },
  {
    id: 22,
    name: 'docs',
    meta: {
      path: 'docs',
      component: '#',
      redirect: '/docs/reports'
    },
    children: [
      {
        id: 23,
        name: 'archives',
        meta: {
          path: 'archives',
          component: 'docs/archives',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'section']
        },
        children: []
      },
      {
        id: 24,
        name: 'templates',
        meta: {
          path: 'templates',
          component: 'docs/templates',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'section']
        },
        children: []
      },
      {
        id: 25,
        name: 'reports',
        meta: {
          path: 'reports',
          component: 'docs/reports',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'field', 'data']
        },
        children: []
      }
    ]
  }
]

const privilegeActions: PrivilegeAction[] = [
]


export const actions: string[] = [
  'create',
  'modify',
  'remove',
  'clear',
  'import',
  'export',
  'upload',
  'download',
  'unlock',
  'relation',
  'authorize',
  'config',
  'execute'
]


const roles: RolePrivileges[] = []

for (let i = 1; i < 28; i++) {
  const row: RolePrivileges = {
    id: i,
    privilegeId: i < 15 ? i : i - 14,
    roleId: i,
    actions: ['create', 'modify', 'remove', 'import', 'export']
  }
  roles.push(row)
}


const groups: GroupPrivileges[] = []

for (let i = 1; i < 28; i++) {
  const row: GroupPrivileges = {
    id: i,
    privilegeId: i < 15 ? i : i - 14,
    groupId: i,
    actions: ['create', 'modify', 'remove', 'import', 'export']
  }
  groups.push(row)
}

for (let i = 1; i < 25; i++) {
  const count = Math.floor(Math.random() * actions.length) + 1
  for (let j = 1; j <= count; j++) {
    const row: PrivilegeAction = {
      id: j + 1,
      privilegeId: i,
      name: actions[j - 1],
      type: actionTypes[actions[j - 1]] || null,
      enabled: true
    }
    privilegeActions.push(row)
  }
}


const users: UserPrivileges[] = []

for (let i = 1; i < 28; i++) {
  const row: UserPrivileges = {
    id: i,
    privilegeId: i < 15 ? i : i - 14,
    username: 'username' + i,
    actions: ['create', 'modify', 'remove', 'import', 'export']
  }
  users.push(row)
}

export const privilegesHandlers = [
  http.get(`/api${SERVER_URL.PRIVILEGE}/tree`, () => {
    return HttpResponse.json(treeNodes)
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/actions`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(privilegeActions.filter(item => item.privilegeId === Number(id)))
    }
    return HttpResponse.json()
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/actions/:actionId`, ({ params }) => {
    const { id, actionId } = params
    if (id && actionId) {
      return HttpResponse.json(privilegeActions.filter(item => item.privilegeId === Number(id) && item.id === Number(actionId))[0])
    }
    return HttpResponse.json()
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      let res = datas.find(item => item.id === Number(id))
      if (!res) {
        res = subDatas.find(item => item.id === Number(id))
      }
      return HttpResponse.json(res)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/subset`, ({ params }) => {
    const { id } = params
    return HttpResponse.json(subDatas.filter(item => item.superiorId === Number(id)))
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      let res = datas.find(item => item.id === Number(id))
      if (!res) {
        res = subDatas.find(item => item.id === Number(id))
      }
      return HttpResponse.json(res)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const size = url.searchParams.get('size')

    const filtersStr = url.searchParams.get('filters')
    const filtered = applyFilters(datas, filtersStr)

    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      page: {
        totalElements: filtered.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.PRIVILEGE}/import`, async ({ request }) => {
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return new HttpResponse('Missing document', { status: 400 })
    }

    if (!(file instanceof File)) {
      return new HttpResponse('Uploaded document is not a File', {
        status: 400,
      })
    }
    return HttpResponse.json()
  }),
  http.put(`/api${SERVER_URL.PRIVILEGE}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Privilege

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params

    // Let's attempt to grab the Row by its ID.
    const deletedData = treeNodes.filter(item => item.id === Number(id))

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 })
    }

    // Delete the Row from the "allRow" map.
    treeNodes.pop()

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json()
  })
]

import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { GroupPrivileges, Privilege, PrivilegeTreeNode, UserPrivileges } from 'src/types'

const datas: Privilege[] = [
  {
    id: 1,
    path: 'system',
    superiorId: null,
    component: '#',
    redirect: 'users',
    name: 'system',
    icon: 'settings',
    count: 5,
    enabled: true,
    description: 'this is description for this row'
  },
  {
    id: 7,
    path: 'logs',
    superiorId: null,
    component: '#',
    redirect: 'operation',
    name: 'logs',
    icon: 'lab_profile',
    count: 3,
    enabled: true,
    description: 'this is description for this row'
  },
  {
    id: 12,
    path: 'regions',
    superiorId: null,
    component: 'regions',
    name: 'regions',
    icon: 'location_on',
    actions: ['create', 'modify', 'remove', 'import', 'export'],
    count: 0,
    enabled: false,
    description: 'this is description for this row'
  },
  {
    id: 14,
    path: 'files',
    superiorId: null,
    component: 'files',
    name: 'files',
    icon: 'folder_open',
    actions: ['upload', 'download', 'remove'],
    count: 0,
    enabled: true,
    description: 'this is description for this row'
  },
  {
    id: 16,
    path: 'exploiters',
    superiorId: null,
    component: '#',
    name: 'exploiters',
    redirect: 'schemes',
    icon: 'build',
    count: 1,
    enabled: true,
    description: 'this is description for this row'
  }
]

const subDatas: Privilege[] = [
  {
    id: 2,
    superiorId: 1,
    path: 'groups',
    component: 'system/groups',
    name: 'groups',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'enable'],
    count: 0,
    enabled: true,
    icon: 'account_tree',
    description: 'this is description for this row'
  },
  {
    id: 3,
    superiorId: 1,
    path: 'users',
    component: 'system/users',
    name: 'users',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
    icon: 'person',
    description: 'this is description for this row'
  },
  {
    id: 4,
    superiorId: 1,
    path: 'privileges',
    component: 'system/privileges',
    name: 'privileges',
    actions: ['modify', 'authorize', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
    icon: 'admin_panel_settings',
    description: 'this is description for this row'
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
    icon: 'book_3',
    description: 'this is description for this row'
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
    icon: 'clinical_notes',
    description: 'this is description for this row'
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
    icon: 'sticky_note_2',
    description: 'this is description for this row'
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
    icon: 'note_alt',
    description: 'this is description for this row'
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
    icon: 'event_note',
    description: 'this is description for this row'
  },
  {
    id: 17,
    superiorId: 16,
    path: 'connections',
    name: 'connections',
    component: 'exploiters/connections',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
    icon: 'database_search',
    description: 'this is description for this row'
  },
  {
    id: 18,
    superiorId: 16,
    path: 'samples',
    name: 'samples',
    component: 'exploiters/samples',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
    icon: 'code',
    description: 'this is description for this row'
  },
  {
    id: 19,
    superiorId: 16,
    path: 'scripts',
    name: 'scripts',
    component: 'exploiters/scripts',
    actions: ['create', 'modify', 'remove', 'import', 'export'],
    count: 0,
    enabled: true,
    icon: 'terminal',
    description: 'this is description for this row'
  },
  {
    id: 20,
    superiorId: 16,
    path: 'templates',
    name: 'templates',
    component: '#',
    count: 1,
    enabled: true,
    icon: 'folder_code',
    description: 'this is description for this row'
  },
  {
    id: 21,
    superiorId: 20,
    path: 'modules',
    name: 'modules',
    component: 'exploiters/templates/modules',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
    icon: 'modeling',
    description: 'this is description for this row'
  },
  {
    id: 21,
    superiorId: 20,
    path: 'samples',
    name: 'samples',
    component: 'exploiters/samples',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
    icon: 'code_blocks',
    description: 'this is description for this row'
  },
  {
    id: 21,
    superiorId: 20,
    path: 'fragments',
    name: 'fragments',
    component: 'exploiters/templates/fragments',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'enable'],
    count: 0,
    enabled: true,
    icon: 'code',
    description: 'this is description for this row'
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
      icon: 'settings'
    },
    children: [
      {
        id: 2,
        name: 'groups',
        meta: {
          path: 'groups',
          component: 'system/groups',
          icon: 'account_tree',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'enable']
        }
      },
      {
        id: 3,
        name: 'users',
        meta: {
          path: 'users',
          component: 'system/users',
          icon: 'person',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 4,
        name: 'privileges',
        meta: {
          path: 'privileges',
          component: 'system/privileges',
          icon: 'admin_panel_settings',
          actions: ['modify', 'authorize', 'import', 'export', 'enable']
        }
      },
      {
        id: 6,
        name: 'dictionaries',
        meta: {
          path: 'dictionaries',
          component: 'system/dictionaries',
          icon: 'book_3',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
    ]
  },
  {
    id: 7,
    name: 'logs',
    meta: {
      path: 'logs',
      component: '#',
      redirect: 'operation',
      icon: 'lab_profile',
      actions: ['clear', 'remove', 'export']
    },
    children: [
      {
        id: 8,
        name: 'operationLogs',
        meta: {
          path: 'operation',
          component: 'logs/operation',
          icon: 'clinical_notes',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 9,
        name: 'accessLogs',
        meta: {
          path: 'access',
          component: 'logs/access',
          icon: 'sticky_note_2',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 10,
        name: 'auditLogs',
        meta: {
          path: 'audit',
          component: 'logs/audit',
          icon: 'note_alt',
          actions: ['remove', 'export']
        }
      },
      {
        id: 11,
        name: 'schedulerLogs',
        meta: {
          path: 'scheduler',
          component: 'logs/scheduler',
          icon: 'event_note',
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
      icon: 'location_on',
      actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
    }
  },
  {
    id: 14,
    name: 'files',
    meta: {
      path: 'files',
      component: 'files',
      icon: 'folder_open',
      actions: ['download', 'upload', 'remove']
    }
  },
  {
    id: 16,
    name: 'exploiters',
    meta: {
      path: 'exploiters',
      component: '#',
      redirect: 'schemes',
      icon: 'build'
    },
    children: [
      {
        id: 17,
        name: 'connections',
        meta: {
          path: 'connections',
          component: 'exploiters/connections',
          icon: 'database_search',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 18,
        name: 'schemes',
        meta: {
          path: 'schemes',
          component: 'exploiters/schemes',
          icon: 'genetics',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'sync', 'config', 'execute', 'enable']
        }
      },
      {
        id: 19,
        name: 'scripts',
        meta: {
          path: 'scripts',
          component: 'exploiters/scripts',
          icon: 'terminal',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 20,
        name: 'templates',
        meta: {
          path: 'templates',
          component: '#',
          redirect: 'schemes',
          icon: 'folder_code',
        },
        children: [
          {
            id: 21,
            name: 'modules',
            meta: {
              path: 'modules',
              component: 'exploiters/templates/modules',
              icon: 'modeling',
              actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
            }
          },
          {
            id: 22,
            name: 'samples',
            meta: {
              path: 'samples',
              component: 'exploiters/templates/samples',
              icon: 'code_blocks',
              actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
            }
          },
          {
            id: 23,
            name: 'fragments',
            meta: {
              path: 'fragments',
              component: 'exploiters/templates/fragments',
              icon: 'code',
              actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
            }
          }
        ]
      }
    ]
  }
]


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
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/groups`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(groups.filter(item => item.privilegeId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/users`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(users.filter(item => item.privilegeId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/tree`, () => {
    return HttpResponse.json(treeNodes)
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
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      totalElements: datas.length
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.PRIVILEGE}/import`, async ({ request }) => {
    // Read the intercepted request body as JSON.
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
    return HttpResponse.json(deletedData)
  })
]

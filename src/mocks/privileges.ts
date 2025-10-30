import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Privilege, PrivilegeTreeNode, RolePrivileges, GroupPrivileges, UserPrivileges } from 'src/types'

const datas: Privilege[] = [
  {
    id: 1,
    path: 'system',
    component: '#',
    redirect: 'users',
    name: 'system',
    icon: 'settings-outline',
    count: 5,
    enabled: true,
    description: 'this is description for this row'
  },
  {
    id: 7,
    path: 'logs',
    component: '#',
    redirect: 'operation',
    name: 'logs',
    icon: 'lab-profile-outline',
    count: 3,
    enabled: true,
    description: 'this is description for this row'
  },
  {
    id: 12,
    path: 'regions',
    component: 'regions',
    name: 'regions',
    icon: 'location-on-outline',
    actions: ['create', 'modify', 'remove', 'import', 'export'],
    count: 0,
    enabled: false,
    description: 'this is description for this row'
  },
  {
    id: 13,
    path: 'files',
    component: 'files',
    name: 'files',
    icon: 'folder-open-outline',
    actions: ['upload', 'download', 'remove'],
    count: 0,
    enabled: true,
    description: 'this is description for this row'
  },
  {
    id: 14,
    path: 'exploiters',
    component: '#',
    name: 'exploiters',
    redirect: 'schemas',
    icon: 'build-outline',
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
    actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable'],
    count: 0,
    enabled: true,
    icon: 'account-tree-outline',
    description: 'this is description for this row'
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
    icon: 'person-outline',
    description: 'this is description for this row'
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
    icon: 'admin-panel-settings-outline',
    description: 'this is description for this row'
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
    icon: 'shield-person-outline',
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
    icon: 'book-3-outline',
    description: 'this is description for this row'
  },
  {
    id: 8,
    superiorId: 7,
    path: 'operation',
    component: 'logs/operation',
    name: 'operation_logs',
    actions: ['clear', 'export', 'remove'],
    count: 0,
    enabled: true,
    icon: 'clinical-notes-outline',
    description: 'this is description for this row'
  },
  {
    id: 9,
    superiorId: 7,
    path: 'access',
    component: 'logs/access',
    name: 'access_logs',
    actions: ['clear', 'export', 'remove'],
    count: 0,
    enabled: true,
    icon: 'sticky-note-2-outline',
    description: 'this is description for this row'
  },
  {
    id: 10,
    superiorId: 7,
    path: 'audit',
    component: 'logs/audit',
    name: 'audit_logs',
    actions: ['remove', 'export'],
    count: 0,
    enabled: true,
    icon: 'note-alt-outline',
    description: 'this is description for this row'
  },
  {
    id: 11,
    superiorId: 7,
    path: 'scheduler',
    component: 'logs/scheduler',
    name: 'scheduler_logs',
    actions: ['clear', 'export', 'remove'],
    count: 0,
    enabled: true,
    icon: 'event-note-outline',
    description: 'this is description for this row'
  },
  {
    id: 15,
    superiorId: 14,
    path: 'schemas',
    name: 'schemas',
    component: 'exploiters/schemas',
    actions: ['create', 'modify', 'remove', 'import', 'export', 'sync', 'config', 'execute', 'enable'],
    count: 0,
    enabled: true,
    icon: 'genetics',
    description: 'this is description for this row'
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
    icon: 'terminal',
    description: 'this is description for this row'
  },
  {
    id: 17,
    superiorId: 14,
    path: 'samples',
    name: 'samples',
    component: 'exploiters/samples',
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
      icon: 'settings-outline'
    },
    children: [
      {
        id: 2,
        name: 'groups',
        meta: {
          path: 'groups',
          component: 'system/groups',
          icon: 'account-tree-outline',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable']
        }
      },
      {
        id: 3,
        name: 'users',
        meta: {
          path: 'users',
          component: 'system/users',
          icon: 'person-outline',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable', 'unlock']
        }
      },
      {
        id: 4,
        name: 'roles',
        meta: {
          path: 'roles',
          component: 'system/roles',
          icon: 'shield-person-outline',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable']
        }
      },
      {
        id: 5,
        name: 'dictionaries',
        meta: {
          path: 'dictionaries',
          component: 'system/dictionaries',
          icon: 'book-3-outline',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 6,
        name: 'privileges',
        meta: {
          path: 'privileges',
          component: 'system/privileges',
          icon: 'admin-panel-settings-outline',
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
      redirect: 'operation',
      icon: 'lab-profile-outline'
    },
    children: [
      {
        id: 8,
        name: 'operation_logs',
        meta: {
          path: 'operation',
          component: 'logs/operation',
          icon: 'clinical-notes-outline',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 9,
        name: 'access_logs',
        meta: {
          path: 'access',
          component: 'logs/access',
          icon: 'sticky-note-2-outline',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 10,
        name: 'audit_logs',
        meta: {
          path: 'audit',
          component: 'logs/audit',
          icon: 'note-alt-outline',
          actions: ['remove', 'export']
        }
      },
      {
        id: 11,
        name: 'scheduler_logs',
        meta: {
          path: 'scheduler',
          component: 'logs/scheduler',
          icon: 'event-note-outline',
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
      icon: 'location-on-outline',
      actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
    }
  },
  {
    id: 13,
    name: 'files',
    meta: {
      path: 'files',
      component: 'files',
      icon: 'folder-open-outline',
      actions: ['download', 'upload', 'remove']
    }
  },
  {
    id: 14,
    name: 'exploiters',
    meta: {
      path: 'exploiters',
      component: '#',
      redirect: 'schemas',
      icon: 'build-outline'
    },
    children: [
      {
        id: 15,
        name: 'schemas',
        meta: {
          path: 'schemas',
          component: 'exploiters/schemas',
          icon: 'genetics',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'sync', 'config', 'execute', 'enable']
        }
      },
      {
        id: 16,
        name: 'scripts',
        meta: {
          path: 'scripts',
          component: 'exploiters/scripts',
          icon: 'terminal',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 17,
        name: 'samples',
        meta: {
          path: 'samples',
          component: 'exploiters/samples',
          icon: 'code',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      }
    ]
  }
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
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      let res = datas.filter(item => item.id === Number(id))[0]
      if (!res) {
        res = subDatas.filter(item => item.id === Number(id))[0]
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
      let res = datas.filter(item => item.id === Number(id))[0]
      if (!res) {
        res = subDatas.filter(item => item.id === Number(id))[0]
      }
      return HttpResponse.json(res)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: Array.from(datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: datas.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.PRIVILEGE}/import`, async ({ request }) => {
    // Read the intercepted request body as FormData.
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
  http.patch(`/api${SERVER_URL.PRIVILEGE}/:id`, async ({ params }) => {
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

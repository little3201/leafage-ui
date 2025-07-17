import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Group, TreeNode, GroupMembers, GroupRoles, GroupPrivileges } from 'src/types'

const datas: Group[] = []

for (let i = 1; i < 28; i++) {
  const row: Group = {
    id: i,
    superiorId: 3,
    name: 'group_' + i,
    enabled: true,
    description: 'This is region description about xxx'
  }
  datas.push(row)
}

const treeNodes: TreeNode[] = [
  {
    id: 1,
    name: 'group_1',
    children: [
      {
        id: 2,
        name: 'group_2',
        children: [
        ]
      },
      {
        id: 3,
        name: 'group_3',
        children: [
          {
            id: 4,
            name: 'group_4',
            children: [
            ]
          }
        ]
      }
    ]
  }
]

const members: GroupMembers[] = []

for (let i = 1; i < 14; i++) {
  const row: GroupMembers = {
    id: i,
    username: 'username' + i,
    groupId: i
  }
  members.push(row)
}


const roles: GroupRoles[] = []

for (let i = 1; i < 14; i++) {
  const row: GroupRoles = {
    id: i,
    roleId: i,
    groupId: i
  }
  roles.push(row)
}

const privileges: GroupPrivileges[] = []

for (let i = 1; i < 17; i++) {
  const row: GroupPrivileges = {
    id: i,
    groupId: i,
    privilegeId: i,
    actions: ['create', 'modify', 'remove', 'import', 'export']
  }
  privileges.push(row)
}

export const groupsHandlers = [
  http.get(`/api${SERVER_URL.GROUP}/tree`, () => {
    return HttpResponse.json(treeNodes)
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(members.filter(item => item.groupId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id/roles`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(roles.filter(item => item.groupId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id/privileges`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(privileges.filter(item => item.groupId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const array = datas.filter(item => item.id === Number(id))
      return HttpResponse.json(array[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id/exists`, ({ params }) => {
    const { id, name } = params
    let filtered = datas.filter(item => item.name === name)
    if (id) {
      filtered = datas.filter(item => item.name === name && item.id !== Number(id))
    }
    return HttpResponse.json(filtered.length > 0)
  }),
  http.get(`/api${SERVER_URL.GROUP}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    const superiorId = searchParams.get('superiorId')

    let data = {
      content: Array.from(datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: datas.length
      }
    }

    if (superiorId) {
      const filtered = datas.filter(item => item.superiorId === Number(superiorId))
      data = {
        content: Array.from(filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
        page: {
          totalElements: filtered.length
        }
      }
    }
    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.GROUP}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.GROUP}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Group

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.GROUP}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Group

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id`, async ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id/members`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()
    if (id && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id/roles`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()
    if (id && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id/privileges/:privilegeId`, async ({ params }) => {
    const { id, privilegeId } = params
    if (id && privilegeId) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.GROUP}/:groupId/privileges/:privilegeId`, async ({ params }) => {
    const { groupId, privilegeId } = params
    if (groupId && privilegeId) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.GROUP}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.GROUP}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params

    // Let's attempt to grab the Row by its ID.
    const deletedData = datas.filter(item => item.id === Number(id))

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 })
    }

    // Delete the Row from the "allRow" map.
    datas.pop()

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json(deletedData)
  })
]

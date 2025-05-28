import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Role, RolePrivileges, RoleMembers } from 'src/types'

const datas: Role[] = []

for (let i = 1; i < 28; i++) {
  const data: Role = {
    id: i,
    name: 'role_' + i,
    enabled: i % 3 > 0,
    description: 'this is description for this row'
  }
  datas.push(data)
}

const privileges: RolePrivileges[] = []

for (let i = 1; i < 17; i++) {
  const row: RolePrivileges = {
    id: i,
    privilegeId: i,
    roleId: i,
    actions: ['create', 'modify', 'remove', 'import', 'export']
  }
  privileges.push(row)
}

const members: RoleMembers[] = []

for (let i = 1; i < 28; i++) {
  const row: RoleMembers = {
    id: i,
    username: 'username' + i,
    roleId: i
  }
  members.push(row)
}

export const rolesHandlers = [
  http.get(`/api${SERVER_URL.ROLE}/:id/privileges`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(privileges.filter(item => item.roleId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.ROLE}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(members.filter(item => item.roleId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.ROLE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.ROLE}/:id/exists`, ({ params }) => {
    const { id, name } = params
    let filtered = datas.filter(item => item.name === name)
    if (id) {
      filtered = datas.filter(item => item.name === name && item.id !== Number(id))
    }
    return HttpResponse.json(filtered.length > 0)
  }),
  http.get(`/api${SERVER_URL.ROLE}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    if (page && size) {
      // Construct a JSON response with the list of all Row
      // as the response body.
      const data = {
        content: Array.from(datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
        page: {
          totalElements: datas.length
        }
      }
      return HttpResponse.json(data)
    } else {
      return HttpResponse.json(datas)
    }
  }),
  http.post(`/api${SERVER_URL.ROLE}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.ROLE}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Role

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.ROLE}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Role

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.ROLE}/:id`, async ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.ROLE}/:id/members`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()
    if (id && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.ROLE}/:id/privileges`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()
    if (id && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.ROLE}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.ROLE}/privileges/:privilegeId`, async ({ params, request }) => {
    const data = await request.json()
    const { privilegeId } = params
    if (privilegeId && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.ROLE}/:roleId/privileges/:privilegeId`, async ({ params }) => {
    const { roleId, privilegeId } = params
    if (roleId && privilegeId) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.ROLE}/:id`, ({ params }) => {
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

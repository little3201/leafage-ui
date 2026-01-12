import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Group, GroupMembers } from 'src/types'

const datas: Group[] = []

for (let i = 1; i < 28; i++) {
  const row: Group = {
    id: i,
    name: 'group_' + i,
    enabled: true,
    description: 'This is region description about xxx'
  }
  datas.push(row)
}

const members: GroupMembers[] = []

for (let i = 1; i < 14; i++) {
  const row: GroupMembers = {
    id: i,
    username: 'username' + i,
    groupId: i
  }
  members.push(row)
}

export const groupsHandlers = [
  http.get(`/api${SERVER_URL.GROUP}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = members.filter(item => item.groupId === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.filter(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const size = url.searchParams.get('size')

    const data = {
      content: datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      totalElements: datas.length
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
  http.patch(`/api${SERVER_URL.GROUP}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/privileges/:privilegeId`, async ({ params, request }) => {
    const data = await request.json()
    const { privilegeId } = params
    if (privilegeId && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.GROUP}/:groupId/privileges/:privilegeId`, ({ params }) => {
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

import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Connection } from 'src/types'


const databases: Connection[] = [
]

for (let i = 1; i < 8; i++) {
  const row: Connection = {
    id: i,
    name: 'db_name' + i,
    host: '127.0.0.1',
    port: 3306,
    username: 'admin',
    enabled: i > 3,
    tables: ['table_1', 'table_2', 'table_3', 'table_4', 'table_5']
  }
  databases.push(row)
}

const datas: string[] = [
]

for (let i = 1; i < 8; i++) {
  const row: string = 'table_name' + i
  datas.push(row)
}

export const connectionsHandlers = [
  http.get(`/api${SERVER_URL.CONNECTION}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: Array.from(databases.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: databases.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.get(`/api${SERVER_URL.CONNECTION}/:id/tables`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas)
    }
    return Response.error()
  }),
  http.get(`/api${SERVER_URL.CONNECTION}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const array = databases.filter(item => item.id === Number(id))
      return HttpResponse.json(array[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.post(`/api${SERVER_URL.CONNECTION}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Connection

    // Push the new Row to the map of all Row.
    databases.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.CONNECTION}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Connection

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),

  http.delete(`/api${SERVER_URL.CONNECTION}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params

    // Let's attempt to grab the Row by its ID.
    const deletedData = databases.filter(item => item.id === Number(id))

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
import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { OperationLog } from 'src/types'

const datas: OperationLog[] = []

for (let i = 1; i < 28; i++) {
  const row: OperationLog = {
    id: i,
    module: 'users',
    action: 'create',
    ip: '192.168.0.1',
    params: '',
    body: '{"username":"test"}',
    sessionId: 'sjfa2323jkljsladf',
    statusCode: i % 2 === 0 ? 200 : 500,
  }
  datas.push(row)
}


export const operationLogsHandlers = [
  http.get(`/api${SERVER_URL.OPERATION_LOG}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.OPERATION_LOG}`, ({ request }) => {
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
  http.delete(`/api${SERVER_URL.OPERATION_LOG}/:id`, ({ params }) => {
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

import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { AccessLog } from 'src/types'


const datas: AccessLog[] = []

for (let i = 1; i < 28; i++) {
  const httpMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'][Math.floor(Math.random() * 5)] || 'unknown'
  const row: AccessLog = {
    id: i,
    url: ['/users', '/groups', '/roles', '/logs', '/files'][Math.floor(Math.random() * 5)] || 'unknown',
    httpMethod: httpMethod,
    params: ['GET'].includes(httpMethod) ? 'page=1' : (['PUT', 'PATCH', 'DELETE'].includes(httpMethod) ? 'id=1' : ''),
    ip: '192.168.0.1',
    body: ['POST', 'PUT', 'PATCH'].includes(httpMethod) ? '{"username":"test"}' : '',
    duration: Math.floor(Math.random() * 1000),
    statusCode: [200, 201, 400, 404, 500, 502][Math.floor(Math.random() * 6)] || 200,
    response: 'Non Content'
  }
  datas.push(row)
}

export const accessLogsHandlers = [
  http.get(`/api${SERVER_URL.ACCESS_LOG}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.ACCESS_LOG}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      page: {
        totalElements: datas.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.delete(`/api${SERVER_URL.ACCESS_LOG}/:id`, ({ params }) => {
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
    return HttpResponse.json()
  })
]

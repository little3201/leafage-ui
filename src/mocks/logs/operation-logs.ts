import { http, HttpResponse } from 'msw'
import { actionTypes, SERVER_URL } from 'src/constants'
import type { OperationLog } from 'src/types'
import { applyFilters } from '../util'

const datas: OperationLog[] = []

for (let i = 1; i < 28; i++) {
  const action = Object.keys(actionTypes)[Math.floor(Math.random() * Object.keys(actionTypes).length)]
  const row: OperationLog = {
    id: i,
    module: ['users', 'groups', 'roles', 'logs', 'files'][Math.floor(Math.random() * 5)] || 'unknown',
    action: action,
    params: ['retrieve'].includes(action) ? 'page=1' : (['preview', 'fetch', 'remove'].includes(action) ? 'id=1' : ''),
    ip: '192.168.0.1',
    body: ['create', 'modify', 'config'].includes(action) ? '{"username":"test"}' : '',
    sessionId: crypto.randomUUID(),
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    statusCode: [200, 201, 400, 404, 500, 502][Math.floor(Math.random() * 6)] || 200,
    operator: 'admin',
    operatedAt: new Date(),
  }
  datas.push(row)
}


export const operationLogsHandlers = [
  http.get(`/api${SERVER_URL.OPERATION_LOG}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.OPERATION_LOG}`, ({ request }) => {
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
    return HttpResponse.json()
  })
]

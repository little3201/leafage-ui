import { http, HttpResponse } from 'msw'
import { actionTypes, SERVER_URL } from 'src/constants'
import type { AuditLog } from 'src/types'


const datas: AuditLog[] = []

for (let i = 1; i < 28; i++) {
  const action = Object.keys(actionTypes)[Math.floor(Math.random() * Object.keys(actionTypes).length)]
  const row: AuditLog = {
    id: i,
    action: action,
    targetId: action !== 'create' ? i : undefined,
    module: ['users', 'groups', 'roles', 'logs', 'files'][Math.floor(Math.random() * 5)] || 'unknown',
    oldValue: ['create', 'modify', 'patch', 'relation', 'config'].includes(action) ? '{"theme:"light"}' : '',
    newValue: ['create', 'modify', 'patch', 'relation', 'config'].includes(action) ? '{"theme:"dark"}' : '',
    ip: '192.168.0.4',
    statusCode: [200, 201, 400, 404, 500, 502][Math.floor(Math.random() * 6)] || 200,
    duration: Math.floor(Math.random() * 1000),
  }
  datas.push(row)
}

export const auditLogsHandlers = [
  http.get(`/api${SERVER_URL.AUDIT_LOG}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.AUDIT_LOG}`, ({ request }) => {
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
  http.delete(`/api${SERVER_URL.AUDIT_LOG}/:id`, ({ params }) => {
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

    // Remove the Row from the "allRow" map.
    datas.pop()

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json()
  })
]
